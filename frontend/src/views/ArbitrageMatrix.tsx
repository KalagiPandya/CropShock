import React, { useState, useEffect } from 'react';
import { Commodity, Market } from '../types';
import { fetchComparison } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  GitCompare, TrendingUp, AlertTriangle, ArrowRight, 
  ShieldCheck, DollarSign, X, Check, Search, MapPin, Sparkles 
} from 'lucide-react';

interface ArbitrageMatrixProps {
  commodities: Commodity[];
  markets: Market[];
  selectedCommodityId: number;
  onSelectCommodity: (id: number) => void;
}

export const ArbitrageMatrix: React.FC<ArbitrageMatrixProps> = ({
  commodities,
  markets,
  selectedCommodityId,
  onSelectCommodity
}) => {
  const { currentUser } = useAuth();
  const [selectedMarketIds, setSelectedMarketIds] = useState<number[]>([1, 2, 14, 30]); // Gondal, Rajkot, Ahmedabad, Surat
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [zoneFilter, setZoneFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchComparison(selectedCommodityId, selectedMarketIds.join(',')).then(setComparisonData).catch(console.error);
  }, [selectedCommodityId, selectedMarketIds]);

  const toggleMarket = (id: number) => {
    if (selectedMarketIds.includes(id)) {
      if (selectedMarketIds.length > 2) {
        setSelectedMarketIds(selectedMarketIds.filter(i => i !== id));
      }
    } else {
      if (selectedMarketIds.length < 5) {
        setSelectedMarketIds([...selectedMarketIds, id]);
      }
    }
  };

  const removeMarket = (id: number) => {
    if (selectedMarketIds.length > 2) {
      setSelectedMarketIds(selectedMarketIds.filter(i => i !== id));
    }
  };

  const applyPreset = (ids: number[]) => {
    setSelectedMarketIds(ids);
  };

  const selectedCrop = commodities.find(c => c.id === selectedCommodityId);

  // Filtered market options for selection
  const filteredMarkets = markets.filter(m => {
    const matchesZone = zoneFilter === 'ALL' || m.zone.toLowerCase() === zoneFilter.toLowerCase();
    const matchesSearch = !searchQuery || 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesZone && matchesSearch;
  });

  const zones = ['ALL', 'Saurashtra', 'Central Gujarat', 'North Gujarat', 'South Gujarat', 'Kutch'];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Configuration Header */}
      <div className="glass-card" style={{ padding: '26px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span className="badge badge-emerald">ARBITRAGE DETECTION ENGINE</span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Multi-Mandi Wholesale Price Dispersion</span>
          </div>
          <h2 style={{ fontSize: '1.45rem', color: '#fff', marginBottom: 6 }}>
            Cross-Mandi Arbitrage Matrix — {selectedCrop?.name} {selectedCrop?.local_name_gu ? `(${selectedCrop.local_name_gu})` : ''}
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#94a3b8', lineHeight: 1.6 }}>
            Benchmarks spot modal prices, arrival volumes, and geographic spreads across key Gujarat wholesale nodes.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600 }}>Target Commodity:</span>
          <select
            className="select-control"
            style={{ minWidth: '220px' }}
            value={selectedCommodityId}
            onChange={(e) => onSelectCommodity(Number(e.target.value))}
          >
            {commodities.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} {c.local_name_gu ? `(${c.local_name_gu})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Benchmark APMCs & Presets */}
      <div className="glass-card" style={{ padding: '24px 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
              Active Benchmark Nodes
            </span>
            <span className="badge badge-emerald">
              {selectedMarketIds.length} of 5 Selected (Min: 2)
            </span>
          </div>

          {/* Quick Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 500, marginRight: 4 }}>
              Presets:
            </span>
            <button 
              className="btn btn-outline" 
              style={{ padding: '6px 12px', fontSize: '0.82rem' }}
              onClick={() => applyPreset([1, 2, 14, 30])}
            >
              Default Core Hubs
            </button>
            <button 
              className="btn btn-outline" 
              style={{ padding: '6px 12px', fontSize: '0.82rem' }}
              onClick={() => applyPreset([1, 2, 7, 10])}
            >
              Saurashtra Hubs
            </button>
            <button 
              className="btn btn-outline" 
              style={{ padding: '6px 12px', fontSize: '0.82rem' }}
              onClick={() => applyPreset([14, 15, 17, 18])}
            >
              Central Gujarat
            </button>
            <button 
              className="btn btn-outline" 
              style={{ padding: '6px 12px', fontSize: '0.82rem' }}
              onClick={() => applyPreset([22, 23, 24, 12])}
            >
              North & Border
            </button>
          </div>
        </div>

        {/* Selected Mandis Chips with Remove Button */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
          {selectedMarketIds.map(id => {
            const m = markets.find(item => item.id === id);
            if (!m) return null;
            return (
              <div
                key={id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 14px',
                  borderRadius: 10,
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                <MapPin size={15} style={{ color: '#34d399' }} />
                <span>{m.name.replace(' APMC', '')}</span>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>({m.district})</span>
                {selectedMarketIds.length > 2 && (
                  <button
                    onClick={() => removeMarket(id)}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#cbd5e1',
                      marginLeft: 4,
                      transition: 'all 0.2s'
                    }}
                    title="Remove from benchmark"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Zone Tabs & Add Mandi Selector */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, marginRight: 4 }}>
                Filter by Zone:
              </span>
              {zones.map(z => (
                <button
                  key={z}
                  onClick={() => setZoneFilter(z)}
                  className={`btn ${zoneFilter === z ? 'btn-primary' : 'btn-outline'}`}
                  style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                >
                  {z}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: 11, color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search mandi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ width: '100%', paddingLeft: 34, paddingRight: 10, paddingTop: 6, paddingBottom: 6, fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxHeight: '160px', overflowY: 'auto', padding: '4px 0' }}>
            {filteredMarkets.map(m => {
              const isSelected = selectedMarketIds.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => toggleMarket(m.id)}
                  disabled={!isSelected && selectedMarketIds.length >= 5}
                  className={`btn ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                  style={{ 
                    padding: '7px 14px', 
                    fontSize: '0.85rem',
                    opacity: (!isSelected && selectedMarketIds.length >= 5) ? 0.4 : 1,
                    cursor: (!isSelected && selectedMarketIds.length >= 5) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSelected && <Check size={14} style={{ marginRight: 2 }} />}
                  {m.name.replace(' APMC', '')} ({m.district})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary KPI Callouts */}
      {comparisonData && (
        <div className="stats-grid">
          <div className="stat-card" style={{ padding: '24px' }}>
            <div className="stat-header">
              <span className="stat-label">Max Inter-Mandi Spread</span>
              <div className="stat-icon" style={{ color: '#10b981' }}><DollarSign size={20} /></div>
            </div>
            <div className="stat-value">
              ₹{comparisonData.max_inter_mandi_price_spread} <span style={{ fontSize: '1.05rem', fontWeight: 500, color: '#94a3b8' }}>/Qtl</span>
            </div>
            <div className="stat-sub">Spread between lowest & highest mandi</div>
          </div>

          <div className="stat-card" style={{ padding: '24px' }}>
            <div className="stat-header">
              <span className="stat-label">Arbitrage Potential</span>
              <div className="stat-icon" style={{ color: '#f59e0b' }}><TrendingUp size={20} /></div>
            </div>
            <div className="stat-value" style={{ color: '#fbbf24' }}>
              +{comparisonData.arbitrage_potential_pct}%
            </div>
            <div className="stat-sub">Gross price divergence potential</div>
          </div>

          <div className="stat-card" style={{ padding: '24px' }}>
            <div className="stat-header">
              <span className="stat-label">Lowest Cost Mandi</span>
              <div className="stat-icon" style={{ color: '#38bdf8' }}><ShieldCheck size={20} /></div>
            </div>
            <div className="stat-value" style={{ fontSize: '1.4rem' }}>
              {comparisonData.markets[0]?.market_name || 'N/A'}
            </div>
            <div className="stat-sub">Spot Modal: ₹{comparisonData.markets[0]?.modal_price}/Qtl</div>
          </div>

          <div className="stat-card" style={{ padding: '24px' }}>
            <div className="stat-header">
              <span className="stat-label">Highest Premium Mandi</span>
              <div className="stat-icon" style={{ color: '#a855f7' }}><ArrowRight size={20} /></div>
            </div>
            <div className="stat-value" style={{ fontSize: '1.4rem' }}>
              {comparisonData.markets[comparisonData.markets.length - 1]?.market_name || 'N/A'}
            </div>
            <div className="stat-sub">Spot Modal: ₹{comparisonData.markets[comparisonData.markets.length - 1]?.modal_price}/Qtl</div>
          </div>
        </div>
      )}

      {/* Side-by-Side Mandi Comparison Cards */}
      {comparisonData && (
        <div className="comparison-grid">
          {comparisonData.markets.map((m: any, idx: number) => {
            const isLowest = idx === 0;
            const isHighest = idx === comparisonData.markets.length - 1;

            return (
              <div
                key={m.market_id}
                className="mandi-card"
                style={{
                  padding: '26px',
                  borderColor: isLowest ? 'rgba(16, 185, 129, 0.5)' : (isHighest ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)'),
                  background: isLowest ? 'rgba(16, 185, 129, 0.06)' : 'var(--bg-card)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span className="badge badge-emerald">{m.zone}</span>
                  {currentUser?.role === 'FPO_LEADER' ? (
                    <>
                      {isHighest && <span className="badge badge-emerald">★ Highest Farmer Payout</span>}
                      {isLowest && <span className="badge badge-amber">Local Saturated Mandi</span>}
                    </>
                  ) : (
                    <>
                      {isLowest && <span className="badge badge-emerald">★ Lowest Cost Source</span>}
                      {isHighest && <span className="badge badge-crimson">Highest Consumption Terminal</span>}
                    </>
                  )}
                </div>

                <div style={{ marginTop: 4 }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: 4 }}>{m.market_name}</h3>
                  <div style={{ fontSize: '0.86rem', color: '#94a3b8' }}>District: {m.district}</div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 14, marginTop: 4 }}>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                    Spot Modal Price
                  </div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 700, color: '#fff', lineHeight: 1.2, margin: '4px 0' }}>
                    ₹{m.modal_price} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#94a3b8' }}>/Qtl</span>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#64748b' }}>
                    Range: ₹{m.min_price} – ₹{m.max_price}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#cbd5e1', paddingTop: 6 }}>
                  <span>Daily Tonnage:</span>
                  <strong style={{ color: '#10b981' }}>{m.arrival_quantity} MT</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', color: '#cbd5e1' }}>
                  <span>Supply Risk:</span>
                  <span className={`badge ${
                    m.risk_level === 'HIGH' ? 'badge-crimson' :
                    m.risk_level === 'MODERATE' ? 'badge-amber' : 'badge-emerald'
                  }`} style={{ padding: '3px 10px', fontSize: '0.76rem' }}>
                    {m.risk_level} ({m.risk_score})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
