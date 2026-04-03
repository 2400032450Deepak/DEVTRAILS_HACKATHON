import React, { useEffect, useState } from 'react';

// Count-up animation helper
const CountUp = ({ endValue, duration=1000, isCurrency=false }) => {
  const [val, setVal] = useState(0);
  
  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setVal(progress * endValue);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [endValue, duration]);

  if (isCurrency) {
    return <span>{Math.floor(val).toLocaleString('en-IN')}</span>;
  }
  return <span>{val.toFixed(1)}</span>;
};

export function MetricCard({ label, value, unit, delta, isCurrency = false, isWarning = false }) {
  return (
    <div className="terminal-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', overflow: 'hidden' }}>
      <div className="mono text-muted" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <h2 className={`mono ${isWarning ? 'text-amber pulse' : ''}`} style={{ fontSize: '2.5rem', lineHeight: '1' }}>
          {isCurrency && "₹"}<CountUp endValue={value} isCurrency={isCurrency} />
        </h2>
        {unit && <span className="mono text-muted">{unit}</span>}
      </div>
      {delta && (
        <div className={`mono ${delta.startsWith('+') ? 'text-green' : 'text-red'}`} style={{ fontSize: '0.8rem' }}>
          {delta} VS LAST HR
        </div>
      )}
      
      {isWarning && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: 'var(--accent-amber)' }} />
      )}
    </div>
  );
}

export function TriggerThresholdCard({ paramName, currentVal, thresholdVal, unit }) {
  const progress = Math.min((currentVal / thresholdVal) * 100, 100);
  const isTriggered = currentVal >= thresholdVal;
  
  return (
    <div className="terminal-card" style={{ borderColor: isTriggered ? 'var(--status-red)' : 'var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span className="mono text-muted" style={{ fontSize: '0.8rem' }}>{paramName}</span>
        <span className="mono" style={{ fontSize: '0.8rem', color: isTriggered ? 'var(--status-red)' : 'var(--text-main)' }}>
          {currentVal}{unit} / {thresholdVal}{unit}
        </span>
      </div>
      
      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: isTriggered ? 'var(--status-red)' : 'var(--accent-amber)',
          transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
        }} />
      </div>
      
      {isTriggered && (
        <div style={{ marginTop: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--status-red)' }}>
          <span className="mono text-red" style={{ fontSize: '0.75rem' }}>PAYOUT TRIGGERED — IF {paramName} &gt; {thresholdVal}{unit}</span>
        </div>
      )}
    </div>
  );
}
