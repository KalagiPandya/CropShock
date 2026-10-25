"""
CropShock - Apache Airflow Production Pipeline DAG
Scheduled daily at 18:00 IST (12:30 UTC) following APMC mandi closing declarations.
Orchestrates Bronze Ingestion -> Silver Deduplication & Cleaning -> Data Quality Gate ->
Gold Datamart Aggregations -> PostgreSQL Serving Sync -> Hadoop HDFS Replication.
"""

from datetime import datetime, timedelta
import os
import sys

# Airflow standard import guard
try:
    from airflow import DAG
    from airflow.operators.python import PythonOperator
    from airflow.operators.bash import BashOperator
    HAS_AIRFLOW = True
except ImportError:
    HAS_AIRFLOW = False

# Ensure CropShock project modules are importable
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


def task_ingest_bronze_func(**kwargs):
    from ingestion.seed_generator import generate_market_observations
    from ingestion.bronze_writer import BronzeWriter
    
    execution_date = kwargs.get("ds", datetime.utcnow().strftime("%Y-%m-%d"))
    print(f"[AIRFLOW] Ingesting Bronze APMC observations for {execution_date}...")
    obs = generate_market_observations(start_date=execution_date, end_date=execution_date)
    writer = BronzeWriter()
    res = writer.ingest_market_batch(obs)
    print(f"[AIRFLOW] Bronze Ingested: {res.get('record_count', 0)} rows.")
    return res


def task_ingest_weather_func(**kwargs):
    from ingestion.open_meteo_client import OpenMeteoClient
    from ingestion.bronze_writer import BronzeWriter
    import json
    
    execution_date = kwargs.get("ds", datetime.utcnow().strftime("%Y-%m-%d"))
    catalogs_path = os.path.join(PROJECT_ROOT, "data", "catalogs", "gujarat_apmcs.json")
    with open(catalogs_path, "r", encoding="utf-8") as f:
        markets = json.load(f)
        
    client = OpenMeteoClient()
    writer = BronzeWriter()
    
    total_weather_rows = 0
    # Process primary markets
    for m in markets[:10]:
        w_obs = client.fetch_historical_weather(m["latitude"], m["longitude"], execution_date, execution_date)
        res = writer.ingest_weather_batch(w_obs, market_id=m["market_id"])
        total_weather_rows += res.get("record_count", 0)
        
    print(f"[AIRFLOW] Weather Ingested: {total_weather_rows} records across active Gujarat APMCs.")
    return total_weather_rows


def task_silver_transform_func(**kwargs):
    from pipeline.silver_transformer import SilverTransformer
    print("[AIRFLOW] Executing Silver deduplication and data quality validation...")
    transformer = SilverTransformer()
    res = transformer.run_market_transformation()
    print(f"[AIRFLOW] Silver Clean Records: {res.get('clean_silver_records', 0)}")
    return res


def task_quality_gate_func(**kwargs):
    ti = kwargs["ti"]
    silver_meta = ti.xcom_pull(task_ids="task_silver_transform") or {}
    pass_rate = silver_meta.get("quality_pass_rate_pct", 100.0)
    quarantined = silver_meta.get("quarantined_records", 0)
    
    print(f"[AIRFLOW-GATE] Checking Quality: Pass Rate={pass_rate}%, Quarantined={quarantined}")
    if pass_rate < 90.0:
        raise ValueError(f"Quality gate breached! Pass rate {pass_rate}% is below 90% threshold.")
    print("[AIRFLOW-GATE] Quality gate passed successfully!")
    return True


def task_gold_transform_func(**kwargs):
    from pipeline.gold_transformer import GoldTransformer
    print("[AIRFLOW] Computing Gold rolling baselines and supply-risk scores...")
    transformer = GoldTransformer()
    res = transformer.run_gold_transformation()
    print(f"[AIRFLOW] Gold Mart Ready: {res.get('total_records_processed', 0)} rows.")
    return res


def task_publish_postgres_func(**kwargs):
    from backend.database import sync_gold_to_postgres
    print("[AIRFLOW] Synchronizing Gold Mart into PostgreSQL Serving Layer...")
    count = sync_gold_to_postgres()
    print(f"[AIRFLOW] Serving Sync Complete: {count} records loaded.")
    return count


def task_sync_hdfs_func(**kwargs):
    from pipeline.hdfs_manager import HDFSManager
    print("[AIRFLOW] Replicating Gold Parquet datamarts to Hadoop HDFS...")
    manager = HDFSManager()
    res = manager.sync_local_lake_to_hdfs("gold")
    print(f"[AIRFLOW] HDFS Sync Status: {res.get('status')}")
    return res


# Define Airflow DAG if Airflow is installed
if HAS_AIRFLOW:
    default_args = {
        "owner": "cropshock_data_engineer",
        "depends_on_past": False,
        "email_on_failure": False,
        "email_on_retry": False,
        "retries": 3,
        "retry_delay": timedelta(minutes=5),
    }

    dag = DAG(
        "cropshock_gujarat_daily_pipeline",
        default_args=default_args,
        description="End-to-end Big Data Ingestion, PySpark/Silver Transform, Quality Gate, and Postgres Sync",
        schedule_interval="30 12 * * *",  # 18:00 IST daily
        start_date=datetime(2026, 8, 1),
        catchup=False,
        tags=["cropshock", "gujarat", "apmc", "bigdata", "pyspark", "hdfs"]
    )

    t_ingest_agmarknet = PythonOperator(
        task_id="task_ingest_agmarknet_bronze",
        python_callable=task_ingest_bronze_func,
        dag=dag,
    )

    t_ingest_weather = PythonOperator(
        task_id="task_ingest_weather_bronze",
        python_callable=task_ingest_weather_func,
        dag=dag,
    )

    t_silver_transform = PythonOperator(
        task_id="task_silver_transform",
        python_callable=task_silver_transform_func,
        dag=dag,
    )

    t_quality_gate = PythonOperator(
        task_id="task_data_quality_gate",
        python_callable=task_quality_gate_func,
        dag=dag,
    )

    t_gold_transform = PythonOperator(
        task_id="task_gold_transform",
        python_callable=task_gold_transform_func,
        dag=dag,
    )

    t_publish_postgres = PythonOperator(
        task_id="task_publish_postgres",
        python_callable=task_publish_postgres_func,
        dag=dag,
    )

    t_sync_hdfs = PythonOperator(
        task_id="task_sync_hadoop_hdfs",
        python_callable=task_sync_hdfs_func,
        dag=dag,
    )

    # Dependency Pipeline Graph
    [t_ingest_agmarknet, t_ingest_weather] >> t_silver_transform >> t_quality_gate >> t_gold_transform >> [t_publish_postgres, t_sync_hdfs]


if __name__ == "__main__":
    print("Testing Pipeline Execution locally (Airflow Simulator Mode)...")
    res_silver = task_silver_transform_func()
    res_gold = task_gold_transform_func()
    res_hdfs = task_sync_hdfs_func()
    print("Local Pipeline Simulation Finished Successfully!")
