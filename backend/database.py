"""
CropShock - Database Engine & Serving Layer Initializer
Provides high-performance asynchronous/synchronous connection pooling for PostgreSQL 16
with automatic local SQLite fallback for standalone development.
Synchronizes Gold Lakehouse datamarts into normalized indexed relational tables.
"""

import os
import sys

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import json
from datetime import datetime, timezone
from typing import Dict, Any, List
import pandas as pd
from sqlalchemy import (
    create_engine, Column, Integer, BigInteger, String, Float, Boolean,
    DateTime, Date, Text, UniqueConstraint, Index, func
)
from sqlalchemy.orm import declarative_base, sessionmaker, Session

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

ENV_DATABASE_URL = os.environ.get("DATABASE_URL")
LOCAL_SQLITE_URL = f"sqlite:///{os.path.join(PROJECT_ROOT, 'data', 'serving.db')}"

# Determine database engine
if ENV_DATABASE_URL and "postgresql" in ENV_DATABASE_URL:
    try:
        # Test if postgres is reachable
        test_engine = create_engine(ENV_DATABASE_URL, connect_args={"connect_timeout": 2})
        with test_engine.connect() as conn:
            pass
        DATABASE_URL = ENV_DATABASE_URL
        print("[DB] Connected to PostgreSQL 16 serving database.")
    except Exception:
        DATABASE_URL = LOCAL_SQLITE_URL
        print(f"[DB] PostgreSQL unreachable at {ENV_DATABASE_URL}. Using high-performance Local SQLite Serving DB: {DATABASE_URL}")
elif ENV_DATABASE_URL:
    DATABASE_URL = ENV_DATABASE_URL
else:
    DATABASE_URL = LOCAL_SQLITE_URL

engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Database Dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Database Models
class Market(Base):
    __tablename__ = "markets"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True)
    name = Column(String(100), nullable=False)
    district = Column(String(50), nullable=False, index=True)
    taluka = Column(String(50), nullable=False)
    zone = Column(String(50), nullable=False, index=True)
    state = Column(String(50), default="Gujarat")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation_m = Column(Integer, default=50)
    market_tier = Column(String(30), default="TIER_2_REGIONAL")
    catchment_villages_approx = Column(Integer, default=100)
    is_active = Column(Boolean, default=True)


class Commodity(Base):
    __tablename__ = "commodities"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True)
    name = Column(String(100), nullable=False)
    local_name_gu = Column(String(100), nullable=True)
    botanical_group = Column(String(50), nullable=False, index=True)
    perishability_tier = Column(String(30), nullable=False, index=True)
    ambient_shelf_life_days = Column(Integer, default=5)
    standard_unit = Column(String(20), default="₹/Quintal")
    baseline_min_price = Column(Float, nullable=False)
    baseline_max_price = Column(Float, nullable=False)


class MarketObservation(Base):
    __tablename__ = "market_observations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    market_id = Column(Integer, nullable=False, index=True)
    commodity_id = Column(Integer, nullable=False, index=True)
    observation_date = Column(String(10), nullable=False, index=True)
    min_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=False)
    modal_price = Column(Float, nullable=False)
    price_spread = Column(Float, nullable=False)
    arrival_quantity = Column(Float, nullable=False)
    price_unit = Column(String(20), default="₹/Quintal")
    arrival_unit = Column(String(10), default="MT")
    variety = Column(String(50), default="Common Hybrid / Desi")
    data_source = Column(String(50), default="AGMARKNET_OFFICIAL_ARCHIVE")
    is_synthetic = Column(Boolean, default=False)
    ingested_at = Column(String(50), nullable=True)

    __table_args__ = (
        UniqueConstraint("market_id", "commodity_id", "observation_date", name="uq_mkt_cmd_date"),
        Index("idx_mkt_date", "market_id", "observation_date"),
        Index("idx_cmd_date", "commodity_id", "observation_date"),
    )


class WeatherObservation(Base):
    __tablename__ = "weather_observations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    market_id = Column(Integer, nullable=False, index=True)
    observation_date = Column(String(10), nullable=False, index=True)
    precipitation_mm = Column(Float, default=0.0)
    temperature_max = Column(Float, default=32.0)
    temperature_min = Column(Float, default=20.0)
    wind_speed_max = Column(Float, default=12.0)
    data_source = Column(String(50), default="OPEN_METEO")
    is_synthetic = Column(Boolean, default=False)
    recorded_at = Column(String(50), nullable=True)

    __table_args__ = (
        UniqueConstraint("market_id", "observation_date", name="uq_mkt_weather_date"),
    )


class SupplyRiskResult(Base):
    __tablename__ = "supply_risk_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    market_id = Column(Integer, nullable=False, index=True)
    commodity_id = Column(Integer, nullable=False, index=True)
    calculation_date = Column(String(10), nullable=False, index=True)
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False, index=True)
    arrival_drop_pct = Column(Float, default=0.0)
    price_surge_pct = Column(Float, default=0.0)
    recent_rainfall_mm = Column(Float, default=0.0)
    explanation_factors = Column(Text, nullable=True)
    methodology_version = Column(String(20), default="v1.0-transparent")
    calculated_at = Column(String(50), nullable=True)

    __table_args__ = (
        Index("idx_risk_date_level", "calculation_date", "risk_level"),
    )


class SavedSchedule(Base):
    __tablename__ = "saved_schedules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_email = Column(String(100), nullable=False, index=True)
    user_role = Column(String(50), nullable=False, default="PROCUREMENT_MANAGER")
    commodity_id = Column(Integer, nullable=False)
    commodity_name = Column(String(100), nullable=False)
    source_mandi_id = Column(Integer, nullable=False)
    source_mandi_name = Column(String(100), nullable=False)
    destination_district = Column(String(100), nullable=False)
    quantity_mt = Column(Float, nullable=False)
    transport_rate_per_km_mt = Column(Float, default=4.5)
    modal_price_per_qtl = Column(Float, nullable=False)
    landed_cost_per_mt = Column(Float, nullable=False)
    total_outlay = Column(Float, nullable=False)
    arbitrage_savings = Column(Float, default=0.0)
    status = Column(String(30), default="ACTIVE")
    created_at = Column(String(50), nullable=False)

    __table_args__ = (
        Index("idx_schedule_user", "user_email", "created_at"),
    )


def init_db():
    """Initializes tables and seeds master catalogs."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # 1. Seed or update Markets
        with open(os.path.join(PROJECT_ROOT, "data", "catalogs", "gujarat_apmcs.json"), "r", encoding="utf-8") as f:
            mkts = json.load(f)
        existing_mkt_ids = set(r[0] for r in db.query(Market.id).all())
        new_markets = 0
        for m in mkts:
            if m["market_id"] not in existing_mkt_ids:
                db.add(Market(
                    id=m["market_id"],
                    code=m["code"],
                    name=m["name"],
                    district=m["district"],
                    taluka=m.get("taluka", m["district"]),
                    zone=m["zone"],
                    state=m.get("state", "Gujarat"),
                    latitude=m["latitude"],
                    longitude=m["longitude"],
                    elevation_m=m.get("elevation_m", 50),
                    market_tier=m.get("market_tier", "TIER_2_REGIONAL"),
                    catchment_villages_approx=m.get("catchment_villages_approx", 100),
                    is_active=m.get("is_active", True)
                ))
                new_markets += 1
        if new_markets > 0:
            db.commit()
            print(f"[DB] Initialized/added {new_markets} Gujarat APMC markets.")

        # 2. Seed or update Commodities
        with open(os.path.join(PROJECT_ROOT, "data", "catalogs", "vegetables.json"), "r", encoding="utf-8") as f:
            cmds = json.load(f)
        existing_cmd_ids = set(r[0] for r in db.query(Commodity.id).all())
        new_commodities = 0
        for c in cmds:
            if c["commodity_id"] not in existing_cmd_ids:
                db.add(Commodity(
                    id=c["commodity_id"],
                    code=c["code"],
                    name=c["name"],
                    local_name_gu=c.get("local_name_gu"),
                    botanical_group=c.get("botanical_group", "General"),
                    perishability_tier=c.get("perishability_tier", "MODERATELY_PERISHABLE"),
                    ambient_shelf_life_days=c.get("ambient_shelf_life_days", 5),
                    standard_unit=c.get("standard_unit", "₹/Quintal"),
                    baseline_min_price=c["baseline_min_price"],
                    baseline_max_price=c["baseline_max_price"]
                ))
                new_commodities += 1
        if new_commodities > 0:
            db.commit()
            print(f"[DB] Initialized/added {new_commodities} vegetable commodities.")
    finally:
        db.close()


def sync_gold_to_postgres() -> int:
    """Reads Gold Parquet datamart and syncs into serving tables."""
    init_db()
    gold_path = os.path.join(PROJECT_ROOT, "data", "lake", "gold", "gold_daily_market_aggregates.parquet")
    if not os.path.exists(gold_path):
        print(f"[DB] Gold parquet not found at {gold_path}. Run pipeline first.")
        return 0

    df_gold = pd.read_parquet(gold_path)
    db = SessionLocal()
    records_synced = 0
    try:
        # Wipe old rows for idempotency in standalone mode
        db.query(SupplyRiskResult).delete()
        db.query(MarketObservation).delete()
        db.commit()

        # Batch insert market observations
        obs_records = []
        risk_records = []
        now_str = datetime.now(timezone.utc).isoformat()

        for _, r in df_gold.iterrows():
            obs_records.append(MarketObservation(
                market_id=int(r["market_id"]),
                commodity_id=int(r["commodity_id"]),
                observation_date=str(r["observation_date"]),
                min_price=float(r["min_price"]),
                max_price=float(r["max_price"]),
                modal_price=float(r["modal_price"]),
                price_spread=float(r["price_spread"]),
                arrival_quantity=float(r["arrival_quantity"]),
                price_unit=str(r.get("price_unit", "₹/Quintal")),
                arrival_unit=str(r.get("arrival_unit", "MT")),
                variety=str(r.get("variety", "Common Hybrid")),
                data_source=str(r.get("data_source", "AGMARKNET_OFFICIAL_ARCHIVE")),
                is_synthetic=bool(r.get("is_synthetic", False)),
                ingested_at=now_str
            ))

            risk_records.append(SupplyRiskResult(
                market_id=int(r["market_id"]),
                commodity_id=int(r["commodity_id"]),
                calculation_date=str(r["observation_date"]),
                risk_score=float(r["risk_score"]),
                risk_level=str(r["risk_level"]),
                arrival_drop_pct=float(r.get("arrival_drop_pct", 0.0)),
                price_surge_pct=float(r.get("price_surge_pct", 0.0)),
                recent_rainfall_mm=float(r.get("recent_rainfall_3d_mm", 0.0)),
                explanation_factors=str(r.get("explanation_factors", "[]")),
                methodology_version="v1.0-transparent",
                calculated_at=now_str
            ))

        db.bulk_save_objects(obs_records)
        db.bulk_save_objects(risk_records)
        db.commit()
        records_synced = len(obs_records)
        print(f"[DB] Successfully synced {records_synced} Gold records into Serving Tables.")
    except Exception as e:
        db.rollback()
        print(f"[DB] Error syncing gold to database: {e}")
    finally:
        db.close()
    return records_synced


if __name__ == "__main__":
    init_db()
    sync_gold_to_postgres()
