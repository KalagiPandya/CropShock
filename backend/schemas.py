"""
CropShock - Pydantic v2 Request & Response Data Schemas
Enforces strict type safety and auto-generates OpenAPI / Swagger schemas.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class MarketSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    district: str
    taluka: str
    zone: str
    state: str = "Gujarat"
    latitude: float
    longitude: float
    elevation_m: int
    market_tier: str
    catchment_villages_approx: int
    is_active: bool = True


class CommoditySchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    local_name_gu: Optional[str] = None
    botanical_group: str
    perishability_tier: str
    ambient_shelf_life_days: int
    standard_unit: str = "₹/Quintal"
    baseline_min_price: float
    baseline_max_price: float


class OverviewKPISchema(BaseModel):
    date: str
    total_tonnage_mt: float
    state_avg_modal_price: float
    active_mandis_count: int
    monitored_commodities_count: int
    critical_supply_shocks_count: int
    moderate_supply_shocks_count: int
    highest_volatility_mandi: str
    top_shock_commodity: str
    zonal_distribution: Dict[str, float]


class TrendPointSchema(BaseModel):
    date: str
    min_price: float
    max_price: float
    modal_price: float
    price_spread: float
    arrival_quantity: float
    ma_7_modal_price: Optional[float] = None
    ma_7_arrival_qty: Optional[float] = None
    ma_30_modal_price: Optional[float] = None
    std_7_modal_price: Optional[float] = None


class WeatherCorrelationPoint(BaseModel):
    date: str
    arrival_quantity: float
    modal_price: float
    precipitation_mm: float
    temperature_max: float
    recent_rainfall_3d_mm: float


class SupplyRiskItem(BaseModel):
    market_id: int
    market_name: str
    district: str
    zone: str
    commodity_id: int
    commodity_name: str
    local_name_gu: Optional[str] = None
    calculation_date: str
    risk_score: float
    risk_level: str
    arrival_drop_pct: float
    price_surge_pct: float
    recent_rainfall_mm: float
    explanation_factors: List[str]


class ProcurementRequest(BaseModel):
    commodity_id: int = Field(..., description="Target vegetable commodity ID")
    destination_district: str = Field(default="Ahmedabad", description="Destination city/district")
    target_quantity_mt: float = Field(default=50.0, description="Required procurement quantity in MT")
    transport_rate_per_km_mt: float = Field(default=4.5, description="Transport cartage rate in ₹ per km per MT")


class ProcurementOption(BaseModel):
    mandi_id: int
    mandi_name: str
    district: str
    zone: str
    modal_price_per_quintal: float
    modal_price_per_mt: float
    distance_km: float
    transport_cost_per_mt: float
    landed_cost_per_mt: float
    total_procurement_outlay: float
    risk_level: str
    available_daily_tonnage: float


class ProcurementResponse(BaseModel):
    commodity_name: str
    destination_district: str
    target_quantity_mt: float
    transport_rate_per_km_mt: float
    recommendations: List[ProcurementOption]
    cheapest_source_mandi: str
    maximum_arbitrage_savings: float
    calculated_at: str


class PipelineHealthSchema(BaseModel):
    backend_status: str
    database_connected: bool
    database_url_type: str
    hdfs_cluster_status: Dict[str, Any]
    total_markets_registered: int
    total_commodities_tracked: int
    total_observations_recorded: int
    latest_data_date: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = "demo123"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


class SavedScheduleCreate(BaseModel):
    commodity_id: int
    commodity_name: str
    source_mandi_id: int
    source_mandi_name: str
    destination_district: str
    quantity_mt: float
    transport_rate_per_km_mt: float = 4.5
    modal_price_per_qtl: float
    landed_cost_per_mt: float
    total_outlay: float
    arbitrage_savings: float = 0.0


class SavedScheduleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_email: str
    user_role: str
    commodity_id: int
    commodity_name: str
    source_mandi_id: int
    source_mandi_name: str
    destination_district: str
    quantity_mt: float
    transport_rate_per_km_mt: float
    modal_price_per_qtl: float
    landed_cost_per_mt: float
    total_outlay: float
    arbitrage_savings: float
    status: str
    created_at: str

