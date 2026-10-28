import React, { useState } from 'react';
import { WeatherCorrelationPoint } from '../types';

interface WeatherChartProps {
  data: WeatherCorrelationPoint[];
  marketName: string;
}

export const WeatherChart: React.FC<WeatherChartProps> = ({ data, marketName }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>No weather correlation observations logged.</div>;
  }

  const width = 800;
  const height = 280;
  const padding = { top: 20, right: 60, bottom: 40, left: 60 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const maxArrival = Math.max(...data.map(d => d.arrival_quantity), 50);
  const maxRain = Math.max(...data.map(d => d.recent_rainfall_3d_mm), 30);
  const maxTemp = Math.max(...data.map(d => d.temperature_max), 40);

  const getX = (idx: number) => padding.left + (idx / Math.max(1, data.length - 1)) * plotW;
  const getYArrival = (val: number) => padding.top + plotH - (val / maxArrival) * plotH;
  const getYWeather = (val: number, maxVal: number) => padding.top + plotH - (val / maxVal) * plotH;

  const rainPoints = data.map((d, i) => `${getX(i)},${getYWeather(d.recent_rainfall_3d_mm, maxRain)}`).join(' ');
  const tempPoints = data.map((d, i) => `${getX(i)},${getYWeather(d.temperature_max, maxTemp)}`).join(' ');

  const hoveredItem = hoveredIdx !== null ? data[hoveredIdx] : data[data.length - 1];

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, background: 'rgba(16, 185, 129, 0.4)', borderRadius: 2 }}></span>
            <span style={{ color: '#e2e8f0' }}>Arrival Volume (MT)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 3, background: '#38bdf8', borderRadius: 2 }}></span>
            <span style={{ color: '#e2e8f0' }}>3-Day Rainfall (mm)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 2, background: '#f59e0b', strokeDasharray: '3 2' }}></span>
            <span style={{ color: '#e2e8f0' }}>Max Temp (°C)</span>
          </div>
        </div>

        {hoveredItem && (
          <div style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 600 }}>
            {hoveredItem.date}: <span style={{ color: '#10b981' }}>{hoveredItem.arrival_quantity} MT</span> | 
            <span style={{ color: '#38bdf8', marginLeft: 6 }}>Rain: {hoveredItem.recent_rainfall_3d_mm} mm</span> | 
            <span style={{ color: '#f59e0b', marginLeft: 6 }}>Temp: {hoveredItem.temperature_max}°C</span>
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {/* Background Grid */}
        {[0, 0.5, 1].map((pct, i) => {
          const yPos = padding.top + pct * plotH;
          const arrivalVal = Math.round((1 - pct) * maxArrival);
          const rainVal = Math.round((1 - pct) * maxRain);
          return (
            <g key={i}>
              <line x1={padding.left} y1={yPos} x2={width - padding.right} y2={yPos} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              {/* Left Axis: Arrivals */}
              <text x={padding.left - 10} y={yPos + 4} textAnchor="end" fill="#10b981" fontSize="10" fontFamily="var(--font-mono)">
                {arrivalVal} MT
              </text>
              {/* Right Axis: Rainfall */}
              <text x={width - padding.right + 10} y={yPos + 4} textAnchor="start" fill="#38bdf8" fontSize="10" fontFamily="var(--font-mono)">
                {rainVal} mm
              </text>
            </g>
          );
        })}

        {/* Arrival Volume Bars */}
        {data.map((d, i) => {
          const x = getX(i);
          const barW = Math.max(3, (plotW / data.length) * 0.5);
          const barH = (d.arrival_quantity / maxArrival) * plotH;
          const y = padding.top + plotH - barH;
          const isHov = hoveredIdx === i;

          return (
            <rect
              key={i}
              x={x - barW / 2}
              y={y}
              width={barW}
              height={barH}
              fill={isHov ? '#34d399' : 'rgba(16, 185, 129, 0.35)'}
              rx="2"
            />
          );
        })}

        {/* Rainfall Line (Cyan) */}
        <polyline
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
          points={rainPoints}
          style={{ filter: 'drop-shadow(0 0 5px rgba(56, 189, 248, 0.6))' }}
        />

        {/* Temperature Line (Amber) */}
        <polyline
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeDasharray="4 3"
          points={tempPoints}
        />

        {/* Hover detection */}
        {data.map((_, i) => (
          <rect
            key={i}
            x={getX(i) - (plotW / data.length) / 2}
            y={padding.top}
            width={plotW / data.length}
            height={plotH}
            fill="transparent"
            onMouseEnter={() => setHoveredIdx(i)}
            style={{ cursor: 'crosshair' }}
          />
        ))}

        {/* X Axis Dates */}
        {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((d, i) => {
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
