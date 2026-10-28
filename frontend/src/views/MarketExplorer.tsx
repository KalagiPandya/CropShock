import React, { useState } from 'react';
import { Market } from '../types';
import { Search, MapPin, Building, Globe, Filter } from 'lucide-react';

interface MarketExplorerProps {
  markets: Market[];
  onSelectMarket: (market: Market) => void;
}

export const MarketExplorer: React.FC<MarketExplorerProps> = ({ markets, onSelectMarket }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [selectedTier, setSelectedTier] = useState('ALL');

  const filtered = markets.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.taluka.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesZone = selectedZone === 'ALL' || m.zone.toLowerCase() === selectedZone.toLowerCase();
    const matchesTier = selectedTier === 'ALL' || m.market_tier === selectedTier;

    return matchesSearch && matchesZone && matchesTier;
  });

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Search & Filter Header */}
      <div className="glass-card" style={{ padding: '24px 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 18 }}>
          <div style={{ position: 'relative', minWidth: '340px', flex: 1 }}>
            <Search size={19} style={{ position: 'absolute', left: 16, top: 14, color: '#64748b' }} />
            <input
              type="text"
              className="form-input"
              style={{ width: '100%', paddingLeft: 46, paddingTop: 12, paddingBottom: 12, fontSize: '0.94rem' }}
              placeholder="Search by APMC yard name, district, or taluka (e.g., Gondal, Deesa, Mahuva)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Filter size={18} style={{ color: '#10b981' }} />
              <select className="select-control" value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)}>
                <option value="ALL">All Zones (Gujarat)</option>
                <option value="Saurashtra">Saurashtra</option>
                <option value="Central Gujarat">Central Gujarat</option>
                <option value="North Gujarat">North Gujarat</option>
                <option value="South Gujarat">South Gujarat</option>
                <option value="Kutch">Kutch</option>
              </select>
            </div>

            <select className="select-control" value={selectedTier} onChange={(e) => setSelectedTier(e.target.value)}>
              <option value="ALL">All Market Tiers</option>
              <option value="TIER_1_MAJOR">Tier 1 Major Hubs</option>
              <option value="TIER_2_REGIONAL">Tier 2 Regional Yards</option>
              <option value="TIER_3_FEEDER">Tier 3 Feeder Yards</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>
            Registered Gujarat APMC Market Catalog ({filtered.length} of {markets.length} yards)
          </span>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Regulated under Gujarat Agricultural Produce Markets Act, 1963
          </span>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>APMC Mandi Yard</th>
                <th>District</th>
                <th>Taluka</th>
                <th>Agro-Climatic Zone</th>
                <th>Tier</th>
                <th>Catchment Base</th>
                <th>GPS Location</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{m.name}</div>
                    <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 2 }}>Code: {m.code}</div>
                  </td>
                  <td style={{ color: '#f1f5f9', fontWeight: 500 }}>{m.district}</td>
                  <td style={{ color: '#94a3b8' }}>{m.taluka}</td>
                  <td>
                    <span className={`badge ${
                      m.zone === 'Saurashtra' ? 'badge-emerald' :
                      m.zone === 'Central Gujarat' ? 'badge-indigo' :
                      m.zone === 'North Gujarat' ? 'badge-teal' : 'badge-amber'
                    }`}>
                      {m.zone}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: m.market_tier === 'TIER_1_MAJOR' ? '#34d399' : '#94a3b8'
                    }}>
                      {m.market_tier.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ color: '#cbd5e1' }}>~{m.catchment_villages_approx} villages</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#94a3b8' }}>
                    {m.latitude.toFixed(3)}°N, {m.longitude.toFixed(3)}°E
                  </td>
                  <td>
                    <button
                      className="btn btn-outline"
                      style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                      onClick={() => onSelectMarket(m)}
                    >
                      Inspect Yard
                    </button>
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
