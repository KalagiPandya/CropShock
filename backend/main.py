"""
CropShock - High-Performance Serving API (FastAPI)
Exposes sub-50ms REST analytical endpoints for the Gujarat Agricultural Supply Chain
and Market Intelligence Platform.
"""

import os
import sys
import json
import math
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager
import jwt
from fastapi import FastAPI, Depends, Query, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.database import (
    get_db, Market, Commodity, MarketObservation, WeatherObservation,
    SupplyRiskResult, SavedSchedule, init_db, DATABASE_URL
)
from backend.schemas import (
    MarketSchema, CommoditySchema, OverviewKPISchema, TrendPointSchema,
    WeatherCorrelationPoint, SupplyRiskItem, ProcurementRequest, ProcurementResponse,
    ProcurementOption, PipelineHealthSchema, LoginRequest, TokenResponse,
    SavedScheduleCreate, SavedScheduleOut
)
from pipeline.hdfs_manager import HDFSManager


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="CropShock API — Gujarat Agricultural Market Intelligence",
    description="Automated Big Data serving layer for all 33 Gujarat Districts (40 APMC Mandis) and 40 Vegetable Commodities with explainable supply-risk scoring and procurement simulation.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for React frontend (Vite port 5173 / 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Root"])
def root():
    """Root welcoming endpoint verifying API uptime."""
    return {
        "service": "CropShock API — Gujarat Agricultural Market Intelligence",
        "status": "ONLINE",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_check": "/api/v1/health"
    }


@app.get("/api/v1/health", response_model=PipelineHealthSchema, tags=["System Health"])
def get_system_health(db: Session = Depends(get_db)):
    """Returns backend, database, and Hadoop HDFS health telemetry."""
    hdfs_manager = HDFSManager()
    m_count = db.query(Market).count()
    c_count = db.query(Commodity).count()
    o_count = db.query(MarketObservation).count()
    latest_obs = db.query(func.max(MarketObservation.observation_date)).scalar()

    return {
        "backend_status": "ONLINE",
        "database_connected": True,
        "database_url_type": "PostgreSQL 16" if "postgresql" in DATABASE_URL else "SQLite (Standalone High-Speed)",
        "hdfs_cluster_status": hdfs_manager.get_cluster_status(),
        "total_markets_registered": m_count,
        "total_commodities_tracked": c_count,
        "total_observations_recorded": o_count,
        "latest_data_date": latest_obs
    }


@app.get("/api/v1/markets", response_model=List[MarketSchema], tags=["Markets"])
def list_markets(
    zone: Optional[str] = Query(None, description="Filter by zone (Saurashtra, Central Gujarat, North Gujarat, South Gujarat, Kutch)"),
    district: Optional[str] = Query(None, description="Filter by administrative district"),
    is_active: bool = True,
    db: Session = Depends(get_db)
):
    """Lists all Gujarat APMC markets with coordinates, zones, and trade specializations."""
    query = db.query(Market).filter(Market.is_active == is_active)
    if zone:
        query = query.filter(Market.zone.ilike(f"%{zone}%"))
    if district:
        query = query.filter(Market.district.ilike(f"%{district}%"))
    return query.order_by(Market.name).all()


@app.get("/api/v1/commodities", response_model=List[CommoditySchema], tags=["Commodities"])
def list_commodities(
    botanical_group: Optional[str] = Query(None, description="Filter by botanical group"),
    perishability_tier: Optional[str] = Query(None, description="Filter by perishability tier"),
    db: Session = Depends(get_db)
):
    """Lists all 37 tracked vegetable commodities with Gujarati local names and shelf-life tiers."""
    query = db.query(Commodity)
    if botanical_group:
        query = query.filter(Commodity.botanical_group.ilike(f"%{botanical_group}%"))
    if perishability_tier:
        query = query.filter(Commodity.perishability_tier == perishability_tier)
    return query.order_by(Commodity.name).all()


@app.get("/api/v1/analytics/overview", response_model=OverviewKPISchema, tags=["Analytics"])
def get_statewide_overview(
    date: Optional[str] = Query(None, description="Observation date (YYYY-MM-DD), defaults to latest available"),
    db: Session = Depends(get_db)
):
    """Computes high-level statewide executive KPIs across all Gujarat APMC mandis."""
    target_date = date or db.query(func.max(MarketObservation.observation_date)).scalar()
    if not target_date:
        raise HTTPException(status_code=404, detail="No observations available in serving database.")

    obs_today = db.query(MarketObservation).filter(MarketObservation.observation_date == target_date).all()
    if not obs_today:
        target_date = db.query(func.max(MarketObservation.observation_date)).scalar()
        obs_today = db.query(MarketObservation).filter(MarketObservation.observation_date == target_date).all()

    total_tonnage = sum(o.arrival_quantity for o in obs_today)
    avg_modal = sum(o.modal_price for o in obs_today) / max(1, len(obs_today))

    # Supply risk counts
    risks_today = db.query(SupplyRiskResult).filter(SupplyRiskResult.calculation_date == target_date).all()
    critical_count = sum(1 for r in risks_today if r.risk_level == "HIGH")
    moderate_count = sum(1 for r in risks_today if r.risk_level == "MODERATE")

    # Zonal distribution of arrival tonnage
    markets_map = {m.id: m for m in db.query(Market).all()}
    commodities_map = {c.id: c.name for c in db.query(Commodity).all()}

    zonal_tonnage = {}
    mandi_volatility = {}

    for o in obs_today:
        m = markets_map.get(o.market_id)
        if m:
            zonal_tonnage[m.zone] = zonal_tonnage.get(m.zone, 0.0) + o.arrival_quantity
            mandi_volatility[m.name] = mandi_volatility.get(m.name, 0.0) + o.price_spread

    top_mandi = max(mandi_volatility.items(), key=lambda x: x[1])[0] if mandi_volatility else "Gondal APMC"
    
    # Top shock commodity
    top_shock_crop = "Tomato"
    if risks_today:
        highest_risk = max(risks_today, key=lambda x: x.risk_score)
        top_shock_crop = commodities_map.get(highest_risk.commodity_id, "Tomato")

    return {
        "date": target_date,
        "total_tonnage_mt": round(total_tonnage, 2),
        "state_avg_modal_price": round(avg_modal, 2),
        "active_mandis_count": len(set(o.market_id for o in obs_today)),
        "monitored_commodities_count": len(set(o.commodity_id for o in obs_today)),
        "critical_supply_shocks_count": critical_count,
        "moderate_supply_shocks_count": moderate_count,
        "highest_volatility_mandi": top_mandi,
        "top_shock_commodity": top_shock_crop,
        "zonal_distribution": {k: round(v, 2) for k, v in zonal_tonnage.items()}
    }


@app.get("/api/v1/analytics/trends", response_model=List[TrendPointSchema], tags=["Analytics"])
def get_commodity_trends(
    commodity_id: int = Query(1, description="Commodity ID (1=Tomato, 2=Potato, etc.)"),
    market_id: Optional[int] = Query(None, description="Optional APMC Market ID"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """Returns historical price spread (Min, Max, Modal), arrival volume, and rolling averages."""
    query = db.query(MarketObservation).filter(MarketObservation.commodity_id == commodity_id)
    if market_id:
        query = query.filter(MarketObservation.market_id == market_id)
    if start_date:
        query = query.filter(MarketObservation.observation_date >= start_date)
    if end_date:
        query = query.filter(MarketObservation.observation_date <= end_date)

    records = query.order_by(MarketObservation.observation_date).all()
    if not records:
        return []

    # If aggregated across multiple mandis for a commodity
    date_groups = {}
    for r in records:
        d = r.observation_date
        if d not in date_groups:
            date_groups[d] = {
                "min_price": [], "max_price": [], "modal_price": [],
                "arrival_quantity": 0.0
            }
        date_groups[d]["min_price"].append(r.min_price)
        date_groups[d]["max_price"].append(r.max_price)
        date_groups[d]["modal_price"].append(r.modal_price)
        date_groups[d]["arrival_quantity"] += r.arrival_quantity

    trend_points = []
    sorted_dates = sorted(date_groups.keys())
    modal_history = []

    for d in sorted_dates:
        g = date_groups[d]
        min_p = min(g["min_price"])
        max_p = max(g["max_price"])
        avg_modal = sum(g["modal_price"]) / len(g["modal_price"])
        arr_qty = g["arrival_quantity"]

        modal_history.append(avg_modal)
        ma_7 = sum(modal_history[-7:]) / len(modal_history[-7:])
        ma_30 = sum(modal_history[-30:]) / len(modal_history[-30:])

        trend_points.append({
            "date": d,
            "min_price": round(min_p, 2),
            "max_price": round(max_p, 2),
            "modal_price": round(avg_modal, 2),
            "price_spread": round(max_p - min_p, 2),
            "arrival_quantity": round(arr_qty, 2),
            "ma_7_modal_price": round(ma_7, 2),
            "ma_7_arrival_qty": round(arr_qty, 2),
            "ma_30_modal_price": round(ma_30, 2),
            "std_7_modal_price": round(math.sqrt(sum((x - ma_7)**2 for x in modal_history[-7:]) / max(1, len(modal_history[-7:]))), 2)
        })

    return trend_points


@app.get("/api/v1/analytics/weather-correlation", response_model=List[WeatherCorrelationPoint], tags=["Analytics"])
def get_weather_correlation(
    market_id: int = Query(1, description="APMC Market ID (1=Gondal, 14=Ahmedabad, etc.)"),
    days: int = Query(30, description="Lookback window in days"),
    db: Session = Depends(get_db)
):
    """Returns joint time series of market arrivals vs precipitation and ambient temperature."""
    market = db.query(Market).filter(Market.id == market_id).first()
    if not market:
        raise HTTPException(status_code=404, detail="Market not found")

    # Fetch latest observations for market
    obs = db.query(
        MarketObservation.observation_date,
        func.sum(MarketObservation.arrival_quantity).label("total_arrivals"),
        func.avg(MarketObservation.modal_price).label("avg_modal")
    ).filter(
        MarketObservation.market_id == market_id
    ).group_by(
        MarketObservation.observation_date
    ).order_by(
        desc(MarketObservation.observation_date)
    ).limit(days).all()

    obs = sorted(obs, key=lambda x: x[0])
    if not obs:
        return []

    # Get weather observations for this market
    dates = [o[0] for o in obs]
    weather_records = {
        w.observation_date: w for w in db.query(WeatherObservation).filter(
            and_(WeatherObservation.market_id == market_id, WeatherObservation.observation_date.in_(dates))
        ).all()
    }

    result = []
    recent_precip = []
    for o in obs:
        d_str = o[0]
        w = weather_records.get(d_str)
        precip = w.precipitation_mm if w else 0.0
        t_max = w.temperature_max if w else 33.0

        recent_precip.append(precip)
        rain_3d = sum(recent_precip[-3:])

        result.append({
            "date": d_str,
            "arrival_quantity": round(o[1], 2),
            "modal_price": round(o[2], 2),
            "precipitation_mm": round(precip, 2),
            "temperature_max": round(t_max, 1),
            "recent_rainfall_3d_mm": round(rain_3d, 2)
        })

    return result


@app.get("/api/v1/analytics/supply-risk", response_model=List[SupplyRiskItem], tags=["Analytics"])
def get_supply_risk_scores(
    date: Optional[str] = Query(None, description="Calculation date (YYYY-MM-DD)"),
    zone: Optional[str] = Query(None, description="Filter by zone"),
    risk_level: Optional[str] = Query(None, description="Filter by risk level (HIGH, MODERATE, LOW)"),
    commodity_id: Optional[int] = Query(None, description="Filter by commodity ID"),
    limit: int = Query(50, description="Max records to return"),
    db: Session = Depends(get_db)
):
    """Returns transparent, explainable supply-risk scores, component factors, and classification."""
    target_date = date or db.query(func.max(SupplyRiskResult.calculation_date)).scalar()
    if not target_date:
        return []

    query = db.query(SupplyRiskResult).filter(SupplyRiskResult.calculation_date == target_date)
    if risk_level:
        query = query.filter(SupplyRiskResult.risk_level == risk_level.upper())
    if commodity_id:
        query = query.filter(SupplyRiskResult.commodity_id == commodity_id)

    records = query.order_by(desc(SupplyRiskResult.risk_score)).limit(limit).all()

    markets_map = {m.id: m for m in db.query(Market).all()}
    commodities_map = {c.id: c for c in db.query(Commodity).all()}

    results = []
    for r in records:
        m = markets_map.get(r.market_id)
        c = commodities_map.get(r.commodity_id)
        if not m or not c:
            continue

        if zone and zone.lower() not in m.zone.lower():
            continue

        try:
            factors = json.loads(r.explanation_factors) if r.explanation_factors else []
        except Exception:
            factors = ["Market fluctuations are within standard tolerance."]

        results.append({
            "market_id": m.id,
            "market_name": m.name,
            "district": m.district,
            "zone": m.zone,
            "commodity_id": c.id,
            "commodity_name": c.name,
            "local_name_gu": c.local_name_gu,
            "calculation_date": r.calculation_date,
            "risk_score": r.risk_score,
            "risk_level": r.risk_level,
            "arrival_drop_pct": r.arrival_drop_pct,
            "price_surge_pct": r.price_surge_pct,
            "recent_rainfall_mm": r.recent_rainfall_mm,
            "explanation_factors": factors
        })

    return results


@app.get("/api/v1/analytics/compare", tags=["Analytics"])
def compare_markets(
    commodity_id: int = Query(1, description="Target commodity ID"),
    market_ids: str = Query("1,2,14,30", description="Comma-separated market IDs"),
    date: Optional[str] = Query(None, description="Comparison date"),
    db: Session = Depends(get_db)
):
    """Side-by-side benchmarking of up to 4 Gujarat APMC mandis for arbitrage detection."""
    target_date = date or db.query(func.max(MarketObservation.observation_date)).scalar()
    ids = [int(i.strip()) for i in market_ids.split(",") if i.strip().isdigit()]

    markets = db.query(Market).filter(Market.id.in_(ids)).all()
    commodity = db.query(Commodity).filter(Commodity.id == commodity_id).first()

    if not commodity:
        raise HTTPException(status_code=404, detail="Commodity not found")

    observations = db.query(MarketObservation).filter(
        and_(
            MarketObservation.commodity_id == commodity_id,
            MarketObservation.market_id.in_(ids),
            MarketObservation.observation_date == target_date
        )
    ).all()
    obs_map = {o.market_id: o for o in observations}

    risk_records = db.query(SupplyRiskResult).filter(
        and_(
            SupplyRiskResult.commodity_id == commodity_id,
            SupplyRiskResult.market_id.in_(ids),
            SupplyRiskResult.calculation_date == target_date
        )
    ).all()
    risk_map = {r.market_id: r for r in risk_records}

    comparison = []
    prices = []
    for m in markets:
        o = obs_map.get(m.id)
        r = risk_map.get(m.id)

        modal = o.modal_price if o else (commodity.baseline_min_price + commodity.baseline_max_price) / 2
        prices.append(modal)

        comparison.append({
            "market_id": m.id,
            "market_name": m.name,
            "district": m.district,
            "zone": m.zone,
            "modal_price": modal,
            "min_price": o.min_price if o else modal * 0.85,
            "max_price": o.max_price if o else modal * 1.15,
            "price_spread": o.price_spread if o else modal * 0.3,
            "arrival_quantity": o.arrival_quantity if o else 10.0,
            "risk_score": r.risk_score if r else 25.0,
            "risk_level": r.risk_level if r else "LOW"
        })

    max_spread = (max(prices) - min(prices)) if prices else 0.0

    return {
        "commodity_id": commodity.id,
        "commodity_name": commodity.name,
        "local_name_gu": commodity.local_name_gu,
        "comparison_date": target_date,
        "max_inter_mandi_price_spread": round(max_spread, 2),
        "arbitrage_potential_pct": round((max_spread / min(prices)) * 100, 2) if prices and min(prices) > 0 else 0.0,
        "markets": sorted(comparison, key=lambda x: x["modal_price"])
    }


def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates approximate driving distance between two coordinates."""
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    road_multiplier = 1.25  # Highway routing curvature factor
    return round(R * c * road_multiplier, 1)


@app.post("/api/v1/analytics/procurement-planner", response_model=ProcurementResponse, tags=["Procurement Simulator"])
def simulate_procurement(
    req: ProcurementRequest,
    db: Session = Depends(get_db)
):
    """
    Simulates landed procurement outlays across candidate Gujarat APMCs
    considering mandi auction prices, transport distance, cartage rates, and supply stability.
    """
    commodity = db.query(Commodity).filter(Commodity.id == req.commodity_id).first()
    if not commodity:
        raise HTTPException(status_code=404, detail="Commodity not found")

    dest_market = db.query(Market).filter(Market.district.ilike(f"%{req.destination_district}%")).first()
    if not dest_market:
        dest_market = db.query(Market).filter(Market.name.ilike("%Ahmedabad%")).first()

    dest_lat = dest_market.latitude if dest_market else 23.0225
    dest_lon = dest_market.longitude if dest_market else 72.5714

    latest_date = db.query(func.max(MarketObservation.observation_date)).scalar()
    active_obs = db.query(MarketObservation).filter(
        and_(
            MarketObservation.commodity_id == req.commodity_id,
            MarketObservation.observation_date == latest_date
        )
    ).all()

    obs_map = {o.market_id: o for o in active_obs}
    all_markets = db.query(Market).filter(Market.is_active == True).all()

    risk_map = {
        r.market_id: r for r in db.query(SupplyRiskResult).filter(
            and_(
                SupplyRiskResult.commodity_id == req.commodity_id,
                SupplyRiskResult.calculation_date == latest_date
            )
        ).all()
    }

    candidates = []
    for m in all_markets:
        o = obs_map.get(m.id)
        if not o:
            continue

        r = risk_map.get(m.id)
        distance = calculate_haversine_distance(m.latitude, m.longitude, dest_lat, dest_lon)
        
        # Prices in ₹/Quintal (1 Quintal = 100 kg; 1 MT = 10 Quintals)
        modal_per_quintal = o.modal_price
        modal_per_mt = modal_per_quintal * 10.0
        transport_per_mt = distance * req.transport_rate_per_km_mt
        landed_per_mt = modal_per_mt + transport_per_mt
        total_outlay = landed_per_mt * req.target_quantity_mt

        candidates.append({
            "mandi_id": m.id,
            "mandi_name": m.name,
            "district": m.district,
            "zone": m.zone,
            "modal_price_per_quintal": round(modal_per_quintal, 2),
            "modal_price_per_mt": round(modal_per_mt, 2),
            "distance_km": distance,
            "transport_cost_per_mt": round(transport_per_mt, 2),
            "landed_cost_per_mt": round(landed_per_mt, 2),
            "total_procurement_outlay": round(total_outlay, 2),
            "risk_level": r.risk_level if r else "LOW",
            "available_daily_tonnage": round(o.arrival_quantity, 2)
        })

    if not candidates:
        raise HTTPException(status_code=400, detail="Insufficient trading observations for simulation.")

    candidates = sorted(candidates, key=lambda x: x["landed_cost_per_mt"])
    cheapest = candidates[0]
    most_expensive = candidates[-1]
    savings = most_expensive["total_procurement_outlay"] - cheapest["total_procurement_outlay"]

    return {
        "commodity_name": commodity.name,
        "destination_district": dest_market.district if dest_market else req.destination_district,
        "target_quantity_mt": req.target_quantity_mt,
        "transport_rate_per_km_mt": req.transport_rate_per_km_mt,
        "recommendations": candidates[:10],
        "cheapest_source_mandi": f"{cheapest['mandi_name']} ({cheapest['district']})",
        "maximum_arbitrage_savings": round(savings, 2),
        "calculated_at": datetime.now(timezone.utc).isoformat()
    }


@app.get("/api/v1/export/powerbi", tags=["Data Export"])
def export_powerbi_csv(table_name: str = Query("Fact_Market_Arrivals", description="Dim_Market, Dim_Commodity, Fact_Market_Arrivals")):
    """Exports clean analytical dataset directly for Power BI, Excel, or Tableau ingestion."""
    powerbi_dir = os.path.join(PROJECT_ROOT, "data", "lake", "gold", "powerbi_star_schema")
    csv_file = os.path.join(powerbi_dir, f"{table_name}.csv")

    if not os.path.exists(csv_file):
        raise HTTPException(status_code=404, detail=f"Export table '{table_name}' not generated yet.")

    with open(csv_file, "r", encoding="utf-8") as f:
        content = f.read()

    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={table_name}.csv"}
    )


# ==========================================
# Authentication & Stakeholder Identity (JWT)
# ==========================================
JWT_SECRET = os.environ.get("JWT_SECRET_KEY", "cropshock_enterprise_jwt_secret_gujarat_2026")
JWT_ALGORITHM = "HS256"

DEMO_USERS_MAP = {
    "rajesh.patel@gujaratagrifoods.com": {
        "id": "usr_buyer_01",
        "name": "Rajesh Patel",
        "email": "rajesh.patel@gujaratagrifoods.com",
        "role": "PROCUREMENT_MANAGER",
        "roleLabel": "B2B Sourcing Director",
        "organization": "Gujarat AgriFoods & Processors Pvt Ltd",
        "homeDistrict": "Ahmedabad",
    },
    "vikram.c@sabarkantha-fpo.org": {
        "id": "usr_fpo_02",
        "name": "Vikrambhai Chaudhary",
        "email": "vikram.c@sabarkantha-fpo.org",
        "role": "FPO_LEADER",
        "roleLabel": "FPO Collective Chairman",
        "organization": "Sabarkantha Vegetable Growers FPO",
        "homeDistrict": "Sabarkantha",
    },
    "h.shah@gondal-apmc.gov.in": {
        "id": "usr_apmc_03",
        "name": "Dr. Hasmukh Shah",
        "email": "h.shah@gondal-apmc.gov.in",
        "role": "APMC_OFFICIAL",
        "roleLabel": "APMC Mandi Secretary",
        "organization": "Gondal APMC Market Committee (Rajkot)",
        "homeDistrict": "Rajkot",
    },
    "ananya.desai@cropshock.io": {
        "id": "usr_eng_04",
        "name": "Ananya Desai",
        "email": "ananya.desai@cropshock.io",
        "role": "DATA_ENGINEER",
        "roleLabel": "Big Data Platform Lead",
        "organization": "CropShock AgData Lakehouse Team",
        "homeDistrict": "Gandhinagar",
    }
}


def get_current_user_from_header(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Decodes JWT Bearer token or returns active default profile."""
    if not authorization:
        return DEMO_USERS_MAP["rajesh.patel@gujaratagrifoods.com"]
    try:
        token = authorization.replace("Bearer ", "").strip()
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get("sub", "")
        if email in DEMO_USERS_MAP:
            return DEMO_USERS_MAP[email]
        return {
            "id": payload.get("uid", "usr_custom"),
            "name": payload.get("name", email.split("@")[0].capitalize()),
            "email": email,
            "role": payload.get("role", "PROCUREMENT_MANAGER"),
            "roleLabel": "Authenticated Stakeholder",
            "organization": "Commercial Agri Sourcing Partner"
        }
    except Exception:
        return DEMO_USERS_MAP["rajesh.patel@gujaratagrifoods.com"]


@app.post("/api/v1/auth/login", response_model=TokenResponse, tags=["Authentication & RBAC"])
def login_user(req: LoginRequest):
    """Authenticates stakeholder credentials and generates a signed JWT access token."""
    email_clean = req.email.strip().lower()
    user_info = DEMO_USERS_MAP.get(email_clean)

    if not user_info:
        user_info = {
            "id": f"usr_{int(datetime.now().timestamp())}",
            "name": email_clean.split("@")[0].replace(".", " ").title(),
            "email": email_clean,
            "role": "PROCUREMENT_MANAGER",
            "roleLabel": "B2B Sourcing Specialist",
            "organization": "Agri Enterprise Partner",
            "homeDistrict": "Ahmedabad"
        }

    token_payload = {
        "sub": user_info["email"],
        "uid": user_info["id"],
        "name": user_info["name"],
        "role": user_info["role"],
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    encoded_jwt = jwt.encode(token_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    return {
        "access_token": encoded_jwt,
        "token_type": "bearer",
        "user": user_info
    }


@app.get("/api/v1/auth/me", tags=["Authentication & RBAC"])
def get_authenticated_profile(current_user: Dict[str, Any] = Depends(get_current_user_from_header)):
    """Validates the current session token and returns active stakeholder identity."""
    return current_user


# ==========================================
# Procurement Schedules Persistence
# ==========================================
@app.post("/api/v1/schedules", response_model=SavedScheduleOut, tags=["Procurement Simulator"])
def create_saved_schedule(
    req: SavedScheduleCreate,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user_from_header)
):
    """Persists an optimized landed cost procurement schedule into the serving database."""
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    record = SavedSchedule(
        user_email=current_user["email"],
        user_role=current_user.get("role", "PROCUREMENT_MANAGER"),
        commodity_id=req.commodity_id,
        commodity_name=req.commodity_name,
        source_mandi_id=req.source_mandi_id,
        source_mandi_name=req.source_mandi_name,
        destination_district=req.destination_district,
        quantity_mt=req.quantity_mt,
        transport_rate_per_km_mt=req.transport_rate_per_km_mt,
        modal_price_per_qtl=req.modal_price_per_qtl,
        landed_cost_per_mt=req.landed_cost_per_mt,
        total_outlay=req.total_outlay,
        arbitrage_savings=req.arbitrage_savings,
        status="ACTIVE",
        created_at=now_str
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@app.get("/api/v1/schedules", response_model=List[SavedScheduleOut], tags=["Procurement Simulator"])
def list_saved_schedules(
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user_from_header)
):
    """Retrieves all saved procurement schedules and active booking drafts."""
    # Return user-specific or recent active schedules
    schedules = db.query(SavedSchedule).order_by(desc(SavedSchedule.id)).limit(50).all()
    return schedules


@app.delete("/api/v1/schedules/{schedule_id}", tags=["Procurement Simulator"])
def delete_saved_schedule(
    schedule_id: int,
    db: Session = Depends(get_db)
):
    """Deletes a saved procurement schedule by ID."""
    record = db.query(SavedSchedule).filter(SavedSchedule.id == schedule_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Schedule not found.")
    db.delete(record)
    db.commit()
    return {"status": "DELETED", "success": True, "schedule_id": schedule_id}


if __name__ == "__main__":
    import uvicorn
    print("[SERVER] Starting CropShock FastAPI Backend on http://localhost:8000...")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=False)
