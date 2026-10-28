import React from 'react';
import { OverviewKPI, Market, Commodity, SupplyRiskItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, AlertTriangle, ShieldCheck, Database, 
  MapPin, ShoppingBag, ArrowUpRight, CloudRain, Cpu, UserCheck 
} from 'lucide-react';

interface ExecutiveOverviewProps {
  kpi: OverviewKPI | null;
  markets: Market[];
  commodities: Commodity[];
  risks: SupplyRiskItem[];
  onNavigateTab: (tab: string) => void;
  onSelectCommodity: (id: number) => void;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  kpi,
  markets,
  commodities,
  risks,
  onNavigateTab,
  onSelectCommodity
}) => {
  const { currentUser, openLoginModal } = useAuth();

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Top Banner / Platform Mission */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.9) 100%)',
        borderColor: 'rgba(16, 185, 129, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 24,
        padding: '30px 36px'
      }}>
        <div style={{ maxWidth: '780px' }}>
          {currentUser && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '6px 14px',
              borderRadius: 30,
              marginBottom: 12,
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
              <span style={{ fontSize: '0.86rem', color: '#cbd5e1' }}>
                Active Stakeholder: <strong style={{ color: '#fff' }}>{currentUser.name}</strong> ({currentUser.roleLabel}) • <span style={{ color: '#34d399' }}>{currentUser.organization}</span>
              </span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span className="badge badge-emerald">GUJARAT STATEWIDE SCOPE</span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>All 33 Administrative Districts • 40 APMC Mandis • 40 Vegetables</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: 10, lineHeight: 1.3 }}>
            Gujarat Agricultural Supply Chain & Market Intelligence
          </h2>
          <p style={{ fontSize: '0.94rem', color: '#cbd5e1', lineHeight: 1.7 }}>
            Engineered with a Big Data Medallion Architecture (Bronze → Silver → Gold) on Apache Hadoop HDFS & PySpark. 
            Ingests daily APMC mandi arrivals, cleanses outliers, and correlates micro-climate weather metrics from Open-Meteo 
            to generate explainable supply-risk indicators and inter-mandi procurement arbitrage.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          <button className="btn btn-primary" onClick={() => onNavigateTab('procurement')}>
            <ShoppingBag size={17} /> Procurement Planner
          </button>
          <button className="btn btn-outline" onClick={() => onNavigateTab('pipeline')}>
            <Database size={17} /> Data Lake Telemetry
          </button>
        </div>
      </div>

      {/* Role-Specific Stakeholder Command Widget */}
      {currentUser && (
        <div className="glass-card" style={{
          background: 'rgba(15, 23, 42, 0.85)',
          borderColor: 'rgba(16, 185, 129, 0.35)',
          padding: '26px 30px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4), 0 0 25px rgba(16, 185, 129, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span className={`badge ${currentUser.badgeClass || 'badge-emerald'}`}>
                  {(currentUser.roleLabel || 'STAKEHOLDER').toUpperCase()} WORKSPACE
                </span>
                <span style={{ fontSize: '0.84rem', color: '#34d399', fontWeight: 600 }}>
                  {currentUser.bannerHighlight || 'Operational Intelligence Active'}
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#fff' }}>
                Operational Command Center — {currentUser.organization || 'Gujarat Agriculture'}
              </h3>
            </div>

            <button 
              className="btn btn-outline" 
              style={{ padding: '7px 14px', fontSize: '0.82rem', gap: 6 }}
              onClick={openLoginModal}
            >
              Switch Role / Persona
            </button>
          </div>

          {/* 4 Role-Tailored KPI Metrics */}
          {currentUser.roleMetrics && currentUser.roleMetrics.length > 0 && (
            <div className="stats-grid" style={{ marginBottom: 20 }}>
              {currentUser.roleMetrics.map((m, idx) => (
                <div 
                  key={idx} 
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 12,
                    padding: '16px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6
                  }}
                >
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 700, color: m.color || '#fff', lineHeight: 1.2 }}>
                    {m.value}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {m.sub}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Role Action Advisory Box */}
          {currentUser.customCallout && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 12,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16
            }}>
              <div style={{ maxWidth: '720px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.94rem', color: '#34d399', marginBottom: 4 }}>
                  💡 {currentUser.customCallout.title}
                </div>
                <div style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                  {currentUser.customCallout.text}
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.86rem' }}
                onClick={() => onNavigateTab(currentUser.customCallout?.targetTab || 'procurement')}
              >
                {currentUser.customCallout.actionText || 'Explore'} →
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5 Core Metric Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Daily Tonnage Inflow</span>
            <div className="stat-icon"><TrendingUp size={20} /></div>
          </div>
          <div className="stat-value">{kpi ? kpi.total_tonnage_mt.toLocaleString() : '5,820'} <span style={{ fontSize: '1.05rem', fontWeight: 500, color: '#94a3b8' }}>MT</span></div>
          <div className="stat-sub">Across 40 Gujarat APMC yards</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">State Avg Modal Price</span>
            <div className="stat-icon" style={{ color: '#38bdf8' }}><ShoppingBag size={20} /></div>
          </div>
          <div className="stat-value">₹{kpi ? Math.round(kpi.state_avg_modal_price) : '2,480'} <span style={{ fontSize: '1.05rem', fontWeight: 500, color: '#94a3b8' }}>/Qtl</span></div>
          <div className="stat-sub">Weighted daily modal benchmark</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Critical Supply Alerts</span>
            <div className="stat-icon" style={{ color: '#ef4444' }}><AlertTriangle size={20} /></div>
          </div>
          <div className="stat-value" style={{ color: '#ef4444' }}>{kpi ? kpi.critical_supply_shocks_count : '2'}</div>
          <div className="stat-sub">Markets with &gt;40% supply contraction</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Monitored Vegetables</span>
            <div className="stat-icon" style={{ color: '#f59e0b' }}><Cpu size={20} /></div>
          </div>
          <div className="stat-value">{commodities.length || 40}</div>
          <div className="stat-sub">Exhaustive commercial master list</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Active APMC Mandis</span>
            <div className="stat-icon" style={{ color: '#a855f7' }}><MapPin size={20} /></div>
          </div>
          <div className="stat-value">{markets.length || 40}</div>
          <div className="stat-sub">Covering all 33 districts & 5 zones</div>
        </div>
      </div>

      {/* Grid: Zonal Inflow Breakdown & Top Shock Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 28 }}>
        {/* Zonal Tonnage Distribution */}
        <div className="glass-card" style={{ padding: '28px 32px' }}>
          <div className="card-header">
            <div className="card-title">
              <MapPin size={20} style={{ color: '#10b981' }} />
              Zone-wise Agricultural Inflow (Gujarat)
            </div>
            <span className="badge badge-emerald">Active Distribution</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {kpi?.zonal_distribution && Object.entries(kpi.zonal_distribution).map(([zone, tonnage]) => {
              const maxTonnage = Math.max(...Object.values(kpi.zonal_distribution), 1);
              const pct = Math.round((tonnage / maxTonnage) * 100);
              return (
                <div key={zone}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{zone}</span>
                    <span style={{ color: '#cbd5e1' }}>{tonnage.toLocaleString()} MT ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #06b6d4)', borderRadius: 6 }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Supply Risk Alerts */}
        <div className="glass-card" style={{ padding: '28px 32px' }}>
          <div className="card-header">
            <div className="card-title">
              <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
              Live Supply Risk & Price Pressure Alerts
            </div>
            <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.82rem' }} onClick={() => onNavigateTab('vegetable')}>
              View All <ArrowUpRight size={15} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {risks.slice(0, 4).map(r => (
              <div
                key={`${r.market_id}-${r.commodity_id}`}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 12,
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 14
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff' }}>
                    {r.commodity_name} <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>({r.local_name_gu})</span>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#94a3b8', marginTop: 2 }}>
                    {r.market_name} • {r.district} ({r.zone})
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${
                    r.risk_level === 'HIGH' ? 'badge-crimson' :
                    r.risk_level === 'MODERATE' ? 'badge-amber' : 'badge-emerald'
                  }`}>
                    {r.risk_level} (Score {r.risk_score})
                  </span>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 5 }}>
                    Arrival Δ: <span style={{ color: r.arrival_drop_pct < 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>{r.arrival_drop_pct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Architectural Flow Diagram Card */}
      <div className="glass-card" style={{ padding: '28px 32px' }}>
        <div className="card-header">
          <div className="card-title">
            <Cpu size={20} style={{ color: '#6366f1' }} />
            CropShock End-to-End Big Data Architecture & Pipeline Lineage
          </div>
          <span className="badge badge-emerald">Production Medallion Pipeline</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
          marginTop: 12
        }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '20px' }}>
            <div style={{ color: '#38bdf8', fontWeight: 700, fontSize: '0.92rem', marginBottom: 8 }}>1. INGESTION</div>
            <div style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.6 }}>Agmarknet daily API + Open-Meteo live weather grid for 39 Gujarat APMCs.</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 10 }}>Format: JSON/CSV Raw Feeds</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '20px' }}>
            <div style={{ color: '#d97706', fontWeight: 700, fontSize: '0.92rem', marginBottom: 8 }}>2. BRONZE LAYER</div>
            <div style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.6 }}>Immutable raw storage on Hadoop HDFS / Parquet with SHA-256 hashes.</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 10 }}>hdfs://namenode:9000/cropshock/bronze</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '20px' }}>
            <div style={{ color: '#a78bfa', fontWeight: 700, fontSize: '0.92rem', marginBottom: 8 }}>3. SILVER LAYER</div>
            <div style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.6 }}>PySpark deduplication, schema validation & quarantine outlier gating.</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 10 }}>Deduplicated: (market, commodity, date)</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '20px' }}>
            <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.92rem', marginBottom: 8 }}>4. GOLD LAYER</div>
            <div style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.6 }}>Rolling baselines (MA_7, MA_30), weather correlation & supply-risk scoring.</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 10 }}>Serving: PostgreSQL 16 + FastAPI</div>
          </div>
        </div>
      </div>
    </div>
  );
};
