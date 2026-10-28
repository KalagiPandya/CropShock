import React, { useState, useEffect } from 'react';
import { Commodity, ProcurementResponse, SavedSchedule } from '../types';
import { simulateProcurement, fetchSavedSchedules, createSavedSchedule, deleteSavedSchedule } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Calculator, Truck, DollarSign, ShieldCheck, 
  MapPin, CheckCircle, ArrowRight, TrendingDown, BookmarkCheck, FileText,
  Trash2, Calendar, Database
} from 'lucide-react';

interface ProcurementPlannerProps {
  commodities: Commodity[];
  selectedCommodityId: number;
}

export const ProcurementPlanner: React.FC<ProcurementPlannerProps> = ({
  commodities,
  selectedCommodityId
}) => {
  const { currentUser, authToken } = useAuth();
  const [commodityId, setCommodityId] = useState<number>(selectedCommodityId);
  const [destination, setDestination] = useState<string>(currentUser?.homeDistrict || 'Ahmedabad');
  const [quantity, setQuantity] = useState<number>(50.0);
  const [transportRate, setTransportRate] = useState<number>(4.5);
  const [result, setResult] = useState<ProcurementResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [savingSchedule, setSavingSchedule] = useState<boolean>(false);
  const [savedRouteNotice, setSavedRouteNotice] = useState<string | null>(null);
  const [savedSchedules, setSavedSchedules] = useState<SavedSchedule[]>([]);

  const runSimulation = () => {
    setLoading(true);
    simulateProcurement({
      commodity_id: commodityId,
      destination_district: destination,
      target_quantity_mt: quantity,
      transport_rate_per_km_mt: transportRate
    })
      .then(res => setResult(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const loadSavedSchedules = () => {
    fetchSavedSchedules(authToken || undefined)
      .then(data => setSavedSchedules(data))
      .catch(err => console.warn('[SCHEDULES] Could not fetch saved schedules:', err));
  };

  useEffect(() => {
    runSimulation();
  }, [commodityId, destination]);

  useEffect(() => {
    loadSavedSchedules();
  }, [authToken]);

  const handleSaveRoute = async () => {
    if (!result || !result.recommendations.length) return;
    const top = result.recommendations[0];
    const comm = commodities.find(c => c.id === commodityId);
    setSavingSchedule(true);

    try {
      const newSchedule = await createSavedSchedule({
        commodity_id: commodityId,
        commodity_name: comm ? `${comm.name} (${comm.local_name_gu || ''})` : result.commodity_name,
        source_mandi_id: top.mandi_id,
        source_mandi_name: top.mandi_name,
        destination_district: result.destination_district,
        quantity_mt: result.target_quantity_mt,
        transport_rate_per_km_mt: transportRate,
        modal_price_per_qtl: top.modal_price_per_quintal,
        landed_cost_per_mt: top.landed_cost_per_mt,
        total_outlay: top.total_procurement_outlay,
        arbitrage_savings: result.maximum_arbitrage_savings
      }, authToken || undefined);

      setSavedRouteNotice(`✓ Sourcing contract #${newSchedule.id} (${top.mandi_name} → ${result.destination_district}) saved to database!`);
      loadSavedSchedules();
      setTimeout(() => setSavedRouteNotice(null), 5000);
    } catch (err: any) {
      console.error('Failed to save route:', err);
      setSavedRouteNotice(`Error saving route to database: ${err.message || 'Check connection'}`);
      setTimeout(() => setSavedRouteNotice(null), 5000);
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    try {
      await deleteSavedSchedule(id, authToken || undefined);
      loadSavedSchedules();
    } catch (err) {
      console.error('Failed to delete schedule:', err);
    }
  };

  // Role-tailored labels & headings
  const isFPO = currentUser?.role === 'FPO_LEADER';
  const isAPMC = currentUser?.role === 'APMC_OFFICIAL';
  const isEng = currentUser?.role === 'DATA_ENGINEER';

  const badgeText = isFPO 
    ? 'FPO COLLECTIVE REALIZATION & DISPATCH OPTIMIZER' 
    : (isAPMC ? 'APMC REGULATORY LANDED PRICE MONITOR' : (isEng ? 'BIG DATA PROCUREMENT SIMULATION SERVICE' : 'B2B LOGISTICS & PROCUREMENT OPTIMIZER'));

  const headerTitle = isFPO
    ? 'Collective Farmer Realization & Outflow Logistics Calculator'
    : (isAPMC ? 'Statewide Mandi Price Dispersion & Statutory Cess Monitor' : (isEng ? 'Haversine Route Simulation & Landed Cost Engine' : 'Procurement Landed Cost & Arbitrage Simulator'));

  const headerDesc = isFPO
    ? 'Calculates net member payout after pooling harvest truckloads from Sabarkantha villages and routing produce to the highest-paying consumption terminals.'
    : (isAPMC 
      ? 'Monitors inter-mandi price spreads, arrival freight premiums, and market fee compliance across Gujarat APMC yards under Gujarat APMC Act 1963.'
      : (isEng
        ? 'Vectorized computation of Haversine road matrix distances and landed pricing models querying indexed SQLite/PostgreSQL tables in <15ms.'
        : 'Evaluates real-time spot auction prices across all Gujarat APMCs and adds estimated freight cartage based on highway road distances to identify the lowest landed procurement cost and optimize supply resilience.'));

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Simulation Configuration Header */}
      <div className="glass-card" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span className={`badge ${currentUser?.badgeClass || 'badge-emerald'}`}>{badgeText}</span>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            {isFPO ? 'For Farmer Producer Collectives' : (isAPMC ? 'Gujarat APMC Regulatory Board' : (isEng ? 'FastAPI Microservice Telemetry' : 'For FPOs, Food Processors & Bulk Aggregators'))}
          </span>
        </div>
        <h2 style={{ fontSize: '1.45rem', color: '#fff', marginBottom: 8 }}>
          {headerTitle}
        </h2>
        <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.7, maxWidth: '860px', marginBottom: 24 }}>
          {headerDesc}
        </p>

        {/* Input Form Controls */}
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Procurement Commodity</label>
            <select
              className="form-input"
              value={commodityId}
              onChange={(e) => setCommodityId(Number(e.target.value))}
            >
              {commodities.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.local_name_gu ? `(${c.local_name_gu})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Destination Processing / Urban Hub</label>
            <select
              className="form-input"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            >
              <option value="Ahmedabad">Ahmedabad (Central Consumption Terminal)</option>
              <option value="Surat">Surat (South Gujarat Processing Hub)</option>
              <option value="Vadodara">Vadodara (Industrial Corridor)</option>
              <option value="Rajkot">Rajkot (Saurashtra Hub)</option>
              <option value="Anand">Anand (Charotar Processing Belt)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Target Procurement Volume (MT)</label>
            <input
              type="number"
              className="form-input"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              min="1"
              step="5"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Freight Cartage Rate (₹/km/MT)</label>
            <input
              type="number"
              className="form-input"
              value={transportRate}
              onChange={(e) => setTransportRate(Math.max(0.5, Number(e.target.value)))}
              min="0.5"
              step="0.5"
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 10 }}>
          <button className="btn btn-primary" onClick={runSimulation} disabled={loading}>
            <Calculator size={17} /> {loading ? 'Computing Arbitrage Routing...' : 'Recalculate Optimal Procurement Routing'}
          </button>
          {result && (
            <button className="btn btn-outline" onClick={handleSaveRoute} disabled={savingSchedule} style={{ gap: 8 }}>
              <BookmarkCheck size={16} style={{ color: '#10b981' }} /> {savingSchedule ? 'Saving to Database...' : 'Save Sourcing Schedule'}
            </button>
          )}
        </div>

        {savedRouteNotice && (
          <div style={{
            marginTop: 14,
            padding: '10px 16px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: 8,
            color: '#34d399',
            fontSize: '0.88rem',
            fontWeight: 500
          }}>
            {savedRouteNotice}
          </div>
        )}
      </div>

      {/* Simulation Result Callouts */}
      {result && (
        <>
          <div className="stats-grid">
            <div className="stat-card" style={{ borderColor: 'rgba(16, 185, 129, 0.4)', padding: '24px' }}>
              <div className="stat-header">
                <span className="stat-label">Optimal Source Mandi</span>
                <div className="stat-icon" style={{ color: '#10b981' }}><CheckCircle size={20} /></div>
              </div>
              <div className="stat-value" style={{ fontSize: '1.4rem', color: '#34d399' }}>
                {result.cheapest_source_mandi}
              </div>
              <div className="stat-sub">Lowest total landed cost per MT</div>
            </div>

            <div className="stat-card" style={{ borderColor: 'rgba(245, 158, 11, 0.4)', padding: '24px' }}>
              <div className="stat-header">
                <span className="stat-label">Max Arbitrage Savings</span>
                <div className="stat-icon" style={{ color: '#f59e0b' }}><TrendingDown size={20} /></div>
              </div>
              <div className="stat-value" style={{ color: '#fbbf24' }}>
                ₹{result.maximum_arbitrage_savings.toLocaleString()}
              </div>
              <div className="stat-sub">Versus highest cost candidate mandi</div>
            </div>

            <div className="stat-card" style={{ padding: '24px' }}>
              <div className="stat-header">
                <span className="stat-label">Target Procurement Volume</span>
                <div className="stat-icon" style={{ color: '#38bdf8' }}><Truck size={20} /></div>
              </div>
              <div className="stat-value">
                {result.target_quantity_mt} <span style={{ fontSize: '1.05rem', fontWeight: 500, color: '#94a3b8' }}>MT</span>
              </div>
              <div className="stat-sub">Destination: {result.destination_district}</div>
            </div>

            <div className="stat-card" style={{ padding: '24px' }}>
              <div className="stat-header">
                <span className="stat-label">Optimal Landed Cost / MT</span>
                <div className="stat-icon" style={{ color: '#a855f7' }}><DollarSign size={20} /></div>
              </div>
              <div className="stat-value" style={{ fontSize: '1.45rem' }}>
                ₹{result.recommendations[0]?.landed_cost_per_mt.toLocaleString()}
              </div>
              <div className="stat-sub">Includes auction price + cartage</div>
            </div>
          </div>

          {/* Detailed Landed Cost Table */}
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>
                Candidate Sourcing Mandi Rankings (Sorted by Total Landed Outlay)
              </span>
              <span className="badge badge-emerald">Ranked Recommendations</span>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Rank / Mandi</th>
                    <th>District</th>
                    <th>Auction Price (₹/Qtl)</th>
                    <th>Distance (km)</th>
                    <th>Freight Cost / MT</th>
                    <th>Landed Cost / MT</th>
                    <th>Total Outlay ({result.target_quantity_mt} MT)</th>
                    <th>Daily Inflow</th>
                    <th>Supply Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {result.recommendations.map((rec, i) => (
                    <tr
                      key={rec.mandi_id}
                      style={{
                        background: i === 0 ? 'rgba(16, 185, 129, 0.08)' : 'transparent'
                      }}
                    >
                      <td>
                        <div style={{ fontWeight: 700, color: i === 0 ? '#34d399' : '#fff', fontSize: '0.94rem' }}>
                          #{i + 1} {rec.mandi_name}
                        </div>
                        {i === 0 && <span className="badge badge-emerald" style={{ fontSize: '0.72rem', padding: '2px 8px', marginTop: 4 }}>Recommended</span>}
                      </td>
                      <td style={{ color: '#cbd5e1' }}>{rec.district} ({rec.zone})</td>
                      <td style={{ fontWeight: 600, color: '#f1f5f9' }}>₹{rec.modal_price_per_quintal.toLocaleString()}</td>
                      <td style={{ color: '#94a3b8' }}>{rec.distance_km} km</td>
                      <td style={{ color: '#94a3b8' }}>₹{rec.transport_cost_per_mt.toLocaleString()}</td>
                      <td style={{ fontWeight: 700, color: i === 0 ? '#34d399' : '#fff' }}>
                        ₹{rec.landed_cost_per_mt.toLocaleString()}
                      </td>
                      <td style={{ fontWeight: 800, color: i === 0 ? '#10b981' : '#f8fafc' }}>
                        ₹{rec.total_procurement_outlay.toLocaleString()}
                      </td>
                      <td style={{ color: '#94a3b8' }}>{rec.available_daily_tonnage} MT</td>
                      <td>
                        <span className={`badge ${
                          rec.risk_level === 'HIGH' ? 'badge-crimson' :
                          rec.risk_level === 'MODERATE' ? 'badge-amber' : 'badge-emerald'
                        }`} style={{ padding: '3px 10px', fontSize: '0.76rem' }}>
                          {rec.risk_level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Saved Sourcing Contracts & Committed Schedules (Database Persisted) */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '22px 28px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Database size={19} style={{ color: '#10b981' }} />
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>
                Committed Sourcing Schedules & Contracts
              </span>
              <span className="badge badge-emerald">Persisted in SQLite/Lakehouse</span>
            </div>
            <p style={{ fontSize: '0.86rem', color: '#94a3b8', marginTop: 4, marginBottom: 0 }}>
              Permanent database records for {currentUser?.name || 'Authorized Stakeholder'} ({currentUser?.organization || 'Commercial Sourcing'})
            </p>
          </div>
          <span style={{ fontSize: '0.84rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: 8 }}>
            Total Active Contracts: <strong>{savedSchedules.length}</strong>
          </span>
        </div>

        {savedSchedules.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#94a3b8' }}>
            <FileText size={36} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
            <p style={{ fontSize: '0.95rem', fontWeight: 500, color: '#cbd5e1' }}>No saved procurement schedules yet</p>
            <p style={{ fontSize: '0.84rem', maxWidth: 450, margin: '4px auto 0 auto', color: '#64748b' }}>
              Run the procurement simulation above and click "Save Sourcing Schedule" to persist an active supply contract to the database.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Schedule ID</th>
                  <th>Commodity</th>
                  <th>Routing (Source → Destination)</th>
                  <th>Quantity</th>
                  <th>Modal Price (₹/Qtl)</th>
                  <th>Landed Cost / MT</th>
                  <th>Total Outlay</th>
                  <th>Arbitrage Savings</th>
                  <th>Date Saved</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {savedSchedules.map(sch => (
                  <tr key={sch.id}>
                    <td>
                      <span className="badge badge-emerald" style={{ fontSize: '0.74rem' }}>
                        SCH-{sch.id.toString().padStart(4, '0')}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>
                      {sch.commodity_name}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#cbd5e1', fontSize: '0.88rem' }}>
                        <span>{sch.source_mandi_name}</span>
                        <ArrowRight size={13} style={{ color: '#10b981' }} />
                        <span style={{ color: '#38bdf8' }}>{sch.destination_district}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: '#f1f5f9' }}>
                      {sch.quantity_mt} MT
                    </td>
                    <td style={{ color: '#94a3b8' }}>
                      ₹{sch.modal_price_per_qtl.toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 600, color: '#34d399' }}>
                      ₹{sch.landed_cost_per_mt.toLocaleString()}
                    </td>
                    <td style={{ fontWeight: 700, color: '#fff' }}>
                      ₹{sch.total_outlay.toLocaleString()}
                    </td>
                    <td style={{ color: '#fbbf24', fontWeight: 600 }}>
                      +₹{sch.arbitrage_savings.toLocaleString()}
                    </td>
                    <td style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                      {sch.created_at ? new Date(sch.created_at).toLocaleDateString() : 'Active'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteSchedule(sch.id)}
                        className="btn btn-outline"
                        style={{
                          padding: '6px 10px',
                          color: '#f87171',
                          borderColor: 'rgba(239, 68, 68, 0.3)',
                          background: 'rgba(239, 68, 68, 0.08)',
                          cursor: 'pointer'
                        }}
                        title="Delete saved schedule"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
