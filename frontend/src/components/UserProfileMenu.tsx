import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DEMO_PROFILES, UserRole } from '../types/auth';
import { 
  User, LogIn, LogOut, ChevronDown, Building2, 
  Sprout, Landmark, Database, Shield, Check, RefreshCw 
} from 'lucide-react';

export const UserProfileMenu: React.FC = () => {
  const { currentUser, isAuthenticated, logout, openLoginModal, loginAsRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated || !currentUser) {
    return (
      <button 
        className="btn btn-primary" 
        style={{ padding: '8px 16px', fontSize: '0.88rem' }}
        onClick={openLoginModal}
      >
        <LogIn size={16} /> Sign In / Choose Role
      </button>
    );
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'PROCUREMENT_MANAGER': return <Building2 size={15} />;
      case 'FPO_LEADER': return <Sprout size={15} />;
      case 'APMC_OFFICIAL': return <Landmark size={15} />;
      case 'DATA_ENGINEER': return <Database size={15} />;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      {/* Trigger Button Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 30,
          padding: '5px 14px 5px 6px',
          cursor: 'pointer',
          color: '#fff',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
        }}
      >
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--emerald-500), #047857)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '0.82rem',
          color: '#fff',
          boxShadow: '0 0 10px var(--emerald-glow)'
        }}>
          {currentUser.initials}
        </div>

        <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
          <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{currentUser.name}</div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{currentUser.roleLabel}</div>
        </div>

        <ChevronDown size={14} style={{ color: '#94a3b8', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="fade-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '320px',
            background: 'rgba(11, 19, 38, 0.98)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 16,
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(16, 185, 129, 0.1)',
            padding: 16,
            zIndex: 200
          }}
        >
          {/* User Header */}
          <div style={{ paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#fff' }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 2 }}>
              {currentUser.email}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#34d399', marginTop: 4, fontWeight: 500 }}>
              {currentUser.organization}
            </div>
            <div style={{ marginTop: 8 }}>
              <span className={`badge ${currentUser.badgeClass}`} style={{ fontSize: '0.74rem', padding: '3px 8px' }}>
                {currentUser.roleLabel}
              </span>
            </div>
          </div>

          {/* Quick Role Switcher */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: '0.76rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 8 }}>
              Switch Stakeholder Persona
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(Object.keys(DEMO_PROFILES) as UserRole[]).map(r => {
                const p = DEMO_PROFILES[r];
                const isActive = currentUser.role === r;

                return (
                  <button
                    key={r}
                    onClick={() => {
                      loginAsRole(r);
                      setIsOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid transparent',
                      background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                      color: isActive ? '#34d399' : '#cbd5e1',
                      cursor: 'pointer',
                      fontSize: '0.84rem',
                      textAlign: 'left',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {getRoleIcon(r)}
                      <span>{p.roleLabel}</span>
                    </span>
                    {isActive && <Check size={14} style={{ color: '#34d399' }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sign Out Button */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 12px',
                borderRadius: 8,
                border: 'none',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              }}
            >
              <LogOut size={15} /> Sign Out (Switch to Guest Mode)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
