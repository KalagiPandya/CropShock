import React, { useState } from 'react';
import { TrendPoint } from '../types';

interface TrendChartProps {
  data: TrendPoint[];
  commodityName: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, commodityName }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No trend data available for selected parameters.</div>;
  }

  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 30, bottom: 40, left: 60 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const maxPrice = Math.max(...data.map(d => d.max_price), 100);
  const minPrice = Math.max(0, Math.min(...data.map(d => d.min_price)) * 0.85);

  const getX = (idx: number) => padding.left + (idx / Math.max(1, data.length - 1)) * plotW;
  const getY = (val: number) => padding.top + plotH - ((val - minPrice) / Math.max(1, maxPrice - minPrice)) * plotH;

  // Build SVG path strings
  const modalPoints = data.map((d, i) => `${getX(i)},${getY(d.modal_price)}`).join(' ');
  const ma7Points = data.map((d, i) => `${getX(i)},${getY(d.ma_7_modal_price || d.modal_price)}`).join(' ');

  // Price spread band polygon (from min_price to max_price)
  const topSpread = data.map((d, i) => `${getX(i)},${getY(d.max_price)}`).join(' L ');
  const bottomSpread = data.slice().reverse().map((d, i) => `${getX(data.length - 1 - i)},${getY(d.min_price)}`).join(' L ');
  const spreadPath = `M ${topSpread} L ${bottomSpread} Z`;

  const hoveredItem = hoveredIdx !== null ? data[hoveredIdx] : data[data.length - 1];

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Chart Legend & Value Callout */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 3, background: '#10b981', borderRadius: 2 }}></span>
            <span style={{ color: '#e2e8f0' }}>Modal Price</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 2, background: '#f59e0b', strokeDasharray: '3 2' }}></span>
            <span style={{ color: '#e2e8f0' }}>7-Day MA Baseline</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 10, background: 'rgba(16, 185, 129, 0.15)', borderRadius: 2 }}></span>
            <span style={{ color: '#94a3b8' }}>Min-Max Price Spread</span>
          </div>
        </div>

        {hoveredItem && (
          <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 700 }}>
            {hoveredItem.date}: <span style={{ color: '#fff' }}>₹{hoveredItem.modal_price.toLocaleString()}</span> / Qtl
            <span style={{ color: '#94a3b8', marginLeft: 8 }}>(Spread: ₹{hoveredItem.price_spread})</span>
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        <defs>
          <linearGradient id="spreadGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const yVal = minPrice + pct * (maxPrice - minPrice);
          const yPos = getY(yVal);
          return (
            <g key={i}>
              <line x1={padding.left} y1={yPos} x2={width - padding.right} y2={yPos} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text x={padding.left - 10} y={yPos + 4} textAnchor="end" fill="#64748b" fontSize="10" fontFamily="var(--font-mono)">
                ₹{Math.round(yVal)}
              </text>
            </g>
          );
        })}

        {/* Price Spread Fill */}
        <path d={spreadPath} fill="url(#spreadGradient)" />

        {/* 7-Day Moving Average Line */}
        <polyline
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeDasharray="4 3"
          points={ma7Points}
        />

        {/* Modal Price Primary Curve */}
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={modalPoints}
          style={{ filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.5))' }}
        />

        {/* Invisible mouse hover listener strips */}
        {data.map((d, i) => {
          const x = getX(i);
          const y = getY(d.modal_price);
          const isHov = hoveredIdx === i;

          return (
            <g key={i}>
              <rect
                x={x - (plotW / data.length) / 2}
                y={padding.top}
                width={plotW / data.length}
                height={plotH}
                fill="transparent"
                onMouseEnter={() => setHoveredIdx(i)}
                style={{ cursor: 'crosshair' }}
              />

              {isHov && (
                <>
                  <line x1={x} y1={padding.top} x2={x} y2={padding.top + plotH} stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx={x} cy={y} r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                </>
              )}
            </g>
          );
        })}

        {/* X-Axis Dates */}
        {data.filter((_, i) => i % Math.ceil(data.length / 7) === 0).map((d, i) => {
          const idx = data.indexOf(d);
          return (
            <text
              key={i}
              x={getX(idx)}
              y={height - 12}
              textAnchor="middle"
              fill="#64748b"
              fontSize="10"
              fontFamily="var(--font-mono)"
            >
              {d.date.slice(5)}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
