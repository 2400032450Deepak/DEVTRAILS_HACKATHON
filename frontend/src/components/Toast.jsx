import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={18} className="text-green" />,
    error: <AlertCircle size={18} className="text-red" />,
    info: <Info size={18} className="text-amber" />,
  };

  const backgrounds = {
    success: 'rgba(16, 185, 129, 0.1)',
    error: 'rgba(239, 68, 68, 0.1)',
    info: 'rgba(245, 158, 11, 0.1)',
  };

  const toastStyle = {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    zIndex: 1000,
    animation: 'slideIn 0.3s ease-out',
  };

  const contentStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    boxShadow: 'var(--shadow-lg)',
  };

  const buttonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <div style={toastStyle}>
      <div style={contentStyle}>
        {icons[type]}
        <span className="mono" style={{ fontSize: '0.875rem' }}>{message}</span>
        <button onClick={onClose} style={buttonStyle}>
          <X size={14} />
        </button>
      </div>
    </div>
  );
}