import React, { useState } from 'react';
import { Market, SupplyRiskItem } from '../types';
import { MapPin, AlertTriangle, TrendingUp, Navigation } from 'lucide-react';

interface GujaratMapProps {
  markets: Market[];
  risks?: SupplyRiskItem[];
  selectedMarketId?: number;
  onSelectMarket?: (market: Market) => void;
}

export const GujaratMap: React.FC<GujaratMapProps> = ({
  markets,
  risks = [],
  selectedMarketId,
  onSelectMarket
}) => {
  const [hoveredMarket, setHoveredMarket] = useState<Market | null>(null);

  // Map coordinate projection for Gujarat:
  // Longitude range: 68.1 to 74.5 (width: 800)
  // Latitude range: 20.1 to 24.6 (height: 520)
  const project = (lat: number, lon: number) => {
    const minLon = 68.2;
    const maxLon = 74.4;
    const minLat = 20.2;
    const maxLat = 24.5;

    const x = ((lon - minLon) / (maxLon - minLon)) * 740 + 30;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 460 + 30;
    return { x: Math.round(x), y: Math.round(y) };
  };

  const riskMap = new Map<number, SupplyRiskItem>();
  risks.forEach(r => riskMap.set(r.market_id, r));

  return (
    <div className="map-container" style={{ position: 'relative', width: '100%', height: '520px' }}>
      <svg
        viewBox="0 0 800 520"
        style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}
      >
        <defs>
          {/* Subtle Gujarat boundary background */}
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#070b14" stopOpacity="0" />
          </radialGradient>
          <filter id="glowPin" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <rect width="800" height="520" fill="url(#mapGlow)" rx="12" />

        {/* Stylized Gujarat Geographical Outlines */}
        {/* Kutch Zone */}
        <path
          d="M 60 120 Q 140 100 240 130 Q 220 180 160 200 Q 80 190 60 120 Z"
          fill="rgba(30, 41, 59, 0.45)"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1.5"
          strokeDasharray="4 2"
        />
        <text x="130" y="150" fill="#64748b" fontSize="12" fontWeight="700" letterSpacing="0.1em">KUTCH</text>

        {/* Saurashtra Peninsula */}
        <path
          d="M 120 230 Q 240 210 320 270 Q 360 380 280 430 Q 160 440 100 360 Q 90 280 120 230 Z"
          fill="rgba(16, 185, 129, 0.05)"
          stroke="rgba(16, 185, 129, 0.25)"
          strokeWidth="1.5"
        />
        <text x="180" y="340" fill="#34d399" opacity="0.6" fontSize="14" fontWeight="800" letterSpacing="0.15em">SAURASHTRA</text>

        {/* North Gujarat */}
        <path
          d="M 280 80 Q 450 60 520 140 Q 460 210 350 210 Q 300 150 280 80 Z"
          fill="rgba(6, 182, 212, 0.04)"
          stroke="rgba(6, 182, 212, 0.2)"
          strokeWidth="1.5"
        />
        <text x="370" y="125" fill="#22d3ee" opacity="0.6" fontSize="13" fontWeight="800" letterSpacing="0.12em">NORTH GUJARAT</text>

        {/* Central Gujarat & Charotar */}
        <path
          d="M 360 210 Q 480 200 580 240 Q 550 320 440 330 Q 370 290 360 210 Z"
          fill="rgba(99, 102, 241, 0.05)"
          stroke="rgba(99, 102, 241, 0.25)"
          strokeWidth="1.5"
        />
        <text x="430" y="260" fill="#818cf8" opacity="0.6" fontSize="13" fontWeight="800" letterSpacing="0.12em">CENTRAL (CHAROTAR)</text>

        {/* South Gujarat */}
        <path
          d="M 430 330 Q 540 340 560 480 Q 460 500 420 420 Q 410 360 430 330 Z"
          fill="rgba(245, 158, 11, 0.04)"
          stroke="rgba(245, 158, 11, 0.2)"
          strokeWidth="1.5"
        />
        <text x="470" y="420" fill="#fbbf24" opacity="0.6" fontSize="13" fontWeight="800" letterSpacing="0.12em">SOUTH GUJARAT</text>

        {/* Connective Trading Corridors */}
        <line x1="240" y1="280" x2="420" y2="245" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="420" y1="245" x2="470" y2="390" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="390" y1="110" x2="420" y2="245" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />

        {/* Plot All 40 APMC Mandi Pins Across All 33 Districts */}
        {markets.map(m => {
          const { x, y } = project(m.latitude, m.longitude);
          const risk = riskMap.get(m.id);
          const isSelected = selectedMarketId === m.id;
          const isHovered = hoveredMarket?.id === m.id;

          let pinColor = '#10b981'; // Green: Low Risk
          if (risk?.risk_level === 'HIGH') pinColor = '#ef4444';
          else if (risk?.risk_level === 'MODERATE') pinColor = '#f59e0b';

          const radius = m.market_tier === 'TIER_1_MAJOR' ? 8 : (m.market_tier === 'TIER_2_REGIONAL' ? 6 : 4.5);

          return (
            <g
              key={m.id}
              className="mandi-pin"
              onClick={() => onSelectMarket?.(m)}
              onMouseEnter={() => setHoveredMarket(m)}
              onMouseLeave={() => setHoveredMarket(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Pulse ripple for high risk mandis */}
              {risk?.risk_level === 'HIGH' && (
                <circle cx={x} cy={y} r={radius * 2.2} fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.7">
                  <animate attributeName="r" from={radius} to={radius * 3} dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.8" to="0" dur="1.8s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Pin Outer Glow */}
              <circle
                cx={x}
                cy={y}
                r={isSelected || isHovered ? radius + 5 : radius + 2}
                fill={pinColor}
                opacity={isSelected || isHovered ? 0.35 : 0.15}
                filter="url(#glowPin)"
              />

              {/* Pin Center Core */}
              <circle
                cx={x}
                cy={y}
                r={isSelected ? radius + 2 : radius}
                fill={pinColor}
                stroke={isSelected ? '#ffffff' : 'rgba(0,0,0,0.5)'}
                strokeWidth={isSelected ? 2 : 1}
              />

              {/* Mandi Name Label for Tier 1 Major Hubs */}
              {(m.market_tier === 'TIER_1_MAJOR' || isHovered || isSelected) && (
                <text
                  x={x}
                  y={y - radius - 6}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={isSelected ? '11' : '9.5'}
                  fontWeight="700"
                  style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.8)',
                    pointerEvents: 'none'
                  }}
                >
                  {m.name.replace(' APMC', '')}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Floating Hover Card */}
      {hoveredMarket && (
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 20,
            background: 'rgba(11, 19, 38, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '16px 20px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
            pointerEvents: 'none',
            minWidth: '280px',
            zIndex: 10
          }}
          className="fade-in"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{hoveredMarket.name}</span>
            <span className={`badge ${
              riskMap.get(hoveredMarket.id)?.risk_level === 'HIGH' ? 'badge-crimson' :
              riskMap.get(hoveredMarket.id)?.risk_level === 'MODERATE' ? 'badge-amber' : 'badge-emerald'
            }`}>
              {riskMap.get(hoveredMarket.id)?.risk_level || 'LOW'} RISK
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div><strong style={{ color: '#e2e8f0' }}>District:</strong> {hoveredMarket.district} ({hoveredMarket.zone})</div>
            <div><strong style={{ color: '#e2e8f0' }}>Catchment:</strong> ~{hoveredMarket.catchment_villages_approx} rural villages</div>
            <div><strong style={{ color: '#e2e8f0' }}>GPS Coordinates:</strong> {hoveredMarket.latitude}° N, {hoveredMarket.longitude}° E</div>
            {riskMap.get(hoveredMarket.id) && (
              <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ color: '#34d399', fontWeight: 600 }}>Supply Risk Score: {riskMap.get(hoveredMarket.id)?.risk_score} / 100</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div style={{
        position: 'absolute',
        top: 16,
        right: 16,
        background: 'rgba(10, 16, 30, 0.85)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        fontSize: '0.75rem'
      }}>
        <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: '2px' }}>GUJARAT APMC RISK TIER</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }}></span>
          <span style={{ color: '#94a3b8' }}>Low Risk (Normal Trading)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }}></span>
          <span style={{ color: '#94a3b8' }}>Moderate Contraction</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px #ef4444' }}></span>
          <span style={{ color: '#94a3b8' }}>Critical Supply Shock</span>
        </div>
      </div>
    </div>
  );
};
