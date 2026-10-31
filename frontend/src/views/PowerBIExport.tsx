import React from 'react';
import { 
  Download, FileSpreadsheet, Database, 
  Layers, CheckCircle, ExternalLink, Table, BarChart3, Clock, Sparkles
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const PowerBIExport: React.FC = () => {
  const downloadTable = (tableName: string) => {
    window.open(`${API_BASE}/export/powerbi?table_name=${tableName}`, '_blank');
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span className="badge badge-emerald">ENTERPRISE BI & REPORTING</span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Kimball Star Schema Dimensional Modeling</span>
          </div>
          <h2 style={{ fontSize: '1.45rem', color: '#fff', marginBottom: 6 }}>
            Power BI & Analytics Export Center
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '880px' }}>
            Export pre-aggregated Gold dimensional datasets directly into Power BI, Tableau, or Microsoft Excel 
            for executive reporting, procurement cost benchmarking, and multi-mandi agricultural market intelligence.
          </p>
        </div>
      </div>

      {/* Export Tables Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ cursor: 'pointer', padding: '24px' }} onClick={() => downloadTable('Dim_Market')}>
          <div className="stat-header">
            <span className="stat-label">Dimension Table</span>
            <div className="stat-icon" style={{ color: '#10b981' }}><FileSpreadsheet size={20} /></div>
          </div>
          <div className="stat-value" style={{ fontSize: '1.35rem', marginTop: 6 }}>Dim_Market.csv</div>
          <div className="stat-sub" style={{ fontSize: '0.86rem', marginTop: 4 }}>
            All 33 Districts • 40 Gujarat APMCs • Zones, District Tiers, Catchments
          </div>
          <button className="btn btn-primary" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
            <Download size={15} /> Download CSV Dataset
          </button>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer', padding: '24px' }} onClick={() => downloadTable('Dim_Commodity')}>
          <div className="stat-header">
            <span className="stat-label">Dimension Table</span>
            <div className="stat-icon" style={{ color: '#38bdf8' }}><FileSpreadsheet size={20} /></div>
          </div>
          <div className="stat-value" style={{ fontSize: '1.35rem', marginTop: 6 }}>Dim_Commodity.csv</div>
          <div className="stat-sub" style={{ fontSize: '0.86rem', marginTop: 4 }}>
            40 Commercial Vegetable Crops • Perishability Tiers
          </div>
          <button className="btn btn-primary" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
            <Download size={15} /> Download CSV Dataset
          </button>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer', padding: '24px' }} onClick={() => downloadTable('Fact_Market_Arrivals')}>
          <div className="stat-header">
            <span className="stat-label">Fact Table</span>
            <div className="stat-icon" style={{ color: '#f59e0b' }}><Database size={20} /></div>
          </div>
          <div className="stat-value" style={{ fontSize: '1.35rem', marginTop: 6 }}>Fact_Arrivals.csv</div>
          <div className="stat-sub" style={{ fontSize: '0.86rem', marginTop: 4 }}>
            5,661 Daily Inflows • Rolling 7D Baselines & Risk Scores
          </div>
          <button className="btn btn-primary" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
            <Download size={15} /> Download CSV Dataset
          </button>
        </div>
      </div>

      {/* Power BI Star Schema Model Diagram */}
      <div className="glass-card" style={{ padding: '28px 32px' }}>
        <div className="card-header">
          <div className="card-title">
            <Layers size={20} style={{ color: '#10b981' }} />
            Power BI Star Schema Relational Architecture
          </div>
          <span className="badge badge-emerald">Kimball Dimensional Modeling</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
          background: 'rgba(0,0,0,0.25)',
          padding: 24,
          borderRadius: 12
        }}>
          <div style={{ border: '1px solid rgba(16, 185, 129, 0.3)', padding: 18, borderRadius: 10, background: 'rgba(16, 185, 129, 0.05)' }}>
            <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.98rem', marginBottom: 10 }}>Dim_Market (1)</div>
            <div style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.7 }}>
              • <code>market_id</code> (Primary Key)<br/>
              • <code>market_name</code> (APMC Mandi Name)<br/>
              • <code>district</code> (Administrative District)<br/>
              • <code>zone</code> (Agro-Climatic Zone)<br/>
              • <code>latitude, longitude</code> (GPS Coordinates)<br/>
              • <code>market_tier</code> (Tier 1 Mega / Tier 2 Regional)
            </div>
          </div>

          <div style={{ border: '1px solid rgba(56, 189, 248, 0.4)', padding: 18, borderRadius: 10, background: 'rgba(56, 189, 248, 0.05)' }}>
            <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.98rem', marginBottom: 10 }}>Fact_Market_Arrivals (∞)</div>
            <div style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.7 }}>
              • <code>market_id</code> (Foreign Key → Dim_Market)<br/>
              • <code>commodity_id</code> (Foreign Key → Dim_Commodity)<br/>
              • <code>observation_date</code> (Calendar Date)<br/>
              • <code>modal_price, min_price, max_price</code> (₹/Qtl)<br/>
              • <code>arrival_quantity</code> (Metric Tonnes)<br/>
              • <code>ma_7_modal_price</code> (7-Day Rolling Baseline)<br/>
              • <code>risk_score</code> (Explainable Shock Metric)
            </div>
          </div>

          <div style={{ border: '1px solid rgba(245, 158, 11, 0.3)', padding: 18, borderRadius: 10, background: 'rgba(245, 158, 11, 0.05)' }}>
            <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.98rem', marginBottom: 10 }}>Dim_Commodity (1)</div>
            <div style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.7 }}>
              • <code>commodity_id</code> (Primary Key)<br/>
              • <code>code, name</code> (Standard Crop Name)<br/>
              • <code>local_name_gu</code> (Gujarati Botanical Name)<br/>
              • <code>botanical_group</code> (Solanaceous, Cucurbit, etc.)<br/>
              • <code>perishability_tier</code> (High / Moderate / Low)<br/>
              • <code>shelf_life_days</code> (Ambient Cold-Chain Window)
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise BI Integration Guide & Recommended DAX Metrics */}
      <div className="glass-card" style={{ padding: '28px 32px' }}>
        <div className="card-header">
          <div className="card-title">
            <BarChart3 size={20} style={{ color: '#38bdf8' }} />
            Business Intelligence Integration & DAX KPI Measures
          </div>
          <span className="badge badge-emerald">Ready for Power BI & Tableau</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} style={{ color: '#10b981' }} />
              Weighted Average Modal Price (DAX)
            </div>
            <p style={{ fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: 10 }}>
              Calculates daily volume-weighted mandi price across selected regions:
            </p>
            <code style={{ display: 'block', color: '#34d399', padding: '10px 14px', background: 'rgba(0,0,0,0.4)', borderRadius: 8, fontSize: '0.85rem' }}>
              WeightedPrice = DIVIDE(SUMX(Fact_Market_Arrivals, Fact_Market_Arrivals[modal_price] * Fact_Market_Arrivals[arrival_quantity]), SUM(Fact_Market_Arrivals[arrival_quantity]))
            </code>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} style={{ color: '#38bdf8' }} />
              Live DirectQuery / Web Endpoint
            </div>
            <p style={{ fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: 10 }}>
              In Power BI Desktop, navigate to <strong>Get Data → Web</strong> and paste:
            </p>
            <code style={{ display: 'block', color: '#38bdf8', padding: '10px 14px', background: 'rgba(0,0,0,0.4)', borderRadius: 8, fontSize: '0.85rem' }}>
              {`${API_BASE}/export/powerbi?table_name=Fact_Market_Arrivals`}
            </code>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Table size={16} style={{ color: '#f59e0b' }} />
              Data Pipeline & Refresh Cadence
            </div>
            <p style={{ fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.6 }}>
              Datasets are refreshed daily at <strong>06:00 IST</strong> via the automated Medallion lakehouse pipeline. 
              Bronze raw market logs are cleaned and validated into Silver, before Star Schema aggregations are compiled into Gold.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
