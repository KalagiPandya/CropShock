import React, { useState, useEffect } from 'react';
import { Commodity, Market, TrendPoint, WeatherCorrelationPoint, SupplyRiskItem } from '../types';
import { TrendChart } from '../components/TrendChart';
import { WeatherChart } from '../components/WeatherChart';
import { fetchTrends, fetchWeatherCorrelation, fetchSupplyRisks } from '../api';
import { 
  Sparkles, ShieldCheck, Thermometer, CloudRain, 
  TrendingUp, Clock, AlertTriangle, Layers 
} from 'lucide-react';

interface VegetableIntelligenceProps {
  commodities: Commodity[];
  markets: Market[];
  selectedCommodityId: number;
  onSelectCommodity: (id: number) => void;
}

export const VegetableIntelligence: React.FC<VegetableIntelligenceProps> = ({
  commodities,
  markets,
  selectedCommodityId,
  onSelectCommodity
}) => {
  const [selectedMarketId, setSelectedMarketId] = useState<number>(1);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherCorrelationPoint[]>([]);
  const [risks, setRisks] = useState<SupplyRiskItem[]>([]);

  const selectedCrop = commodities.find(c => c.id === selectedCommodityId) || commodities[0];
  const selectedMandi = markets.find(m => m.id === selectedMarketId) || markets[0];

  useEffect(() => {
    fetchTrends(selectedCommodityId, selectedMarketId).then(setTrends).catch(console.error);
    fetchWeatherCorrelation(selectedMarketId, 30).then(setWeatherData).catch(console.error);
    fetchSupplyRisks(selectedCommodityId).then(setRisks).catch(console.error);
  }, [selectedCommodityId, selectedMarketId]);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Top Commodity Selector Bar */}
      <div className="glass-card" style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, var(--emerald-500), #047857)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.15rem',
            letterSpacing: '0.02em',
            boxShadow: '0 0 16px var(--emerald-glow)'
          }}>
            {selectedCrop?.code}
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.01em', marginBottom: 4 }}>
              {selectedCrop?.name} <span style={{ color: '#10b981', fontSize: '1.15rem', fontWeight: 600 }}>({selectedCrop?.local_name_gu})</span>
            </div>
            <div style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
              Botanical Group: <strong style={{ color: '#f1f5f9' }}>{selectedCrop?.botanical_group}</strong> • Perishability: <strong style={{ color: '#fbbf24' }}>{selectedCrop?.perishability_tier}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <select
            className="select-control"
            value={selectedCommodityId}
            onChange={(e) => onSelectCommodity(Number(e.target.value))}
          >
            {commodities.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.local_name_gu})
              </option>
            ))}
          </select>

          <select
            className="select-control"
            value={selectedMarketId}
            onChange={(e) => setSelectedMarketId(Number(e.target.value))}
          >
            {markets.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.district})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Commodity Botanical & Supply Context Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Ambient Shelf Life</span>
            <div className="stat-icon" style={{ color: '#38bdf8' }}><Clock size={20} /></div>
          </div>
          <div className="stat-value">{selectedCrop?.ambient_shelf_life_days} <span style={{ fontSize: '1.05rem', fontWeight: 500, color: '#94a3b8' }}>Days</span></div>
          <div className="stat-sub">Without cold-chain preservation</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Baseline Price Band</span>
            <div className="stat-icon" style={{ color: '#10b981' }}><TrendingUp size={20} /></div>
          </div>
          <div className="stat-value" style={{ fontSize: '1.45rem' }}>
            ₹{selectedCrop?.baseline_min_price} – ₹{selectedCrop?.baseline_max_price}
          </div>
          <div className="stat-sub">Standard ₹/Quintal trading corridor</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Active APMC Outlets</span>
            <div className="stat-icon" style={{ color: '#f59e0b' }}><Layers size={20} /></div>
          </div>
          <div className="stat-value">{markets.length} Mandis</div>
          <div className="stat-sub">Traded across all 33 Gujarat districts</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Monitored Risk State</span>
            <div className="stat-icon" style={{ color: '#ef4444' }}><AlertTriangle size={20} /></div>
          </div>
          <div className="stat-value" style={{ fontSize: '1.45rem', color: '#34d399' }}>
            {risks.filter(r => r.risk_level === 'HIGH').length} High Alerts
          </div>
          <div className="stat-sub">Statewide critical shortage triggers</div>
        </div>
      </div>

      {/* Primary Historical Price Curve with Spread */}
      <div className="glass-card" style={{ padding: '28px 32px' }}>
        <div className="card-header">
          <div className="card-title">
            <TrendingUp size={20} style={{ color: '#10b981' }} />
            Price Volatility Band & Rolling 7-Day Baseline — {selectedCrop?.name} at {selectedMandi?.name}
          </div>
          <span className="badge badge-emerald">Daily Observations</span>
        </div>

        <TrendChart data={trends} commodityName={selectedCrop?.name || 'Crop'} />
      </div>

      {/* Micro-Climate Weather Overlay */}
      <div className="glass-card" style={{ padding: '28px 32px' }}>
        <div className="card-header">
          <div className="card-title">
            <CloudRain size={20} style={{ color: '#38bdf8' }} />
            Micro-Climate Correlation: Daily Arrivals vs Rainfall Accumulation & Temperature Extremes
          </div>
          <span className="badge badge-emerald">Open-Meteo Verified</span>
        </div>

        <WeatherChart data={weatherData} marketName={selectedMandi?.name || 'Mandi'} />
      </div>

      {/* Mandi-Level Risk Ranking for Selected Commodity */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>
            Statewide Supply Risk Assessment for {selectedCrop?.name} Across Gujarat Mandis
          </span>
          <span className="badge badge-emerald">Explainable Scoring Rule</span>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>APMC Mandi Yard</th>
                <th>District / Zone</th>
                <th>Supply Risk Score</th>
                <th>Risk Tier</th>
                <th>Arrival Shock (Δ%)</th>
                <th>Price Surge (Δ%)</th>
                <th>Key Diagnostic Factors</th>
              </tr>
            </thead>
            <tbody>
              {risks.slice(0, 10).map(r => (
                <tr key={r.market_id}>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{r.market_name}</td>
                  <td style={{ color: '#94a3b8' }}>{r.district} ({r.zone})</td>
                  <td style={{ fontWeight: 700, color: r.risk_score >= 70 ? '#ef4444' : (r.risk_score >= 35 ? '#f59e0b' : '#10b981') }}>
                    {r.risk_score} / 100
                  </td>
                  <td>
                    <span className={`badge ${
                      r.risk_level === 'HIGH' ? 'badge-crimson' :
                      r.risk_level === 'MODERATE' ? 'badge-amber' : 'badge-emerald'
                    }`}>
                      {r.risk_level}
                    </span>
                  </td>
                  <td style={{ color: r.arrival_drop_pct < 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                    {r.arrival_drop_pct > 0 ? `+${r.arrival_drop_pct}%` : `${r.arrival_drop_pct}%`}
                  </td>
                  <td style={{ color: r.price_surge_pct > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                    {r.price_surge_pct > 0 ? `+${r.price_surge_pct}%` : `${r.price_surge_pct}%`}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                    {r.explanation_factors.join('; ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
