import React, { useState, useEffect } from 'react';
import { 
  fetchMarkets, fetchCommodities, fetchOverview, 
  fetchSupplyRisks, fetchHealth 
} from './api';
import { Market, Commodity, OverviewKPI, SupplyRiskItem, PipelineHealth } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginModal } from './components/LoginModal';
import { UserProfileMenu } from './components/UserProfileMenu';

// Views
import { HomePage } from './views/HomePage';
import { ExecutiveOverview } from './views/ExecutiveOverview';
import { MarketPulseMap } from './views/MarketPulseMap';
import { MarketExplorer } from './views/MarketExplorer';
import { VegetableIntelligence } from './views/VegetableIntelligence';
import { ArbitrageMatrix } from './views/ArbitrageMatrix';
import { ProcurementPlanner } from './views/ProcurementPlanner';
import { PipelineObservability } from './views/PipelineObservability';
import { PowerBIExport } from './views/PowerBIExport';

// Icons
import { 
  TrendingUp, Map, Compass, Sprout, GitCompare, 
  Calculator, Activity, FileSpreadsheet, HardDrive, 
  Layers, CheckCircle, RefreshCw, UserCheck, ShieldCheck, Home, LogOut 
} from 'lucide-react';
import { DEMO_PROFILES } from './types/auth';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(() => {
    const param = new URLSearchParams(window.location.search).get('tab');
    return param || 'overview';
  });
  const [markets, setMarkets] = useState<Market[]>([]);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [kpi, setKpi] = useState<OverviewKPI | null>(null);
  const [risks, setRisks] = useState<SupplyRiskItem[]>([]);
  const [health, setHealth] = useState<PipelineHealth | null>(null);
  const [selectedCommodityId, setSelectedCommodityId] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const { currentUser, openLoginModal, loginAsRole, logout } = useAuth();

  const loadData = async () => {
    try {
      setLoading(true);
      const [mkts, cmds, ov, rk, hl] = await Promise.all([
        fetchMarkets(),
        fetchCommodities(),
        fetchOverview(),
        fetchSupplyRisks(),
        fetchHealth()
      ]);
      setMarkets(mkts);
      setCommodities(cmds);
      setKpi(ov);
      setRisks(rk);
      setHealth(hl);
    } catch (err) {
      console.error('[APP] Data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const navItems = [
    { id: 'overview', label: 'Executive Overview', icon: TrendingUp },
    { id: 'map', label: 'Gujarat Market Pulse (Map)', icon: Map },
    { id: 'explorer', label: 'Statewide APMC Directory', icon: Compass },
    { id: 'vegetable', label: 'Vegetable Intelligence Hub', icon: Sprout },
    { id: 'arbitrage', label: 'Cross-Mandi Arbitrage', icon: GitCompare },
    { id: 'procurement', label: 'Procurement Cost Planner', icon: Calculator },
    { id: 'pipeline', label: 'Big Data Lake & Hadoop', icon: Activity },
    { id: 'powerbi', label: 'Power BI Export Center', icon: FileSpreadsheet },
  ];

  const selectedCrop = commodities.find(c => c.id === selectedCommodityId);

  // If no user is signed in, display the Public Home / Landing Page
  if (!currentUser) {
    return (
      <>
        <LoginModal />
        <HomePage
          onSelectRole={async (role) => {
            await loginAsRole(role);
            const profile = DEMO_PROFILES[role];
            if (profile && profile.primaryTabs && profile.primaryTabs.length > 0) {
              setActiveTab(profile.primaryTabs[0]);
            }
          }}
          onOpenLogin={openLoginModal}
          kpi={kpi}
          marketsCount={markets.length}
          commoditiesCount={commodities.length}
          observationsCount={health?.total_observations_recorded || 59541}
        />
      </>
    );
  }

  return (
    <div className="app-container">
      {/* Identity & Authentication Modal */}
      <LoginModal />

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-badge">
            <div className="brand-icon">
              <Sprout size={24} />
            </div>
            <div className="brand-text">
              <h1>CropShock</h1>
              <div className="brand-tag">GUJARAT AGRI-INTELLIGENCE</div>
            </div>
          </div>
        </div>

        <nav className="nav-menu">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isPrimaryForRole = currentUser?.primaryTabs?.includes(item.id);

            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                style={{ position: 'relative' }}
              >
                <Icon size={18} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {isPrimaryForRole && (
                  <span 
                    style={{ 
                      fontSize: '0.68rem', 
                      padding: '2px 6px', 
                      borderRadius: 4, 
                      background: 'rgba(16, 185, 129, 0.2)', 
                      color: '#34d399', 
                      fontWeight: 700, 
                      letterSpacing: '0.04em' 
                    }}
                  >
                    CORE
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Stakeholder Persona Indicator in Sidebar */}
        {currentUser ? (
          <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(16, 185, 129, 0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Logged-In Persona
              </span>
              <button 
                onClick={openLoginModal}
                style={{ background: 'none', border: 'none', color: '#34d399', fontSize: '0.74rem', cursor: 'pointer', fontWeight: 600 }}
              >
                Switch
              </button>
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff' }}>{currentUser.name}</div>
            <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>{currentUser.roleLabel}</div>
          </div>
        ) : null}

        <div className="sidebar-footer">
          <div className="status-indicator">
            <div className="pulse-dot"></div>
            <div>
              <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.82rem' }}>HADOOP LAKEHOUSE ONLINE</div>
              <div style={{ color: '#94a3b8', fontSize: '0.74rem' }}>All 33 Districts • 40 Mandis Synced</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-wrapper">
        {/* Top Header Bar */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="view-title">
              {navItems.find(n => n.id === activeTab)?.label}
            </div>
            <span className="badge badge-emerald">
              Gujarat 33 Districts Scope
            </span>
            {health?.hdfs_cluster_status && (
              <span className="badge badge-indigo">
                <HardDrive size={13} /> HDFS Parquet Lake
              </span>
            )}
          </div>

          <div className="topbar-right">
            {/* Quick Commodity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600 }}>Vegetable:</span>
              <select
                className="select-control"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                value={selectedCommodityId}
                onChange={(e) => setSelectedCommodityId(Number(e.target.value))}
              >
                {commodities.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.local_name_gu ? `(${c.local_name_gu})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <button className="btn btn-outline" style={{ padding: '8px 14px', fontSize: '0.85rem' }} onClick={loadData}>
              <RefreshCw size={14} /> Refresh
            </button>

            <button 
              className="btn btn-outline" 
              style={{ padding: '8px 14px', fontSize: '0.85rem', borderColor: 'rgba(255, 255, 255, 0.15)' }} 
              onClick={logout}
              title="Return to Public Landing Page"
            >
              <Home size={14} /> Exit to Home
            </button>

            {/* User Profile / Login Button */}
            <UserProfileMenu />
          </div>
        </header>

        {/* Viewport Render */}
        <div className="page-content">
          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
              <div className="pulse-dot" style={{ margin: '0 auto 16px auto', width: 16, height: 16 }}></div>
              <div style={{ fontWeight: 600, fontSize: '1rem', color: '#fff' }}>Loading Gujarat Agricultural Market Intelligence...</div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <ExecutiveOverview
                  kpi={kpi}
                  markets={markets}
                  commodities={commodities}
                  risks={risks}
                  onNavigateTab={setActiveTab}
                  onSelectCommodity={setSelectedCommodityId}
                />
              )}

              {activeTab === 'map' && (
                <MarketPulseMap
                  markets={markets}
                  commodities={commodities}
                  risks={risks}
                  selectedCommodityId={selectedCommodityId}
                  onSelectCommodity={setSelectedCommodityId}
                />
              )}

              {activeTab === 'explorer' && (
                <MarketExplorer
                  markets={markets}
                  onSelectMarket={() => setActiveTab('map')}
                />
              )}

              {activeTab === 'vegetable' && (
                <VegetableIntelligence
                  commodities={commodities}
                  markets={markets}
                  selectedCommodityId={selectedCommodityId}
                  onSelectCommodity={setSelectedCommodityId}
                />
              )}

              {activeTab === 'arbitrage' && (
                <ArbitrageMatrix
                  commodities={commodities}
                  markets={markets}
                  selectedCommodityId={selectedCommodityId}
                  onSelectCommodity={setSelectedCommodityId}
                />
              )}

              {activeTab === 'procurement' && (
                <ProcurementPlanner
                  commodities={commodities}
                  selectedCommodityId={selectedCommodityId}
                />
              )}

              {activeTab === 'pipeline' && (
                <PipelineObservability />
              )}

              {activeTab === 'powerbi' && (
                <PowerBIExport />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

// Error Boundary to prevent blank screen if any component fails
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[CRITICAL] App Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem('cropshock_auth_profile');
    localStorage.removeItem('cropshock_jwt_token');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#070b14',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: 16,
            padding: '36px 40px',
            maxWidth: '560px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚠️</div>
            <h2 style={{ color: '#f87171', fontSize: '1.4rem', marginBottom: 8 }}>
              Dashboard UI Recovery
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 20 }}>
              An interface rendering error occurred. You can reset your session cache to reload cleanly.
            </p>
            <div style={{
              background: 'rgba(0,0,0,0.4)',
              padding: '12px 16px',
              borderRadius: 8,
              fontSize: '0.82rem',
              color: '#fca5a5',
              fontFamily: 'monospace',
              textAlign: 'left',
              marginBottom: 24,
              overflowX: 'auto'
            }}>
              {this.state.error?.message || 'Unknown render exception'}
            </div>
            <button
              onClick={this.handleReset}
              style={{
                background: '#10b981',
                color: '#fff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: 8,
                fontSize: '0.92rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reset Session &amp; Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
