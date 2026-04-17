import React, { useEffect, useState, useContext, useCallback } from 'react';
import { getLiveTriggers } from '../api/config';
import { useAuth } from '../context/AuthContext';
import { ToastContext } from '../App';
import { ZONE_DISPLAY_NAMES } from '../utils/constants';
import { 
  Activity, Zap, Bell, RefreshCw, CloudRain, Wind, Thermometer, 
  AlertTriangle, CheckCircle, TrendingUp, MapPin, Clock, DollarSign,
  Droplets, Gauge, Sun, Cloud, Eye, Navigation, WifiOff
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
  const [apiStatus, setApiStatus] = useState('checking');
  const [dataSource, setDataSource] = useState('unknown');

  // Calculate real payout based on actual trigger values
  const calculateRealPayout = useCallback((conditions) => {
    let amount = 0;
    let breakdown = [];
    
    // Heavy Rain: >40mm/hr
    if (conditions?.rainfall_mm_hr > 40) {
      const excess = Math.min(200, (conditions.rainfall_mm_hr - 40) * 10);
      const rainAmount = 300 + excess;
      amount += rainAmount;
      breakdown.push({ type: 'rainfall', amount: rainAmount, value: conditions.rainfall_mm_hr });
    }
    
    // Severe Pollution: AQI > 300
    if (conditions?.aqi > 300) {
      const excess = Math.min(150, (conditions.aqi - 300) * 2);
      const aqiAmount = 250 + excess;
      amount += aqiAmount;
      breakdown.push({ type: 'aqi', amount: aqiAmount, value: conditions.aqi });
    }
    
    // Extreme Heat: >42°C
    if (conditions?.temperature_c > 42) {
      const excess = Math.min(200, (conditions.temperature_c - 42) * 15);
      const tempAmount = 200 + excess;
      amount += tempAmount;
      breakdown.push({ type: 'temperature', amount: tempAmount, value: conditions.temperature_c });
    }
    
    return { total: Math.min(amount, 1500), breakdown };
  }, []);

  const fetchData = useCallback(async () => {
    setError(null);
    setApiStatus('fetching');
    
    try {
      console.log('🌡️ Fetching live weather data for zone:', zone);
      
      const triggerData = await getLiveTriggers(zone);
      
      // Check data source from API response
      const source = triggerData?.live_conditions?.source || 'unknown';
      setDataSource(source);
      
      // Validate real data (not mock)
      const hasRealData = triggerData?.live_conditions && 
        (triggerData.live_conditions.temperature_c !== undefined ||
         triggerData.live_conditions.rainfall_mm_hr !== undefined ||
         triggerData.live_conditions.aqi !== undefined);
      
      if (!hasRealData) {
        console.warn('⚠️ Received mock/fallback data from API');
        setApiStatus('fallback');
      } else {
        setApiStatus('live');
      }
      
      setData(triggerData);
      setLastUpdated(new Date());
      
      // Calculate payout based on real conditions
      const { total: payoutAmount, breakdown } = calculateRealPayout(triggerData?.live_conditions);
      
      // Check for new triggers (only if real data shows triggered condition)
      const isRainTriggered = (triggerData?.live_conditions?.rainfall_mm_hr || 0) > 40;
      const isAqiTriggered = (triggerData?.live_conditions?.aqi || 0) > 300;
      const isTempTriggered = (triggerData?.live_conditions?.temperature_c || 0) > 42;
      
      if ((isRainTriggered || isAqiTriggered || isTempTriggered) && payoutAmount > 0) {
        const triggerType = isRainTriggered ? 'Heavy Rainfall' : 
                           isAqiTriggered ? 'High Pollution' : 'Extreme Heat';
        const triggerValue = isRainTriggered ? `${triggerData.live_conditions.rainfall_mm_hr} mm/hr` :
                            isAqiTriggered ? `${triggerData.live_conditions.aqi} AQI` :
                            `${triggerData.live_conditions.temperature_c}°C`;
        
        const newTrigger = {
          id: Date.now(),
          type: triggerType,
          value: triggerValue,
          threshold: isRainTriggered ? '> 40 mm/hr' : isAqiTriggered ? '> 300 AQI' : '> 42°C',
          timestamp: new Date(),
          amount: payoutAmount,
          breakdown: breakdown
        };
        
        setTriggerHistory(prev => [newTrigger, ...prev].slice(0, 10));
        
        if (showToast) {
          showToast(`⚠️ ${triggerType} detected! ₹${payoutAmount} auto-payout initiated`, 'warning');
        }
      }
      
    } catch (error) {
      console.error('Live monitor error:', error);
      setError(error.message || 'Failed to fetch live data from API');
      setApiStatus('error');
      if (showToast) showToast('Error fetching live weather data', 'error');
    } finally {
      setLoading(false);
    }
  }, [zone, showToast, calculateRealPayout]);

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
      interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    }
    return () => clearInterval(interval);
  }, [zone, autoRefresh, retryCount, fetchData]);

  // Get status message based on API response and data source
  const getApiStatusMessage = () => {
    if (apiStatus === 'live') {
      if (dataSource === 'weatherapi') return '✅ Live data from WeatherAPI.com';
      if (dataSource === 'openmeteo') return '✅ Live data from Open-Meteo API';
      return '✅ Live data from API';
    }
    if (apiStatus === 'fallback') return '⚠️ Using cached data (API slow)';
    if (apiStatus === 'error') return '❌ API connection issue';
    return '🔄 Fetching real-time data...';
  };

  // Get data source display name
  const getDataSourceName = () => {
    if (dataSource === 'weatherapi') return 'WeatherAPI.com';
    if (dataSource === 'openmeteo') return 'Open-Meteo';
    return 'Weather Service';
  };

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
          <WifiOff size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
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

  if (loading) return <LoadingSpinner message="Connecting to weather telemetry..." />;
  if (!data) return <LoadingSpinner message="Awaiting data stream..." />;

  // Use real data from API
  const conditions = data?.live_conditions || { 
    rainfall_mm_hr: 0, 
    aqi: 0, 
    temperature_c: 0,
    humidity_pct: 0,
    source: 'unknown',
    timestamp: new Date().toISOString()
  };
  
  const thresholds = {
    rainfall_mm_hr: 40,
    aqi: 300,
    temperature_c: 42
  };
  
  const { total: totalPayout, breakdown: payoutBreakdown } = calculateRealPayout(conditions);
  const isAnyTriggered = totalPayout > 0;

  // Calculate percentages for progress bars
  const rainfallPercent = Math.min(((conditions?.rainfall_mm_hr || 0) / 80) * 100, 100);
  const aqiPercent = Math.min(((conditions?.aqi || 0) / 500) * 100, 100);
  const tempPercent = Math.min(((conditions?.temperature_c || 0) / 50) * 100, 100);

  // Get status colors
  const getRainfallColor = () => (conditions?.rainfall_mm_hr || 0) > 40 ? '#ef4444' : (conditions?.rainfall_mm_hr || 0) > 25 ? '#f59e0b' : '#10b981';
  const getAqiColor = () => (conditions?.aqi || 0) > 300 ? '#ef4444' : (conditions?.aqi || 0) > 200 ? '#f59e0b' : '#10b981';
  const getTempColor = () => (conditions?.temperature_c || 0) > 42 ? '#ef4444' : (conditions?.temperature_c || 0) > 38 ? '#f59e0b' : '#10b981';

  // Get AQI description
  const getAqiDescription = (aqi) => {
    if (aqi > 300) return 'Hazardous';
    if (aqi > 200) return 'Very Unhealthy';
    if (aqi > 150) return 'Unhealthy';
    if (aqi > 100) return 'Unhealthy for Sensitive Groups';
    if (aqi > 50) return 'Moderate';
    return 'Good';
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header with API Status */}
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
            <span>Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Just now'}</span>
            <span style={{ 
              marginLeft: '0.5rem',
              padding: '0.2rem 0.5rem',
              borderRadius: '1rem',
              fontSize: '0.6rem',
              background: apiStatus === 'live' ? '#10b98120' : apiStatus === 'fallback' ? '#f59e0b20' : '#ef444420',
              color: apiStatus === 'live' ? '#10b981' : apiStatus === 'fallback' ? '#f59e0b' : '#ef4444'
            }}>
              {getApiStatusMessage()}
            </span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: autoRefresh ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-primary)',
            borderRadius: '2rem',
            border: `1px solid ${autoRefresh ? '#10b981' : 'var(--border-light)'}`
          }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              background: autoRefresh ? '#10b981' : 'var(--text-tertiary)',
              borderRadius: '50%',
              display: 'inline-block',
              animation: autoRefresh ? 'pulse 2s infinite' : 'none'
            }}></span>
            <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>
              {autoRefresh ? 'Live Updates (30s)' : 'Paused'}
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

      {/* Real-time Data Source Info - NOW SHOWS CORRECT SOURCE */}
      <div style={{
        background: 'var(--bg-primary)',
        borderRadius: '0.5rem',
        padding: '0.5rem 1rem',
        marginBottom: '1rem',
        fontSize: '0.7rem',
        color: 'var(--text-tertiary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap',
      }}>
        <Cloud size={12} />
        <span>Data Source: <strong>{getDataSourceName()}</strong> (Real-time)</span>
        <span>•</span>
        <span>AQI: {conditions?.aqi || 'Loading...'}</span>
        <span>•</span>
        <span>Updates every 30 seconds</span>
        {conditions?.timestamp && (
          <>
            <span>•</span>
            <span>Server time: {new Date(conditions.timestamp).toLocaleString()}</span>
          </>
        )}
      </div>

      {/* Alert Banner if triggers are active */}
      {isAnyTriggered && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)',
          borderLeft: `4px solid #ef4444`,
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
            <AlertTriangle size={24} style={{ color: '#ef4444' }} />
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>⚠️ Parametric Trigger Activated!</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {payoutBreakdown.map(b => `${b.type === 'rainfall' ? 'Rainfall' : b.type === 'aqi' ? 'Pollution' : 'Heat'}: ${b.value}`).join(' • ')}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Auto-Payout</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#10b981' }}>₹{totalPayout}</div>
          </div>
        </div>
      )}

      {/* Main Metrics Grid - 3 Cards with REAL Data */}
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
          border: `2px solid ${(conditions?.rainfall_mm_hr || 0) > 40 ? '#ef4444' : 'var(--border-light)'}`,
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
              {(conditions?.rainfall_mm_hr || 0) > 40 ? 'TRIGGER ACTIVE' : (conditions?.rainfall_mm_hr || 0) > 25 ? 'WARNING' : 'NORMAL'}
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
              <span>Trigger: {thresholds?.rainfall_mm_hr || 40} mm/hr</span>
              <span>80 mm/hr</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
              {conditions?.rainfall_mm_hr > 40 ? '⚠️ Heavy rain detected - coverage active' : 'Normal conditions'}
            </div>
          </div>
        </div>

        {/* AQI Card */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          border: `2px solid ${(conditions?.aqi || 0) > 300 ? '#ef4444' : (conditions?.aqi || 0) > 200 ? '#f59e0b' : 'var(--border-light)'}`,
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
              {(conditions?.aqi || 0) > 300 ? 'TRIGGER ACTIVE' : (conditions?.aqi || 0) > 200 ? getAqiDescription(conditions?.aqi).toUpperCase() : 'MODERATE'}
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
              <span>Trigger: {thresholds?.aqi || 300}</span>
              <span>500</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
              {getAqiDescription(conditions?.aqi || 0)} {conditions?.aqi > 300 ? '- coverage active' : ''}
            </div>
          </div>
        </div>

        {/* Temperature Card */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          border: `2px solid ${(conditions?.temperature_c || 0) > 42 ? '#ef4444' : (conditions?.temperature_c || 0) > 38 ? '#f59e0b' : 'var(--border-light)'}`,
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
              {(conditions?.temperature_c || 0) > 42 ? 'TRIGGER ACTIVE' : (conditions?.temperature_c || 0) > 38 ? 'HIGH' : 'NORMAL'}
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
              <span>Trigger: {thresholds?.temperature_c || 42}°C</span>
              <span>50°C</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
              {conditions?.temperature_c > 42 ? '⚠️ Extreme heat detected - coverage active' : 'Normal temperature range'}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Real-time Payout Calculation */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: '1rem',
        border: '1px solid var(--border-light)',
        padding: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <DollarSign size={20} style={{ color: 'var(--success)' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Real-time Payout Calculation</h2>
        </div>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Rainfall Payout</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              {conditions?.rainfall_mm_hr > 40 ? `₹${300 + Math.min(200, (conditions.rainfall_mm_hr - 40) * 10)}` : '₹0'}
            </div>
            <div style={{ fontSize: '0.6rem', color: conditions?.rainfall_mm_hr > 40 ? '#10b981' : 'var(--text-tertiary)' }}>
              {conditions?.rainfall_mm_hr > 40 ? 'Active' : 'Waiting for trigger'}
            </div>
          </div>
          
          <div style={{ padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Pollution Payout</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              {conditions?.aqi > 300 ? `₹${250 + Math.min(150, (conditions.aqi - 300) * 2)}` : '₹0'}
            </div>
            <div style={{ fontSize: '0.6rem', color: conditions?.aqi > 300 ? '#10b981' : 'var(--text-tertiary)' }}>
              {conditions?.aqi > 300 ? 'Active' : 'Waiting for trigger'}
            </div>
          </div>
          
          <div style={{ padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Heat Payout</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              {conditions?.temperature_c > 42 ? `₹${200 + Math.min(200, (conditions.temperature_c - 42) * 15)}` : '₹0'}
            </div>
            <div style={{ fontSize: '0.6rem', color: conditions?.temperature_c > 42 ? '#10b981' : 'var(--text-tertiary)' }}>
              {conditions?.temperature_c > 42 ? 'Active' : 'Waiting for trigger'}
            </div>
          </div>
          
          <div style={{ padding: '0.75rem', background: 'var(--success-glow)', borderRadius: '0.5rem', border: '1px solid var(--success)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Total Protected</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>₹{totalPayout}</div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>
              {isAnyTriggered ? 'Payout initiated' : 'No active triggers'}
            </div>
          </div>
        </div>
        
        <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '0.5rem' }}>
          Payouts are automatically calculated based on real-time weather data from {getDataSourceName()}
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