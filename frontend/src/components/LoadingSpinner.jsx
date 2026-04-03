import React from 'react';

export default function LoadingSpinner({ message = 'LOADING SYSTEM...' }) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '4rem',
      gap: '1rem'
    }}>
      <div className="spinner"></div>
      <div className="mono text-muted" style={{ fontSize: '0.875rem' }}>
        {message}
      </div>
    </div>
  );
}