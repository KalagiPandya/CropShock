export interface Market {
  id: number;
  code: string;
  name: string;
  district: string;
  taluka: string;
  zone: string;
  state: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  market_tier: string;
  catchment_villages_approx: number;
  is_active: boolean;
}

export interface Commodity {
  id: number;
  code: string;
  name: string;
  local_name_gu?: string;
  botanical_group: string;
  perishability_tier: string;
  ambient_shelf_life_days: number;
  standard_unit: string;
  baseline_min_price: number;
  baseline_max_price: number;
}

export interface OverviewKPI {
  date: string;
  total_tonnage_mt: number;
  state_avg_modal_price: number;
  active_mandis_count: number;
  monitored_commodities_count: number;
  critical_supply_shocks_count: number;
  moderate_supply_shocks_count: number;
  highest_volatility_mandi: string;
  top_shock_commodity: string;
  zonal_distribution: Record<string, number>;
}

export interface TrendPoint {
  date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  price_spread: number;
  arrival_quantity: number;
  ma_7_modal_price?: number;
  ma_7_arrival_qty?: number;
  ma_30_modal_price?: number;
  std_7_modal_price?: number;
}

export interface WeatherCorrelationPoint {
  date: string;
  arrival_quantity: number;
  modal_price: number;
  precipitation_mm: number;
  temperature_max: number;
  recent_rainfall_3d_mm: number;
}

export interface SupplyRiskItem {
  market_id: number;
  market_name: string;
  district: string;
  zone: string;
  commodity_id: number;
  commodity_name: string;
  local_name_gu?: string;
  calculation_date: string;
  risk_score: number;
  risk_level: 'LOW' | 'MODERATE' | 'HIGH';
  arrival_drop_pct: number;
  price_surge_pct: number;
  recent_rainfall_mm: number;
  explanation_factors: string[];
}

export interface ProcurementRequest {
  commodity_id: number;
  destination_district: string;
  target_quantity_mt: number;
  transport_rate_per_km_mt: number;
}

export interface ProcurementOption {
  mandi_id: number;
  mandi_name: string;
  district: string;
  zone: string;
  modal_price_per_quintal: number;
  modal_price_per_mt: number;
  distance_km: number;
  transport_cost_per_mt: number;
  landed_cost_per_mt: number;
  total_procurement_outlay: number;
  risk_level: string;
  available_daily_tonnage: number;
}

export interface ProcurementResponse {
  commodity_name: string;
  destination_district: string;
  target_quantity_mt: number;
  transport_rate_per_km_mt: number;
  recommendations: ProcurementOption[];
  cheapest_source_mandi: string;
  maximum_arbitrage_savings: number;
  calculated_at: string;
}

export interface PipelineHealth {
  backend_status: string;
  database_connected: boolean;
  database_url_type: string;
  hdfs_cluster_status: {
    hdfs_enabled: boolean;
    namenode_url: string;
    webhdfs_endpoint: string;
    status: string;
    storage_mode: string;
    hdfs_root_path: string;
  };
  total_markets_registered: number;
  total_commodities_tracked: number;
  total_observations_recorded: number;
  latest_data_date?: string;
}

export interface SavedScheduleCreate {
  commodity_id: number;
  commodity_name: string;
  source_mandi_id: number;
  source_mandi_name: string;
  destination_district: string;
  quantity_mt: number;
  transport_rate_per_km_mt?: number;
  modal_price_per_qtl: number;
  landed_cost_per_mt: number;
  total_outlay: number;
  arbitrage_savings?: number;
}

export interface SavedSchedule {
  id: number;
  user_email: string;
  user_role: string;
  commodity_id: number;
  commodity_name: string;
  source_mandi_id: number;
  source_mandi_name: string;
  destination_district: string;
  quantity_mt: number;
  transport_rate_per_km_mt: number;
  modal_price_per_qtl: number;
  landed_cost_per_mt: number;
  total_outlay: number;
  arbitrage_savings: number;
  status: string;
  created_at: string;
}
