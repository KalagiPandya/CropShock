import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DEMO_PROFILES, UserRole } from '../types/auth';
import { 
  X, Lock, Mail, Building2, Sprout, Landmark, 
  Database, ShieldCheck, ArrowRight, CheckCircle2, User 
} from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login, loginAsRole, currentUser } = useAuth();
  const [tab, setTab] = useState<'personas' | 'form'>('personas');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide a valid email address.');
      return;
    }
    setError('');
    login(email, password || 'demo123');
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'PROCUREMENT_MANAGER': return <Building2 size={20} style={{ color: '#10b981' }} />;
      case 'FPO_LEADER': return <Sprout size={20} style={{ color: '#fbbf24' }} />;
      case 'APMC_OFFICIAL': return <Landmark size={20} style={{ color: '#818cf8' }} />;
      case 'DATA_ENGINEER': return <Database size={20} style={{ color: '#38bdf8' }} />;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(3, 7, 18, 0.82)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20
    }} onClick={closeLoginModal}>
      <div 
        className="glass-card fade-in" 
        style={{
          width: '100%',
          maxWidth: '680px',
          padding: '36px 40px',
          borderRadius: 20,
          background: 'rgba(11, 19, 38, 0.96)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(16, 185, 129, 0.15)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          style={{
            position: 'absolute',
            top: 24,
            right: 24,
            background: 'rgba(255, 255, 255, 0.06)',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'linear-gradient(135deg, var(--emerald-500), #047857)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 16px var(--emerald-glow)'
          }}>
            <Lock size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.45rem', color: '#fff', marginBottom: 2 }}>
              CropShock Access & Identity Portal
            </h2>
            <div style={{ fontSize: '0.86rem', color: '#94a3b8' }}>
              Select a stakeholder persona to experience tailored workflows
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 10,
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: 14,
          margin: '22px 0 24px 0'
        }}>
          <button
            className={`btn ${tab === 'personas' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '8px 18px', fontSize: '0.88rem' }}
            onClick={() => setTab('personas')}
          >
            Instant Demo Personas
          </button>
          <button
            className={`btn ${tab === 'form' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '8px 18px', fontSize: '0.88rem' }}
            onClick={() => setTab('form')}
          >
            Email & Password Sign In
          </button>
        </div>

        {/* Tab 1: Instant Demo Personas */}
        {tab === 'personas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {(Object.keys(DEMO_PROFILES) as UserRole[]).map(roleKey => {
              const p = DEMO_PROFILES[roleKey];
              const isCurrent = currentUser?.role === roleKey;

              return (
                <div
                  key={roleKey}
                  onClick={() => loginAsRole(roleKey)}
                  style={{
                    background: isCurrent ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: isCurrent ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid var(--border-subtle)',
                    borderRadius: 14,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isCurrent ? 'rgba(16, 185, 129, 0.5)' : 'var(--border-subtle)';
                    e.currentTarget.style.background = isCurrent ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {getRoleIcon(roleKey)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
                        <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                          {p.name}
                        </span>
                        <span className={`badge ${p.badgeClass}`} style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                          {p.roleLabel}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#94a3b8', marginBottom: 2 }}>
                        {p.organization}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {p.description}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 600, fontSize: '0.85rem', flexShrink: 0 }}>
                    {isCurrent ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#34d399' }}>
                        <CheckCircle2 size={18} /> Active
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        Sign In <ArrowRight size={15} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Standard Form Sign In */}
        {tab === 'form' && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={15} /> Corporate / Institutional Email
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="name@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lock size={15} /> Access Password
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div style={{ color: '#f87171', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '12px', fontSize: '0.95rem', marginTop: 6 }}>
              Sign In to Agricultural Intelligence Portal
            </button>

            <div style={{ fontSize: '0.82rem', color: '#64748b', textAlign: 'center', marginTop: 4 }}>
              Tip: You can use any demo email or switch to the <strong>Instant Demo Personas</strong> tab for one-click access.
            </div>
          </form>
        )}

        {/* Footer info */}
        <div style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: '#64748b'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={14} style={{ color: '#10b981' }} />
            Role-Based Access Control (RBAC) Enabled
          </span>
          <span>Gujarat Agri-Intelligence Platform</span>
        </div>
      </div>
    </div>
  );
};
