"""
CropShock - PySpark Distributed Medallion Pipeline Job
Submittable script for Apache Spark on Hadoop clusters:
spark-submit --master local[*] pipeline/spark_medallion_job.py
Reads Bronze Parquet from HDFS or local filesystem, deduplicates,
applies window partitioned moving averages over (market_id, commodity_id),
and writes clean Gold datamarts to HDFS.
"""

import sys
import os

try:
    from pyspark.sql import SparkSession
    from pyspark.sql import functions as F
    from pyspark.sql.window import Window
    HAS_PYSPARK = True
except ImportError:
    HAS_PYSPARK = False


def create_spark_session(app_name: str = "CropShock-Medallion-ETL"):
    builder = SparkSession.builder \
        .appName(app_name) \
        .config("spark.sql.shuffle.partitions", "4") \
        .config("spark.sql.adaptive.enabled", "true")
    
    # Configure HDFS default FS if provided
    hdfs_url = os.environ.get("HDFS_NAMENODE_URL")
    if hdfs_url:
        builder = builder.config("spark.hadoop.fs.defaultFS", hdfs_url)
        
    return builder.getOrCreate()


def run_spark_pipeline(bronze_path: str, silver_path: str, gold_path: str):
    if not HAS_PYSPARK:
        print("[INFO] PySpark library not currently loaded in this environment. Falling back to local pipeline.")
        from pipeline.silver_transformer import SilverTransformer
        from pipeline.gold_transformer import GoldTransformer
        SilverTransformer().run_market_transformation()
        GoldTransformer().run_gold_transformation()
        return

    spark = create_spark_session()
    print(f"[SPARK] Reading Bronze Parquet from {bronze_path}...")
    df_bronze = spark.read.parquet(bronze_path)

    # 1. Silver Transformation: Deduplicate & Clean
    print("[SPARK] Performing Deduplication on (market_id, commodity_id, observation_date)...")
    window_dedup = Window.partitionBy("market_id", "commodity_id", "observation_date").orderBy(F.col("_ingested_at").desc())
    df_silver = df_bronze.withColumn("row_num", F.row_number().over(window_dedup)) \
                         .filter(F.col("row_num") == 1) \
                         .drop("row_num")

    # Filter sanity bounds
    df_silver_clean = df_silver.filter(
        (F.col("min_price") > 0) &
        (F.col("modal_price") >= F.col("min_price")) &
        (F.col("max_price") >= F.col("modal_price")) &
        (F.col("arrival_quantity") >= 0)
    )

    print(f"[SPARK] Writing Silver Parquet to {silver_path}...")
    df_silver_clean.write.mode("overwrite").parquet(silver_path)

    # 2. Gold Transformation: Rolling Baselines Window Specification
    # Partitioned by (market_id, commodity_id) ordered by observation_date
    print("[SPARK] Computing Window Partitioned Rolling Averages...")
    w7 = Window.partitionBy("market_id", "commodity_id").orderBy("observation_date").rowsBetween(-6, 0)
    w14 = Window.partitionBy("market_id", "commodity_id").orderBy("observation_date").rowsBetween(-13, 0)
    w30 = Window.partitionBy("market_id", "commodity_id").orderBy("observation_date").rowsBetween(-29, 0)

    df_gold = df_silver_clean \
        .withColumn("price_spread", F.round(F.col("max_price") - F.col("min_price"), 2)) \
        .withColumn("ma_7_modal_price", F.round(F.avg("modal_price").over(w7), 2)) \
        .withColumn("ma_7_arrival_qty", F.round(F.avg("arrival_quantity").over(w7), 2)) \
        .withColumn("ma_14_modal_price", F.round(F.avg("modal_price").over(w14), 2)) \
        .withColumn("ma_14_arrival_qty", F.round(F.avg("arrival_quantity").over(w14), 2)) \
        .withColumn("ma_30_modal_price", F.round(F.avg("modal_price").over(w30), 2)) \
        .withColumn("std_7_modal_price", F.round(F.stddev("modal_price").over(w7), 2))

    # Compute Shock Deviations
    df_gold = df_gold \
        .withColumn("arrival_drop_pct", F.round(((F.col("arrival_quantity") - F.col("ma_7_arrival_qty")) / F.col("ma_7_arrival_qty")) * 100, 2)) \
        .withColumn("price_surge_pct", F.round(((F.col("modal_price") - F.col("ma_7_modal_price")) / F.col("ma_7_modal_price")) * 100, 2))

    # Evaluate Supply Risk Tier
    df_gold = df_gold.withColumn(
        "risk_level",
        F.when((F.col("arrival_drop_pct") <= -40.0) | (F.col("price_surge_pct") >= 30.0), "HIGH")
         .when((F.col("arrival_drop_pct") <= -20.0) | (F.col("price_surge_pct") >= 15.0), "MODERATE")
         .otherwise("LOW")
    )

    print(f"[SPARK] Writing Gold Mart to {gold_path}...")
    df_gold.write.mode("overwrite").parquet(gold_path)
    print("[SPARK] Medallion Pipeline Execution Complete!")
    spark.stop()


if __name__ == "__main__":
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    bronze = os.path.join(project_root, "data", "lake", "bronze", "agmarknet")
    silver = os.path.join(project_root, "data", "lake", "silver", "spark_clean")
    gold = os.path.join(project_root, "data", "lake", "gold", "spark_gold_mart")
    run_spark_pipeline(bronze, silver, gold)
