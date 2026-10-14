"""
CropShock - Gold Layer Analytical Mart & Supply-Risk Scoring Engine
Computes 7-day, 14-day, 30-day rolling baselines, joins micro-climate weather anomalies,
evaluates explainable transparent supply-risk scores, and exports Power BI star-schema datamarts.
"""

import os
import sys
import json
import glob
from datetime import datetime, timezone
from typing import Dict, Any, List
import pandas as pd
import numpy as np
import pyarrow as pa
import pyarrow.parquet as pq

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

LAKE_DIR = os.path.join(PROJECT_ROOT, "data", "lake")
SILVER_FILE = os.path.join(LAKE_DIR, "silver", "market_observations", "silver_clean.parquet")
GOLD_DIR = os.path.join(LAKE_DIR, "gold")
POWERBI_DIR = os.path.join(GOLD_DIR, "powerbi_star_schema")

os.makedirs(GOLD_DIR, exist_ok=True)
os.makedirs(POWERBI_DIR, exist_ok=True)


class GoldTransformer:
    def __init__(self, lake_dir: str = LAKE_DIR):
        self.lake_dir = lake_dir
        self.gold_dir = os.path.join(lake_dir, "gold")
        self.powerbi_dir = os.path.join(self.gold_dir, "powerbi_star_schema")
        self.catalogs_dir = os.path.join(PROJECT_ROOT, "data", "catalogs")

    def _load_catalogs(self):
        with open(os.path.join(self.catalogs_dir, "gujarat_apmcs.json"), "r", encoding="utf-8") as f:
            markets = json.load(f)
        with open(os.path.join(self.catalogs_dir, "vegetables.json"), "r", encoding="utf-8") as f:
            commodities = json.load(f)
        return markets, commodities

    def run_gold_transformation(self) -> Dict[str, Any]:
        """
        Executes analytical datamart generation:
        1. Rolling baselines (MA_7, MA_14, MA_30, Volatility StdDev)
        2. Weather overlay and cumulative metrics
        3. Explainable multi-tier supply risk scoring
        4. Star schema exports for Power BI
        """
        if not os.path.exists(SILVER_FILE):
            return {"status": "SILVER_FILE_NOT_FOUND", "records": 0}

        df_silver = pq.read_table(SILVER_FILE).to_pandas()
        if df_silver.empty:
            return {"status": "EMPTY_SILVER_DATA", "records": 0}

        df_silver["observation_date"] = pd.to_datetime(df_silver["observation_date"])
        df_silver = df_silver.sort_values(by=["market_id", "commodity_id", "observation_date"])

        # 1. Price Spread Metric
        df_silver["price_spread"] = (df_silver["max_price"] - df_silver["min_price"]).round(2)

        # 2. Compute Rolling Baselines Window Functions per (market_id, commodity_id)
        df_silver = df_silver.sort_values(by=["market_id", "commodity_id", "observation_date"]).reset_index(drop=True)
        grouped = df_silver.groupby(["market_id", "commodity_id"])

        df_silver["ma_7_modal_price"] = grouped["modal_price"].transform(lambda s: s.rolling(7, min_periods=1).mean()).round(2)
        df_silver["ma_7_arrival_qty"] = grouped["arrival_quantity"].transform(lambda s: s.rolling(7, min_periods=1).mean()).round(2)
        df_silver["ma_14_modal_price"] = grouped["modal_price"].transform(lambda s: s.rolling(14, min_periods=1).mean()).round(2)
        df_silver["ma_14_arrival_qty"] = grouped["arrival_quantity"].transform(lambda s: s.rolling(14, min_periods=1).mean()).round(2)
        df_silver["ma_30_modal_price"] = grouped["modal_price"].transform(lambda s: s.rolling(30, min_periods=1).mean()).round(2)
        df_silver["std_7_modal_price"] = grouped["modal_price"].transform(lambda s: s.rolling(7, min_periods=1).std()).fillna(0.0).round(2)

        # Deviations vs 7-day Moving Average
        df_silver["arrival_drop_pct"] = (
            ((df_silver["arrival_quantity"] - df_silver["ma_7_arrival_qty"]) / df_silver["ma_7_arrival_qty"].replace(0, np.nan)) * 100
        ).fillna(0.0).round(2)

        df_silver["price_surge_pct"] = (
            ((df_silver["modal_price"] - df_silver["ma_7_modal_price"]) / df_silver["ma_7_modal_price"].replace(0, np.nan)) * 100
        ).fillna(0.0).round(2)

        df_baselines = df_silver

        # 3. Read Weather Datasets from Bronze
        weather_files = glob.glob(os.path.join(self.lake_dir, "bronze", "weather", "**", "*.parquet"), recursive=True)
        weather_dfs = []
        for wf in weather_files:
            try:
                weather_dfs.append(pq.read_table(wf).to_pandas())
            except Exception:
                pass

        if weather_dfs:
            df_weather = pd.concat(weather_dfs, ignore_index=True)
            df_weather["observation_date"] = pd.to_datetime(df_weather["observation_date"])
            df_weather = df_weather.sort_values(by=["market_id", "observation_date"])

            # Compute 3-day rolling rainfall
            df_weather["recent_rainfall_3d_mm"] = (
                df_weather.groupby("market_id")["precipitation_mm"]
                .rolling(window=3, min_periods=1)
                .sum()
                .round(2)
                .values
            )
            # Merge with market baselines
            df_joint = pd.merge(
                df_baselines,
                df_weather[["market_id", "observation_date", "precipitation_mm", "temperature_max", "recent_rainfall_3d_mm"]],
                on=["market_id", "observation_date"],
                how="left"
            )
        else:
            df_joint = df_baselines.copy()
            df_joint["precipitation_mm"] = 0.0
            df_joint["temperature_max"] = 32.0
            df_joint["recent_rainfall_3d_mm"] = 0.0

        df_joint["precipitation_mm"] = df_joint["precipitation_mm"].fillna(0.0)
        df_joint["temperature_max"] = df_joint["temperature_max"].fillna(32.0)
        df_joint["recent_rainfall_3d_mm"] = df_joint["recent_rainfall_3d_mm"].fillna(0.0)

        # 4. Explainable Transparent Supply-Risk Calculation
        _, commodities = self._load_catalogs()
        perishability_map = {c["commodity_id"]: c.get("perishability_tier", "MODERATELY_PERISHABLE") for c in commodities}

        risk_scores = []
        risk_levels = []
        explanation_vectors = []

        for _, row in df_joint.iterrows():
            c_id = row["commodity_id"]
            p_tier = perishability_map.get(c_id, "MODERATELY_PERISHABLE")

            # Calibrate weights by perishability tier
            if p_tier == "HIGHLY_PERISHABLE":
                w_a, w_p, w_w = 0.50, 0.30, 0.20
            elif p_tier == "SEMI_PERISHABLE":
                w_a, w_p, w_w = 0.35, 0.45, 0.20
            else:
                w_a, w_p, w_w = 0.45, 0.35, 0.20

            # Arrival Sub-Score (S_A)
            arr_drop = row["arrival_drop_pct"]
            if arr_drop <= -50.0:
                s_a = 100.0
            elif -50.0 < arr_drop <= -25.0:
                s_a = 70.0
            elif -25.0 < arr_drop <= -10.0:
                s_a = 40.0
            else:
                s_a = 10.0

            # Price Sub-Score (S_P)
            prc_surge = row["price_surge_pct"]
            if prc_surge >= 40.0:
                s_p = 100.0
            elif 20.0 <= prc_surge < 40.0:
                s_p = 70.0
            elif 10.0 <= prc_surge < 20.0:
                s_p = 40.0
            else:
                s_p = 10.0

            # Weather Sub-Score (S_W)
            rain_3d = row["recent_rainfall_3d_mm"]
            t_max = row["temperature_max"]

            if rain_3d > 50.0:
                s_w = 85.0
            elif rain_3d > 20.0:
                s_w = 55.0
            elif t_max >= 41.0:
                s_w = 75.0
            else:
                s_w = 15.0

            # Composite Score
            final_score = round((w_a * s_a) + (w_p * s_p) + (w_w * s_w), 1)
            risk_scores.append(final_score)

            if final_score >= 70.0:
                level = "HIGH"
            elif final_score >= 35.0:
                level = "MODERATE"
            else:
                level = "LOW"
            risk_levels.append(level)

            # Component explanation factors
            factors = []
            if arr_drop <= -25.0:
                factors.append(f"Arrival volume contracted by {abs(arr_drop):.1f}% vs 7-day baseline")
            if prc_surge >= 20.0:
                factors.append(f"Modal price surged by +{prc_surge:.1f}% vs 7-day baseline")
            if rain_3d > 25.0:
                factors.append(f"Recent cumulative rainfall of {rain_3d:.1f}mm associated with harvest and cartage delay")
            if t_max >= 40.0:
                factors.append(f"Elevated ambient temperature ({t_max:.1f}°C) associated with post-harvest spoilage risk")
            if not factors:
                factors.append("Market arrivals and trading prices are operating within normal seasonal boundaries")

            explanation_vectors.append(json.dumps(factors))

        df_joint["risk_score"] = risk_scores
        df_joint["risk_level"] = risk_levels
        df_joint["explanation_factors"] = explanation_vectors
        df_joint["observation_date"] = df_joint["observation_date"].dt.strftime("%Y-%m-%d")

        # 5. Save Gold Datamarts
        gold_aggregates_file = os.path.join(self.gold_dir, "gold_daily_market_aggregates.parquet")
        gold_table = pa.Table.from_pandas(df_joint)
        pq.write_table(gold_table, gold_aggregates_file, compression="SNAPPY")

        # 6. Generate Power BI Star Schema Flat Exports
        markets, commodities = self._load_catalogs()
        df_dim_market = pd.DataFrame(markets)
        df_dim_commodity = pd.DataFrame(commodities)

        df_dim_market.to_csv(os.path.join(self.powerbi_dir, "Dim_Market.csv"), index=False, encoding="utf-8")
        df_dim_commodity.to_csv(os.path.join(self.powerbi_dir, "Dim_Commodity.csv"), index=False, encoding="utf-8")

        # Fact Market Arrivals & Prices
        fact_cols = [
            "market_id", "commodity_id", "observation_date", "min_price", "max_price",
            "modal_price", "price_spread", "arrival_quantity", "ma_7_modal_price",
            "ma_7_arrival_qty", "ma_30_modal_price", "std_7_modal_price",
            "risk_score", "risk_level"
        ]
        df_fact = df_joint[fact_cols].copy()
        df_fact.to_csv(os.path.join(self.powerbi_dir, "Fact_Market_Arrivals.csv"), index=False, encoding="utf-8")
        pq.write_table(pa.Table.from_pandas(df_fact), os.path.join(self.powerbi_dir, "Fact_Market_Arrivals.parquet"), compression="SNAPPY")

        return {
            "status": "GOLD_TRANSFORMATION_SUCCESS",
            "total_records_processed": len(df_joint),
            "high_risk_alerts_count": int((df_joint["risk_level"] == "HIGH").sum()),
            "moderate_risk_count": int((df_joint["risk_level"] == "MODERATE").sum()),
            "low_risk_count": int((df_joint["risk_level"] == "LOW").sum()),
            "gold_aggregates_parquet": gold_aggregates_file,
            "powerbi_exports_dir": self.powerbi_dir
        }


if __name__ == "__main__":
    transformer = GoldTransformer()
    res = transformer.run_gold_transformation()
    print("Gold Transformation Result:")
    print(json.dumps(res, indent=2))
