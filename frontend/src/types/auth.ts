export type UserRole = 
  | 'PROCUREMENT_MANAGER'
  | 'FPO_LEADER'
  | 'APMC_OFFICIAL'
  | 'DATA_ENGINEER';

export interface RoleMetric {
  label: string;
  value: string;
  sub: string;
  iconName?: string;
  color?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  roleIcon: string;
  organization: string;
  badgeClass: string;
  initials: string;
  homeDistrict: string;
  defaultCommodityId: number;
  description: string;
  permissions: string[];
  primaryTabs: string[];
  bannerHighlight: string;
  customCallout: {
    title: string;
    text: string;
    actionText: string;
    targetTab: string;
  };
  roleMetrics: RoleMetric[];
}

export const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  PROCUREMENT_MANAGER: {
    id: 'usr_buyer_01',
    name: 'Rajesh Patel',
    email: 'rajesh.patel@gujaratagrifoods.com',
    role: 'PROCUREMENT_MANAGER',
    roleLabel: 'B2B Sourcing Director',
    roleIcon: 'Building2',
    organization: 'Gujarat AgriFoods & Processors Pvt Ltd',
    badgeClass: 'badge-emerald',
    initials: 'RP',
    homeDistrict: 'Ahmedabad',
    defaultCommodityId: 1, // Potato
    description: 'Bulk sourcing of 50–200 MT/day for processing plants with landed freight arbitrage.',
    permissions: ['VIEW_ANALYTICS', 'RUN_SIMULATION', 'DOWNLOAD_DATA', 'SAVE_ROUTES'],
    primaryTabs: ['procurement', 'arbitrage'],
    bannerHighlight: 'B2B Procurement & Freight Arbitrage Mode Active',
    customCallout: {
      title: 'Optimal Landed Sourcing Opportunity Detected',
      text: 'Potato spot price in Deesa APMC (₹1,020/Qtl) + trucking freight to Ahmedabad offers a net landed cost of ₹1,245/MT, beating local Ahmedabad yard spot rate by ₹185/MT.',
      actionText: 'Open Landed Cost Planner',
      targetTab: 'procurement'
    },
    roleMetrics: [
      { label: 'Daily Sourcing Target', value: '150 MT', sub: 'Across Potato, Tomato, Onion', color: '#10b981' },
      { label: 'Daily Sourcing Budget', value: '₹42.5 L', sub: 'Allocated commercial procurement pool' },
      { label: 'Average Landed Savings', value: '14.8%', sub: 'Vs single local mandi spot purchases', color: '#34d399' },
      { label: 'Saved Freight Schedules', value: '3 Routes', sub: 'Deesa, Gondal, Surat terminals' }
    ]
  },
  FPO_LEADER: {
    id: 'usr_fpo_02',
    name: 'Vikrambhai Chaudhary',
    email: 'vikram.c@sabarkantha-fpo.org',
    role: 'FPO_LEADER',
    roleLabel: 'FPO Collective Chairman',
    roleIcon: 'Sprout',
    organization: 'Sabarkantha Vegetable Growers FPO',
    badgeClass: 'badge-amber',
    initials: 'VC',
    homeDistrict: 'Sabarkantha',
    defaultCommodityId: 2, // Tomato
    description: 'Aggregating member harvest cartage to target highest-paying neighboring mandis.',
    permissions: ['VIEW_ANALYTICS', 'VIEW_ARBITRAGE', 'EXPORT_BASIC'],
    primaryTabs: ['arbitrage', 'vegetable'],
    bannerHighlight: 'Farmer Realization & Collective Dispatch Mode Active',
    customCallout: {
      title: 'Farmer Realization Advisory: High Tomato Spread',
      text: 'Surat APMC is paying ₹1,480/Qtl today for Grade-A Tomato. After deducting pooled truck cartage (₹110/Qtl from Sabarkantha), member realization is +₹215/Qtl higher than local Taluka yard.',
      actionText: 'Compare Mandi Payouts',
      targetTab: 'arbitrage'
    },
    roleMetrics: [
      { label: 'Pooled Harvest Today', value: '185 MT', sub: 'Collected from 14 member villages', color: '#fbbf24' },
      { label: 'Collective Premium Earned', value: '+₹3.85 L', sub: 'Captured via inter-mandi dispatch', color: '#10b981' },
      { label: 'Active Grower Members', value: '1,420 Farmers', sub: 'Across Himatnagar, Idar, Prantij' },
      { label: 'Weather Risk Advisory', value: 'Dry / Favorable', sub: 'Zero transit spoilage risk today', color: '#38bdf8' }
    ]
  },
  APMC_OFFICIAL: {
    id: 'usr_apmc_03',
    name: 'Dr. Hasmukh Shah',
    email: 'h.shah@gondal-apmc.gov.in',
    role: 'APMC_OFFICIAL',
    roleLabel: 'APMC Mandi Secretary',
    roleIcon: 'Landmark',
    organization: 'Gondal APMC Market Committee (Rajkot)',
    badgeClass: 'badge-indigo',
    initials: 'HS',
    homeDistrict: 'Rajkot',
    defaultCommodityId: 3, // Onion
    description: 'Supervising daily open-outcry auctions, physical weighments, and arrival stabilization.',
    permissions: ['VIEW_ANALYTICS', 'MONITOR_RISK', 'EXPORT_ALL'],
    primaryTabs: ['map', 'explorer'],
    bannerHighlight: 'Statutory Market Surveillance & Regulation Mode Active',
    customCallout: {
      title: 'Statutory Surveillance: Saurashtra Inflow Gating',
      text: 'Gondal APMC recorded 1,280 MT vegetable arrivals across 28 gate weighbridges. Price spread index is healthy at 8.4% (well within statutory ceiling under Gujarat APMC Act 1963).',
      actionText: 'Open Statewide Mandi Map',
      targetTab: 'map'
    },
    roleMetrics: [
      { label: 'Yard Weighment Compliance', value: '99.8%', sub: 'Digital weighbridge verification', color: '#10b981' },
      { label: 'Daily Statutory Cess', value: '₹1.82 L', sub: 'Collected at 1.5% statutory rate', color: '#818cf8' },
      { label: 'Monitored APMC Gates', value: '40 Yards', sub: 'Statewide statutory reporting nodes across 33 districts' },
      { label: 'Price Volatility Alerts', value: '0 Breaches', sub: 'All spreads within normal limits', color: '#34d399' }
    ]
  },
  DATA_ENGINEER: {
    id: 'usr_eng_04',
    name: 'Ananya Desai',
    email: 'ananya.desai@cropshock.io',
    role: 'DATA_ENGINEER',
    roleLabel: 'Big Data Platform Lead',
    roleIcon: 'Database',
    organization: 'CropShock AgData Lakehouse Team',
    badgeClass: 'badge-emerald',
    initials: 'AD',
    homeDistrict: 'Gandhinagar',
    defaultCommodityId: 1,
    description: 'Monitoring distributed batch ingestion across Bronze, Silver, Gold and Hadoop HDFS health.',
    permissions: ['VIEW_ALL', 'RUN_PIPELINES', 'EXPORT_STAR_SCHEMA', 'VIEW_TELEMETRY'],
    primaryTabs: ['pipeline', 'powerbi'],
    bannerHighlight: 'Big Data Lakehouse Telemetry & PySpark Engine Mode Active',
    customCallout: {
      title: 'Lakehouse Health: Zero-Shuffle Window Partitioning Verified',
      text: 'Daily Medallion batch executed across 5,661 records. PySpark Window specifications (market_id, commodity_id) completed in 4.2s with zero network memory shuffle skew.',
      actionText: 'View Lakehouse Telemetry',
      targetTab: 'pipeline'
    },
    roleMetrics: [
      { label: 'HDFS Replicas Healthy', value: '3/3 Nodes', sub: 'hdfs://namenode:9000/cropshock', color: '#10b981' },
      { label: 'Silver Gating Pass Rate', value: '100.0%', sub: 'Zero schema quarantine rejections', color: '#38bdf8' },
      { label: 'Star Schema Export Ready', value: '5,661 Rows', sub: 'Dim_Market, Dim_Commodity, Fact_Arrivals' },
      { label: 'API P95 Query Latency', value: '14 ms', sub: 'Indexed SQLite/Postgres serving layer', color: '#34d399' }
    ]
  }
};
