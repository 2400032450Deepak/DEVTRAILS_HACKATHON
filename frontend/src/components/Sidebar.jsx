import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Activity, ShieldAlert, History, Radar, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/live', label: 'Live Monitor', icon: Activity },
  { path: '/dashboard/coverage', label: 'My Coverage', icon: ShieldAlert },
  { path: '/dashboard/history', label: 'Payout History', icon: History },
  { path: '/dashboard/risk', label: 'Risk Profile', icon: Radar },
];

export default function Sidebar() {
  const { logout, user } = useAuth();

  // Get user initials safely - handle both string and number IDs
  const getInitials = () => {
    if (!user?.id) return 'RK';
    const userIdStr = String(user.id);
    return userIdStr.slice(0, 2).toUpperCase();
  };

  return (
    <aside style={{
      width: '280px',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-light)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      height: '100vh',
      left: 0,
      top: 0,
      zIndex: 40,
    }}>
      {/* Logo */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Shield size={20} color="white" />
        </div>
        <div>
          <h2 style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>DeliverShield</h2>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>AI Parametric Insurance</p>
        </div>
      </div>

      {/* User Info */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid var(--border-light)',
        background: 'var(--bg-primary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1.25rem',
            color: 'white',
          }}>
            {getInitials()}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>Rider {user?.id || 'WKR-8942'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Active Protection</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '1rem 0' }}>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => isActive ? 'active' : ''}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1.5rem',
                margin: '0.25rem 0.75rem',
                borderRadius: '0.5rem',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-glow)' : 'transparent',
                transition: 'all 0.3s ease',
                textDecoration: 'none',
              })}
            >
              <Icon size={18} />
              <span style={{ fontWeight: 500 }}>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '1.5rem',
        borderTop: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <ThemeToggle />
        
        <button
          onClick={logout}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'var(--danger-glow)',
            border: '1px solid var(--danger)',
            borderRadius: '0.5rem',
            color: 'var(--danger)',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.3s ease',
          }}
        >
          Sign Out
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          justifyContent: 'center',
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            background: 'var(--success)',
            borderRadius: '50%',
            display: 'inline-block',
          }}></span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>System Online</span>
        </div>
      </div>
    </aside>
  );
}