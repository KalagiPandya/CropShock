import React, { useState, useEffect } from 'react';
import { Market, Commodity, SupplyRiskItem, TrendPoint } from '../types';
import { GujaratMap } from '../components/GujaratMap';
import { TrendChart } from '../components/TrendChart';
import { fetchTrends } from '../api';
import { MapPin, AlertCircle, CloudRain, Thermometer, ShieldAlert, Layers } from 'lucide-react';

interface MarketPulseMapProps {
  markets: Market[];
  commodities: Commodity[];
  risks: SupplyRiskItem[];
  selectedCommodityId: number;
  onSelectCommodity: (id: number) => void;
}

export const MarketPulseMap: React.FC<MarketPulseMapProps> = ({
  markets,
  commodities,
  risks,
  selectedCommodityId,
  onSelectCommodity
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [activeMarket, setActiveMarket] = useState<Market>(markets[0] || null);
  const [marketTrends, setMarketTrends] = useState<TrendPoint[]>([]);

  const filteredMarkets = selectedZone === 'ALL'
    ? markets
    : markets.filter(m => m.zone.toLowerCase().includes(selectedZone.toLowerCase()));

  useEffect(() => {
    if (activeMarket) {
      fetchTrends(selectedCommodityId, activeMarket.id).then(setMarketTrends).catch(console.error);
    }
  }, [activeMarket, selectedCommodityId]);

  const activeRisk = risks.find(r => r.market_id === activeMarket?.id && r.commodity_id === selectedCommodityId);
  const selectedCrop = commodities.find(c => c.id === selectedCommodityId);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Filters Bar */}
      <div className="glass-card" style={{ padding: '24px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Layers size={20} style={{ color: '#10b981' }} />
          <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>Agro-Climatic Zone:</span>
          {['ALL', 'Saurashtra', 'Central Gujarat', 'North Gujarat', 'South Gujarat', 'Kutch'].map(z => (
            <button
              key={z}
              className={`btn ${selectedZone === z ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              onClick={() => setSelectedZone(z)}
            >
              {z}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600 }}>Filter Commodity:</span>
          <select
            className="select-control"
            value={selectedCommodityId}
            onChange={(e) => onSelectCommodity(Number(e.target.value))}
          >
            {commodities.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} {c.local_name_gu ? `(${c.local_name_gu})` : ''} — {c.botanical_group}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Gujarat Map + Selected Mandi Detail Drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 28 }}>
        {/* Gujarat Interactive Map Canvas */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div className="card-header" style={{ marginBottom: 18 }}>
            <div className="card-title">
              <MapPin size={20} style={{ color: '#10b981' }} />
              Statewide Gujarat APMC Mandi Network ({filteredMarkets.length} Yards)
            </div>
            <span style={{ fontSize: '0.86rem', color: '#94a3b8' }}>
              Showing {selectedCrop?.name || 'Vegetables'} Inflow
            </span>
          </div>

          <GujaratMap
            markets={filteredMarkets}
            risks={risks.filter(r => r.commodity_id === selectedCommodityId)}
            selectedMarketId={activeMarket?.id}
            onSelectMarket={setActiveMarket}
          />
        </div>

        {/* Selected Mandi Live Dossier */}
        <div className="glass-card" style={{ padding: '28px 30px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {activeMarket ? (
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span className="badge badge-emerald">{activeMarket.zone}</span>
                  <span className={`badge ${
                    activeRisk?.risk_level === 'HIGH' ? 'badge-crimson' :
                    activeRisk?.risk_level === 'MODERATE' ? 'badge-amber' : 'badge-emerald'
                  }`}>
                    {activeRisk?.risk_level || 'LOW'} RISK
                  </span>
                </div>
                <h3 style={{ fontSize: '1.45rem', color: '#fff', marginBottom: 4 }}>{activeMarket.name}</h3>
                <div style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
                  District: <strong style={{ color: '#f1f5f9' }}>{activeMarket.district}</strong> • Taluka: {activeMarket.taluka}
                </div>
              </div>

              {/* Catchment Info */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px 18px', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.88rem', color: '#cbd5e1', marginBottom: 6, lineHeight: 1.5 }}>
                  Catchment Base: <strong style={{ color: '#10b981' }}>~{activeMarket.catchment_villages_approx} rural villages</strong> funneling harvest cartage.
                </div>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                  Statutory Regulated Mandi Yard • Gujarat APMC Act 1963
                </div>
              </div>

              {/* Supply Risk Diagnostic Card */}
              {activeRisk && (
                <div style={{
                  background: activeRisk.risk_level === 'HIGH' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                  border: `1px solid ${activeRisk.risk_level === 'HIGH' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                  borderRadius: 12,
                  padding: '16px 18px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: activeRisk.risk_level === 'HIGH' ? '#f87171' : '#fbbf24', fontWeight: 600, fontSize: '0.92rem' }}>
                    <ShieldAlert size={18} /> Supply Shock Diagnostic ({activeRisk.risk_score} / 100)
                  </div>
                  <ul style={{ margin: '10px 0 0 18px', fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.6 }}>
                    {activeRisk.explanation_factors.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Micro-Trend Chart for Selected Mandi */}
              <div style={{ flex: 1, minHeight: 240 }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#f1f5f9', marginBottom: 12 }}>
                  Recent Price & Volume Trend ({selectedCrop?.name || 'Crop'})
                </div>
                <TrendChart data={marketTrends} commodityName={selectedCrop?.name || 'Crop'} />
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: '0.92rem' }}>
              Select a mandi on the map to view real-time trading metrics.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
