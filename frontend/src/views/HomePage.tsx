import React from 'react';
import { UserRole, DEMO_PROFILES } from '../types/auth';
import { OverviewKPI } from '../types';
import { 
  Sprout, TrendingUp, Calculator, GitCompare, 
  MapPin, Building2, Landmark, Database, ShieldCheck, 
  Activity, ArrowRight, Lock, CheckCircle2, LogIn, 
  Layers, BarChart3, CloudRain, Compass, ChevronRight, Sparkles 
} from 'lucide-react';

interface HomePageProps {
  onSelectRole: (role: UserRole) => void;
  onOpenLogin: () => void;
  kpi: OverviewKPI | null;
  marketsCount: number;
  commoditiesCount: number;
  observationsCount: number;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectRole,
  onOpenLogin,
  kpi,
  marketsCount,
  commoditiesCount,
  observationsCount,
}) => {
  const personas = [
    {
      role: 'PROCUREMENT_MANAGER' as UserRole,
      title: 'B2B Procurement Director',
      name: 'Rajesh Patel',
      org: 'Gujarat AgriFoods & Processors Pvt Ltd',
      location: 'Ahmedabad Hub',
      icon: Building2,
      badge: 'B2B SOURCING',
      accentColor: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.12)',
      borderColor: 'rgba(16, 185, 129, 0.35)',
      description: 'Capitalize on inter-mandi price spreads and compute lowest landed cartage cost with vectorized Haversine routing.',
      primaryViews: ['Procurement Cost Planner', 'Cross-Mandi Arbitrage Matrix'],
      keyBenefit: 'Saves 12% - 24% on bulk wholesale vegetable cartage.'
    },
    {
      role: 'FPO_LEADER' as UserRole,
      title: 'FPO Collective Chairman',
      name: 'Vikrambhai Chaudhary',
      org: 'Sabarkantha Vegetable Growers FPO',
      location: 'Sabarkantha Cluster',
      icon: Sprout,
      badge: 'FPO COLLECTIVE',
      accentColor: '#34d399',
      bgGlow: 'rgba(52, 211, 153, 0.12)',
      borderColor: 'rgba(52, 211, 153, 0.35)',
      description: 'Track real-time wholesale price spikes to dispatch harvested member produce to highest-realization APMC mandis.',
      primaryViews: ['Executive Command Center', 'Vegetable Intelligence Hub'],
      keyBenefit: 'Bypasses intermediary cuts with transparent price discovery.'
    },
    {
      role: 'APMC_OFFICIAL' as UserRole,
      title: 'APMC Mandi Secretary',
      name: 'Dr. Hasmukh Shah',
      org: 'Gondal APMC Market Committee',
      location: 'Rajkot / Gondal Yard',
      icon: Landmark,
      badge: 'STATUTORY APMC',
      accentColor: '#818cf8',
      bgGlow: 'rgba(129, 140, 248, 0.12)',
      borderColor: 'rgba(129, 140, 248, 0.35)',
      description: 'Monitor statutory yard arrival compliance, electronic weighbridge calibrations, and daily 1.5% market cess collections.',
      primaryViews: ['Statewide APMC Directory', 'Gujarat Market Pulse Map'],
      keyBenefit: 'Statutory compliance under Gujarat APMC Act, 1963.'
    },
    {
      role: 'DATA_ENGINEER' as UserRole,
      title: 'Big Data Platform Lead',
      name: 'Ananya Desai',
      org: 'CropShock AgData Lakehouse Team',
      location: 'Gandhinagar Tech Hub',
      icon: Database,
      badge: 'BIG DATA LEAD',
      accentColor: '#f59e0b',
      bgGlow: 'rgba(245, 158, 11, 0.12)',
      borderColor: 'rgba(245, 158, 11, 0.35)',
      description: 'Oversee Bronze batch ingestion, SHA-256 hash audits, PySpark window partitioned aggregations, and Star Schema datamarts.',
      primaryViews: ['Data Lakehouse Telemetry', 'Power BI Export Center'],
      keyBenefit: '100.0% data quality pass rate with sub-15ms p95 latency.'
    }
  ];

  const zones = [
    { name: 'Saurashtra', count: '11 Districts', mandis: 'Gondal, Rajkot, Mahuva, Bhavnagar, Junagadh, Jamnagar, Amreli, Morbi...', crops: 'Garlic, Onion, Chilli, Cumin' },
    { name: 'Central Gujarat & Charotar', count: '7 Districts', mandis: 'Ahmedabad (Jamalpur/Naroda), Anand, Nadiad, Vadodara, Godhra, Bodeli...', crops: 'Tomato, Sweet Corn, Cabbage, Okra' },
    { name: 'North Gujarat', count: '6 Districts', mandis: 'Deesa (Cold Storage Hub), Palanpur, Mehsana, Unjha, Patan, Himatnagar...', crops: 'Potato Hub, Cluster Beans, Spices' },
    { name: 'South Gujarat', count: '7 Districts', mandis: 'Surat (Sardar Market), Bardoli, Navsari, Valsad, Bharuch, Ahwa Sub-Yard...', crops: 'Tropical Gourds, Flat Beans, Ginger' },
    { name: 'Kutch', count: '1 District', mandis: 'Bhuj APMC, Gandhidham APMC...', crops: 'Semi-Arid Onion, Tomato, Carrot' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at 50% 10%, rgba(16, 185, 129, 0.12) 0%, #070b14 65%)', color: '#f8fafc', paddingBottom: 60 }}>
      {/* Public Navbar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 48px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(7, 11, 20, 0.85)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #10b981, #047857)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
          }}>
            <Sprout size={24} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
              CropShock
            </div>
            <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Gujarat Agricultural Lakehouse
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', gap: 8, marginRight: 16 }}>
            <span className="badge badge-emerald">All 33 Districts</span>
            <span className="badge badge-indigo">40 APMC Mandis</span>
            <span className="badge badge-amber">40 Vegetables</span>
          </div>
          <button 
            className="btn btn-primary"
            style={{ padding: '10px 22px', fontSize: '0.92rem', boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)' }}
            onClick={onOpenLogin}
          >
            <LogIn size={17} /> Sign In / Enter Workspace
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ maxWidth: 1240, margin: '0 auto', padding: '60px 24px 40px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 30,
          padding: '6px 18px',
          marginBottom: 24,
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.15)'
        }}>
          <Sparkles size={16} color="#34d399" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399', letterSpacing: '0.04em' }}>
            ENTERPRISE AGRICULTURAL SUPPLY CHAIN & ARBITRAGE LAKEHOUSE
          </span>
        </div>

        <h1 style={{
          fontSize: '3.1rem',
          fontWeight: 800,
          lineHeight: 1.18,
          marginBottom: 20,
          letterSpacing: '-0.03em',
          background: 'linear-gradient(180deg, #ffffff 40%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Statewide Market Intelligence Across<br />
          <span style={{ color: '#10b981', WebkitTextFillColor: '#10b981' }}>All 33 Districts</span> of Gujarat
        </h1>

        <p style={{
          fontSize: '1.12rem',
          color: '#cbd5e1',
          maxWidth: 820,
          margin: '0 auto 36px',
          lineHeight: 1.7
        }}>
          CropShock unifies daily Agmarknet spot auctions, Open-Meteo microclimate telemetry, and vectorized Haversine 
          highway freight algorithms into an automated Medallion Big Data Lakehouse. Select your stakeholder role below 
          to access your tailored operational intelligence workspace.
        </p>

        {/* Live System Inflow Metric Ticker */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          maxWidth: 1080,
          margin: '0 auto 56px',
          textAlign: 'left'
        }}>
          <div className="glass-card" style={{ padding: '18px 22px', borderLeft: '4px solid #10b981' }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Active Mandi Yards</div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', marginTop: 4 }}>{marketsCount || 40} APMCs</div>
            <div style={{ fontSize: '0.76rem', color: '#34d399', marginTop: 2 }}>All 33 Gujarat Districts</div>
          </div>

          <div className="glass-card" style={{ padding: '18px 22px', borderLeft: '4px solid #38bdf8' }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Tracked Commodities</div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', marginTop: 4 }}>{commoditiesCount || 40} Crops</div>
            <div style={{ fontSize: '0.76rem', color: '#38bdf8', marginTop: 2 }}>Perishability calibrated</div>
          </div>

          <div className="glass-card" style={{ padding: '18px 22px', borderLeft: '4px solid #a855f7' }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Daily Inflow Volume</div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', marginTop: 4 }}>{kpi ? kpi.total_tonnage_mt.toLocaleString() : '5,820'} MT</div>
            <div style={{ fontSize: '0.76rem', color: '#c084fc', marginTop: 2 }}>Statewide aggregate volume</div>
          </div>

          <div className="glass-card" style={{ padding: '18px 22px', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Serving Query Latency</div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', marginTop: 4 }}>&lt; 15 ms</div>
            <div style={{ fontSize: '0.76rem', color: '#fbbf24', marginTop: 2 }}>Indexed relational B-Tree</div>
          </div>
        </div>

        {/* Section Heading: Role-Based Access Gate */}
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: 10 }}>
            Choose Your Stakeholder Workspace
          </h2>
          <p style={{ fontSize: '0.96rem', color: '#94a3b8', maxWidth: 640, margin: '0 auto' }}>
            The platform dynamically reorganizes its telemetry, analytical tools, and action shortcuts based on your industry persona.
          </p>
        </div>

        {/* 4 Persona Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
          maxWidth: 1200,
          margin: '0 auto 60px',
          textAlign: 'left'
        }}>
          {personas.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.role}
                className="glass-card"
                style={{
                  padding: '28px 26px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: p.bgGlow,
                  borderColor: p.borderColor,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer'
                }}
                onClick={() => onSelectRole(p.role)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = `0 14px 30px ${p.bgGlow}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: `1px solid ${p.borderColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: p.accentColor
                    }}>
                      <Icon size={22} />
                    </div>
                    <span className="badge" style={{ background: p.bgGlow, color: p.accentColor, border: `1px solid ${p.borderColor}` }}>
                      {p.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                    {p.title}
                  </h3>
                  <div style={{ fontSize: '0.86rem', color: '#e2e8f0', fontWeight: 600, marginBottom: 2 }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 16 }}>
                    {p.org} • <span style={{ color: p.accentColor }}>{p.location}</span>
                  </div>

                  <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: 18 }}>
                    {p.description}
                  </p>

                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 6 }}>
                      Primary Workspaces:
                    </div>
                    {p.primaryViews.map((v) => (
                      <div key={v} style={{ fontSize: '0.82rem', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <CheckCircle2 size={13} color={p.accentColor} /> {v}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    fontSize: '0.78rem',
                    color: p.accentColor,
                    marginBottom: 16
                  }}>
                    💡 {p.keyBenefit}
                  </div>

                  <button
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      background: `linear-gradient(135deg, ${p.accentColor}, #0f172a)`,
                      borderColor: p.borderColor,
                      color: '#fff',
                      fontWeight: 700,
                      boxShadow: `0 0 12px ${p.bgGlow}`
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRole(p.role);
                    }}
                  >
                    Enter Workspace <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Login Alternative */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 16,
          padding: '24px 32px',
          maxWidth: 720,
          margin: '0 auto 60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 18
        }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem', marginBottom: 4 }}>
              Have an enterprise account or corporate credentials?
            </div>
            <div style={{ fontSize: '0.86rem', color: '#94a3b8' }}>
              Sign in with your organization email and JWT token session.
            </div>
          </div>
          <button className="btn btn-outline" onClick={onOpenLogin}>
            <Lock size={15} /> Sign In with Password
          </button>
        </div>

        {/* 5 Agro-Climatic Zones of Gujarat */}
        <div style={{ maxWidth: 1100, margin: '0 auto 60px', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span className="badge badge-emerald">GEOGRAPHIC REACH</span>
            <span style={{ fontSize: '0.86rem', color: '#94a3b8' }}>All 5 Agro-Climatic Zones of Gujarat</span>
          </div>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: 20 }}>
            Taluka Catchment & Regional Mandi Clusters
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            {zones.map(z => (
              <div key={z.name} className="glass-card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>{z.name}</div>
                  <span className="badge badge-indigo">{z.count}</span>
                </div>
                <div style={{ fontSize: '0.84rem', color: '#94a3b8', marginBottom: 8 }}>
                  <strong>Key Mandis:</strong> {z.mandis}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#34d399' }}>
                  <strong>Specialization:</strong> {z.crops}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Architectural Pillars */}
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span className="badge badge-emerald">ARCHITECTURE & DATA LAKE</span>
            <span style={{ fontSize: '0.86rem', color: '#94a3b8' }}>Enterprise Technology Stack</span>
          </div>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: 20 }}>
            Medallion Pattern & Big Data Technology
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ color: '#d97706', marginBottom: 12 }}><Layers size={24} /></div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 8 }}>Bronze Lake (Immutable)</h4>
              <p style={{ fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Raw Agmarknet spot auction JSON & Parquet partitions with SHA-256 batch cryptographic hashes and full audit lineage.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ color: '#38bdf8', marginBottom: 12 }}><ShieldCheck size={24} /></div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 8 }}>Silver Conformed</h4>
              <p style={{ fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.6 }}>
                PySpark composite key deduplication over (market, crop, date), dynamic commodity price bounds, and zero-quarantine data gates.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ color: '#10b981', marginBottom: 12 }}><Activity size={24} /></div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 8 }}>Gold Analytical Marts</h4>
              <p style={{ fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.6 }}>
                7d, 14d, and 30d rolling window partitioned averages, supply shock Z-scores, and Open-Meteo rainfall correlation.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ color: '#f59e0b', marginBottom: 12 }}><BarChart3 size={24} /></div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 8 }}>Power BI Star Schema</h4>
              <p style={{ fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Certified Kimball dimensional export tables (Dim_Market, Dim_Commodity, Fact_Arrivals) with production enterprise DAX.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 60,
        paddingTop: 30,
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        textAlign: 'center',
        fontSize: '0.84rem',
        color: '#64748b'
      }}>
        <div style={{ marginBottom: 6 }}>
          Regulated under the <strong>Gujarat Agricultural Produce Markets Act, 1963</strong> • All 33 Administrative Districts of Gujarat
        </div>
        <div>
          CropShock Intelligence Platform • DA-IICT AgData Engineering • 2026
        </div>
      </footer>
    </div>
  );
};

