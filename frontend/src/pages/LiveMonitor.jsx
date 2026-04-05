import React, { useEffect, useState, useContext } from 'react';
import { getLiveTriggers } from '../api/config';
import { useAuth } from '../context/AuthContext';
import { ToastContext } from '../App';
import { ZONE_DISPLAY_NAMES } from '../utils/constants';
import { 
  Activity, Zap, Bell, RefreshCw, CloudRain, Wind, Thermometer, 
  AlertTriangle, CheckCircle, TrendingUp, MapPin, Clock, DollarSign,
  Droplets, Gauge, Sun, Cloud, Eye, Navigation
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function LiveMonitor() {
  const { user, zone } = useAuth();
  const { showToast } = useContext(ToastContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [triggerHistory, setTriggerHistory] = useState([]);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = async () => {
    setError(null);
    try {
      const triggerData = await getLiveTriggers(zone);
      setData(triggerData);
      setLastUpdated(new Date());
      
      // Check for new triggers
      if (triggerData.active_triggers) {
        const newTrigger = {
          id: Date.now(),
          type: getActiveTriggerType(triggerData),
          value: getActiveTriggerValue(triggerData),
          threshold: getActiveThreshold(triggerData),
          timestamp: new Date(),
          amount: calculatePayout(triggerData)
        };
        setTriggerHistory(prev => [newTrigger, ...prev].slice(0, 5));
        
        if (showToast) {
          showToast(`⚠️ Trigger activated! ₹${newTrigger.amount} payout initiated`, 'warning');
        }
      }
    } catch (error) {
      console.error('Live monitor error:', error);
      setError(error.message || 'Failed to fetch live data');
      if (showToast) showToast('Error fetching live data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculatePayout = (triggerData) => {
    let amount = 0;
    if (triggerData?.live_conditions?.rainfall_mm_hr > 40) amount += 300;
    if (triggerData?.live_conditions?.aqi > 300) amount += 250;
    if (triggerData?.live_conditions?.temperature_c > 42) amount += 200;
    return amount;
  };

  const getActiveTriggerType = (triggerData) => {
    if (triggerData?.live_conditions?.rainfall_mm_hr > 40) return 'Heavy Rainfall';
    if (triggerData?.live_conditions?.aqi > 300) return 'High Pollution';
    if (triggerData?.live_conditions?.temperature_c > 42) return 'Extreme Heat';
    return 'None';
  };

  const getActiveTriggerValue = (triggerData) => {
    if (triggerData?.live_conditions?.rainfall_mm_hr > 40) 
      return `${triggerData.live_conditions.rainfall_mm_hr} mm/hr`;
    if (triggerData?.live_conditions?.aqi > 300) 
      return `${triggerData.live_conditions.aqi} AQI`;
    if (triggerData?.live_conditions?.temperature_c > 42) 
      return `${triggerData.live_conditions.temperature_c}°C`;
    return '-';
  };

  const getActiveThreshold = (triggerData) => {
    if (triggerData?.live_conditions?.rainfall_mm_hr > 40) return '> 40 mm/hr';
    if (triggerData?.live_conditions?.aqi > 300) return '> 300 AQI';
    if (triggerData?.live_conditions?.temperature_c > 42) return '> 42°C';
    return '-';
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount(prev => prev + 1);
    fetchData();
  };

  useEffect(() => {
    fetchData();
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchData, 15000); // Refresh every 15 seconds
    }
    return () => clearInterval(interval);
  }, [zone, autoRefresh, retryCount]);

  // Error state with retry button
  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh',
        gap: '1rem',
        padding: '2rem'
      }}>
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          padding: '2rem',
          borderRadius: '1rem',
          textAlign: 'center',
          border: '1px solid var(--danger)',
          maxWidth: '400px'
        }}>
          <AlertTriangle size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Unable to Fetch Live Data</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>
          <button
            onClick={handleRetry}
            style={{
              padding: '0.5rem 1.5rem',
              background: 'var(--accent-primary)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          >
            <RefreshCw size={16} />
            Retry Now
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner message="Connecting to telemetry stream..." />;
  if (!data) return <LoadingSpinner message="Awaiting data stream..." />;

  // SAFE: Use default values if live_conditions is undefined
  const conditions = data?.live_conditions || { rainfall_mm_hr: 0, aqi: 0, temperature_c: 0 };
  const thresholds = data?.thresholds || { rainfall_mm_hr: 40, aqi: 300, temperature_c: 42 };
  const totalPayout = calculatePayout(data);
  const isAnyTriggered = totalPayout > 0;

  // Calculate excess payouts
  const rainfallExcess = Math.min(200, ((conditions?.rainfall_mm_hr || 0) - 40) * 10);
  const aqiExcess = Math.min(150, ((conditions?.aqi || 0) - 300) * 2);
  const tempExcess = Math.min(200, ((conditions?.temperature_c || 0) - 42) * 15);

  // Calculate percentages for progress bars (with safe defaults)
  const rainfallPercent = Math.min(((conditions?.rainfall_mm_hr || 0) / 80) * 100, 100);
  const aqiPercent = Math.min(((conditions?.aqi || 0) / 500) * 100, 100);
  const tempPercent = Math.min(((conditions?.temperature_c || 0) / 50) * 100, 100);

  // Get status colors (with safe defaults)
  const getRainfallColor = () => (conditions?.rainfall_mm_hr || 0) > 40 ? 'var(--danger)' : (conditions?.rainfall_mm_hr || 0) > 25 ? 'var(--warning)' : 'var(--success)';
  const getAqiColor = () => (conditions?.aqi || 0) > 300 ? 'var(--danger)' : (conditions?.aqi || 0) > 200 ? 'var(--warning)' : 'var(--success)';
  const getTempColor = () => (conditions?.temperature_c || 0) > 42 ? 'var(--danger)' : (conditions?.temperature_c || 0) > 38 ? 'var(--warning)' : 'var(--success)';

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={28} style={{ color: 'var(--accent-primary)' }} />
            Live Parametric Monitor
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <MapPin size={12} />
            <span>{ZONE_DISPLAY_NAMES[zone] || zone?.replace(/_/g, ' ') || 'Unknown'}</span>
            <Clock size={12} style={{ marginLeft: '0.5rem' }} />
            <span>Last updated: {lastUpdated?.toLocaleTimeString() || 'Just now'}</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: autoRefresh ? 'var(--success-glow)' : 'var(--bg-primary)',
            borderRadius: '2rem',
            border: `1px solid ${autoRefresh ? 'var(--success)' : 'var(--border-light)'}`
          }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              background: autoRefresh ? 'var(--success)' : 'var(--text-tertiary)',
              borderRadius: '50%',
              display: 'inline-block',
              animation: autoRefresh ? 'pulse 2s infinite' : 'none'
            }}></span>
            <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>
              {autoRefresh ? 'Live Updates' : 'Paused'}
            </span>
          </div>
          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: '0.5rem',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <RefreshCw size={14} className={autoRefresh ? 'spin' : ''} />
            {autoRefresh ? 'Pause' : 'Resume'}
          </button>
          
          <button
            onClick={fetchData}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--accent-primary)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            Refresh Now
          </button>
        </div>
      </div>

      {/* Alert Banner if triggers are active */}
      {isAnyTriggered && (
        <div style={{
          background: 'linear-gradient(135deg, var(--danger-glow) 0%, var(--warning-glow) 100%)',
          borderLeft: `4px solid var(--danger)`,
          borderRadius: '0.75rem',
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <AlertTriangle size={24} style={{ color: 'var(--danger)' }} />
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Parametric Trigger Activated!</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {getActiveTriggerType(data)} threshold exceeded ({getActiveTriggerValue(data)} &gt; {getActiveThreshold(data)})
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Instant Payout</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>₹{totalPayout}</div>
          </div>
        </div>
      )}

      {/* Main Metrics Grid - 3 Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {/* Rainfall Card */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          border: `1px solid ${(conditions?.rainfall_mm_hr || 0) > 40 ? 'var(--danger)' : 'var(--border-light)'}`,
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '1rem 1.5rem',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CloudRain size={20} style={{ color: getRainfallColor() }} />
              <span style={{ fontWeight: 600 }}>Rainfall Intensity</span>
            </div>
            <span style={{ 
              fontSize: '0.7rem', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '1rem',
              background: getRainfallColor() + '20',
              color: getRainfallColor(),
              fontWeight: 500,
            }}>
              {(conditions?.rainfall_mm_hr || 0) > 40 ? 'TRIGGERED' : (conditions?.rainfall_mm_hr || 0) > 25 ? 'WARNING' : 'NORMAL'}
            </span>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {conditions?.rainfall_mm_hr || 0} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>mm/hr</span>
            </div>
            <div style={{ 
              marginTop: '1rem',
              height: '8px',
              background: 'var(--bg-primary)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${rainfallPercent}%`,
                height: '100%',
                background: getRainfallColor(),
                transition: 'width 0.5s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
              <span>0 mm/hr</span>
              <span>Threshold: {thresholds?.rainfall_mm_hr || 40} mm/hr</span>
              <span>80 mm/hr</span>
            </div>
            {(conditions?.rainfall_mm_hr || 0) > 40 && (
              <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'var(--danger-glow)', borderRadius: '0.5rem', fontSize: '0.75rem' }}>
                💰 Payout triggered: ₹{300 + rainfallExcess} (₹300 base + ₹{rainfallExcess} excess)
              </div>
            )}
          </div>
        </div>

        {/* AQI Card */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          border: `1px solid ${(conditions?.aqi || 0) > 300 ? 'var(--danger)' : (conditions?.aqi || 0) > 200 ? 'var(--warning)' : 'var(--border-light)'}`,
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '1rem 1.5rem',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Wind size={20} style={{ color: getAqiColor() }} />
              <span style={{ fontWeight: 600 }}>Air Quality Index</span>
            </div>
            <span style={{ 
              fontSize: '0.7rem', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '1rem',
              background: getAqiColor() + '20',
              color: getAqiColor(),
              fontWeight: 500,
            }}>
              {(conditions?.aqi || 0) > 300 ? 'HAZARDOUS' : (conditions?.aqi || 0) > 200 ? 'UNHEALTHY' : 'MODERATE'}
            </span>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {conditions?.aqi || 0}
            </div>
            <div style={{ 
              marginTop: '1rem',
              height: '8px',
              background: 'var(--bg-primary)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${aqiPercent}%`,
                height: '100%',
                background: getAqiColor(),
                transition: 'width 0.5s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
              <span>0</span>
              <span>Threshold: {thresholds?.aqi || 300}</span>
              <span>500</span>
            </div>
            {(conditions?.aqi || 0) > 300 && (
              <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'var(--danger-glow)', borderRadius: '0.5rem', fontSize: '0.75rem' }}>
                💰 Payout triggered: ₹{250 + aqiExcess} (₹250 base + ₹{aqiExcess} excess)
              </div>
            )}
          </div>
        </div>

        {/* Temperature Card */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          border: `1px solid ${(conditions?.temperature_c || 0) > 42 ? 'var(--danger)' : (conditions?.temperature_c || 0) > 38 ? 'var(--warning)' : 'var(--border-light)'}`,
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '1rem 1.5rem',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Thermometer size={20} style={{ color: getTempColor() }} />
              <span style={{ fontWeight: 600 }}>Temperature</span>
            </div>
            <span style={{ 
              fontSize: '0.7rem', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '1rem',
              background: getTempColor() + '20',
              color: getTempColor(),
              fontWeight: 500,
            }}>
              {(conditions?.temperature_c || 0) > 42 ? 'EXTREME' : (conditions?.temperature_c || 0) > 38 ? 'HIGH' : 'NORMAL'}
            </span>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {conditions?.temperature_c || 0} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>°C</span>
            </div>
            <div style={{ 
              marginTop: '1rem',
              height: '8px',
              background: 'var(--bg-primary)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${tempPercent}%`,
                height: '100%',
                background: getTempColor(),
                transition: 'width 0.5s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
              <span>0°C</span>
              <span>Threshold: {thresholds?.temperature_c || 42}°C</span>
              <span>50°C</span>
            </div>
            {(conditions?.temperature_c || 0) > 42 && (
              <div style={{ marginTop: '1rem', padding: '0.5rem', background: 'var(--danger-glow)', borderRadius: '0.5rem', fontSize: '0.75rem' }}>
                💰 Payout triggered: ₹{200 + tempExcess} (₹200 base + ₹{tempExcess} excess)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section - Payout Summary & Trigger History */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem',
      }}>
        {/* Payout Calculation Engine */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          border: '1px solid var(--border-light)',
          padding: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <DollarSign size={20} style={{ color: 'var(--success)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Payout Calculation Engine</h2>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>ALGORITHM: BASE + (EXCESS × MULTIPLIER)</div>
            <div style={{ 
              background: 'var(--bg-primary)', 
              borderRadius: '0.5rem', 
              padding: '1rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
            }}>
              {(conditions?.rainfall_mm_hr || 0) > 40 && (
                <div style={{ marginBottom: '0.5rem' }}>✓ Rainfall: {conditions?.rainfall_mm_hr}mm/hr → ₹{300 + rainfallExcess} (₹300 + ₹{rainfallExcess} excess)</div>
              )}
              {(conditions?.aqi || 0) > 300 && (
                <div style={{ marginBottom: '0.5rem' }}>✓ AQI: {conditions?.aqi} → ₹{250 + aqiExcess} (₹250 + ₹{aqiExcess} excess)</div>
              )}
              {(conditions?.temperature_c || 0) > 42 && (
                <div style={{ marginBottom: '0.5rem' }}>✓ Temperature: {conditions?.temperature_c}°C → ₹{200 + tempExcess} (₹200 + ₹{tempExcess} excess)</div>
              )}
              {!isAnyTriggered && (
                <div style={{ color: 'var(--text-tertiary)' }}>○ No active triggers • Monitoring conditions</div>
              )}
            </div>
          </div>
          
          {isAnyTriggered && (
            <div style={{
              padding: '1rem',
              background: 'var(--success-glow)',
              borderRadius: '0.5rem',
              border: '1px solid var(--success)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Estimated Payout</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>₹{totalPayout}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Instant disbursement to linked wallet</div>
            </div>
          )}
        </div>

        {/* Trigger History */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          border: '1px solid var(--border-light)',
          padding: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Bell size={20} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Recent Triggers</h2>
          </div>
          
          {triggerHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
              <CheckCircle size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
              <div style={{ fontSize: '0.875rem' }}>No recent triggers</div>
              <div style={{ fontSize: '0.7rem' }}>System is monitoring conditions</div>
            </div>
          ) : (
            <div>
              {triggerHistory.map(trigger => (
                <div key={trigger.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid var(--border-light)',
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <AlertTriangle size={12} style={{ color: 'var(--danger)' }} />
                      <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{trigger.type}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                      {trigger.value} (Threshold: {trigger.threshold})
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--success)', fontSize: '1rem' }}>+₹{trigger.amount}</div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>
                      {trigger.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}