import React from 'react';
import { Zap, CheckCircle } from 'lucide-react';

export default function PayoutAlert({ trigger, amount, onClose }) {
  return (
    <div style={{
      position: 'fixed',
      top: '2rem',
      right: '2rem',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease-out',
      maxWidth: '380px',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-elevated) 100%)',
        border: '2px solid var(--status-green)',
        borderRadius: '12px',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <Zap size={24} className="text-green" />
          <div>
            <div className="mono text-green" style={{ fontWeight: 'bold' }}>PAYOUT TRIGGERED</div>
            <div className="mono text-muted" style={{ fontSize: '0.75rem' }}>Instant Disbursement</div>
          </div>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <div className="mono" style={{ fontSize: '0.875rem' }}>Trigger: {trigger}</div>
          <div className="mono text-amber" style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
            ₹{amount.toLocaleString('en-IN')}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <CheckCircle size={14} className="text-green" />
          <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Auto-credited to linked wallet
          </span>
        </div>
        
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '1.25rem',
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}