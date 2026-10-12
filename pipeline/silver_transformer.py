"""
CropShock - Silver Layer Transformation Engine
Reads raw Bronze batches, deduplicates on (market_id, commodity_id, observation_date),
enforces data quality bounds, quarantines anomalous records, logs audit telemetry,
and writes clean standardized Parquet to the Silver Data Lake.
"""

import os
import sys
import glob
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Tuple
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

LAKE_DIR = os.path.join(PROJECT_ROOT, "data", "lake")
BRONZE_DIR = os.path.join(LAKE_DIR, "bronze")
SILVER_DIR = os.path.join(LAKE_DIR, "silver")
QUARANTINE_DIR = os.path.join(LAKE_DIR, "silver_quarantine")
AUDIT_DIR = os.path.join(SILVER_DIR, "audit_logs")

os.makedirs(SILVER_DIR, exist_ok=True)
os.makedirs(QUARANTINE_DIR, exist_ok=True)
os.makedirs(AUDIT_DIR, exist_ok=True)


class SilverTransformer:
    def __init__(self, lake_dir: str = LAKE_DIR):
        self.lake_dir = lake_dir
        self.bronze_dir = os.path.join(lake_dir, "bronze")
        self.silver_dir = os.path.join(lake_dir, "silver")
        self.quarantine_dir = os.path.join(lake_dir, "silver_quarantine")
        self.audit_dir = os.path.join(self.silver_dir, "audit_logs")

    def run_market_transformation(self) -> Dict[str, Any]:
        """
        Processes all bronze market parquet batches into silver clean dataset.
        """
        search_pattern = os.path.join(self.bronze_dir, "agmarknet", "**", "*.parquet")
        parquet_files = glob.glob(search_pattern, recursive=True)

        if not parquet_files:
            return {"status": "NO_BRONZE_FILES_FOUND", "clean_records": 0}

        # 1. Read all Bronze Parquet partitions
        dfs = []
        for p in parquet_files:
            try:
                table = pq.read_table(p)
                dfs.append(table.to_pandas())
            except Exception as e:
                print(f"[WARN] Error reading bronze file {p}: {e}")

        if not dfs:
            return {"status": "NO_VALID_DATA_READ", "clean_records": 0}

        df_raw = pd.concat(dfs, ignore_index=True)
        total_bronze_records = len(df_raw)

        # 2. Deduplication on composite natural key: (market_id, commodity_id, observation_date)
        # Sort by _ingested_at descending to retain latest observation
        if "_ingested_at" in df_raw.columns:
            df_raw = df_raw.sort_values(by="_ingested_at", ascending=False)
        df_dedup = df_raw.drop_duplicates(subset=["market_id", "commodity_id", "observation_date"], keep="first")
        dedup_dropped = total_bronze_records - len(df_dedup)

        # 3. Unit and Type Standardization
        df_dedup["min_price"] = pd.to_numeric(df_dedup["min_price"], errors="coerce")
        df_dedup["max_price"] = pd.to_numeric(df_dedup["max_price"], errors="coerce")
        df_dedup["modal_price"] = pd.to_numeric(df_dedup["modal_price"], errors="coerce")
        df_dedup["arrival_quantity"] = pd.to_numeric(df_dedup["arrival_quantity"], errors="coerce")
        df_dedup["observation_date"] = pd.to_datetime(df_dedup["observation_date"]).dt.strftime("%Y-%m-%d")

        # 4. Outlier & Sanity Constraints
        # Rule 1: All prices > 0 and arrival_quantity >= 0
        valid_positives = (
            (df_dedup["min_price"] > 0) &
            (df_dedup["modal_price"] > 0) &
            (df_dedup["max_price"] > 0) &
            (df_dedup["arrival_quantity"] >= 0)
        )

        # Rule 2: Price hierarchy: min_price <= modal_price <= max_price
        valid_hierarchy = (
            (df_dedup["min_price"] <= df_dedup["modal_price"] + 1e-4) &
            (df_dedup["modal_price"] <= df_dedup["max_price"] + 1e-4)
        )

        # Rule 3: Dynamic upper price bounds (vegetables normal range <= 25,000 ₹/Qtl)
        valid_upper_bound = (df_dedup["max_price"] <= 30000.0)

        clean_mask = valid_positives & valid_hierarchy & valid_upper_bound
        df_clean = df_dedup[clean_mask].copy()
        df_quarantine = df_dedup[~clean_mask].copy()

        # Add quarantine flags
        if len(df_quarantine) > 0:
            df_quarantine["quarantine_reason"] = "FAILED_SANITY_CHECK"
            quarantine_path = os.path.join(self.quarantine_dir, f"quarantine_{int(datetime.now().timestamp())}.parquet")
            q_table = pa.Table.from_pandas(df_quarantine)
            pq.write_table(q_table, quarantine_path, compression="SNAPPY")

        # 5. Compute Column Null Percentages for Data Quality Telemetry
        null_rates = (df_clean.isnull().mean() * 100).to_dict()

        # 6. Save Clean Standardized Silver Dataset partitioned by year/month
        df_clean["year"] = pd.to_datetime(df_clean["observation_date"]).dt.year
        df_clean["month"] = pd.to_datetime(df_clean["observation_date"]).dt.strftime("%m")

        output_silver_file = os.path.join(self.silver_dir, "market_observations", "silver_clean.parquet")
        os.makedirs(os.path.dirname(output_silver_file), exist_ok=True)
        silver_table = pa.Table.from_pandas(df_clean)
        pq.write_table(silver_table, output_silver_file, compression="SNAPPY")

        # 7. Write Data Quality Audit Log
        run_id = str(uuid.uuid4())
        audit_log = {
            "run_id": run_id,
            "executed_at": datetime.now(timezone.utc).isoformat(),
            "total_bronze_records": total_bronze_records,
            "deduplication_dropped": dedup_dropped,
            "clean_silver_records": len(df_clean),
            "quarantined_records": len(df_quarantine),
            "column_null_rates_pct": {k: round(v, 3) for k, v in null_rates.items()},
            "quality_pass_rate_pct": round(len(df_clean) / max(1, len(df_dedup)) * 100, 2),
            "silver_output_path": output_silver_file
        }

        audit_path = os.path.join(self.audit_dir, f"audit_{run_id}.json")
        with open(audit_path, "w", encoding="utf-8") as f:
            json.dump(audit_log, f, indent=2)

        return audit_log


if __name__ == "__main__":
    transformer = SilverTransformer()
    res = transformer.run_market_transformation()
    print("Silver Transformation Result:")
    print(json.dumps(res, indent=2))
