import React, { useEffect, useState, useContext } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWorkerProfile, getLiveTriggers, getMyPlan, getPayoutHistory } from '../api/config';
import { ToastContext } from '../App';
import { ZONE_DISPLAY_NAMES } from '../utils/constants';
import { Shield, TrendingUp, Award, Clock, CloudRain, Wind, Thermometer, DollarSign, Calendar, CheckCircle, AlertTriangle, Zap, User } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { simulateTrigger } from '../api/config';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, zone } = useAuth();
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate(); // ✅ ADD THIS LINE
  const [profile, setProfile] = useState(null);
  const [envData, setEnvData] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [recentPayouts, setRecentPayouts] = useState([]);
  const [totalProtected, setTotalProtected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [detectedLocation, setDetectedLocation] = useState(null);

  // Auto-detect user's live location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocode to get location name
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
            const data = await response.json();
            const city = data.address?.city || data.address?.town || data.address?.village || 'Unknown';
            setDetectedLocation({ name: city, lat: latitude, lon: longitude });
            console.log('📍 Location detected:', city);
          } catch (error) {
            // Fallback if reverse geocoding fails
            setDetectedLocation({ name: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`, lat: latitude, lon: longitude });
          }
        },
        (error) => {
          console.warn('Location access denied:', error);
          setDetectedLocation({ name: 'Location unavailable', lat: null, lon: null });
        }
      );
    }
  }, []);

  useEffect(() => {
  const savedPlan = sessionStorage.getItem('activePlan');
  if (savedPlan && !activePlan) {
    setActivePlan(JSON.parse(savedPlan));
  }
}, []);

  // Helper to refresh all data
  const refreshAllData = async () => {
    try {
      const [profileData, triggerData, planData, payoutData] = await Promise.all([
        getWorkerProfile(user?.id),
        getLiveTriggers(zone),
        getMyPlan(user?.id),
        getPayoutHistory(user?.id)
      ]);
      setProfile(profileData);
      setEnvData(triggerData);
      setActivePlan(planData);
      setRecentPayouts(payoutData.slice(0, 3));
      
      // Calculate total protected from payouts
      const total = payoutData.reduce((sum, p) => sum + (p.amount || 0), 0);
      setTotalProtected(total);
      
    } catch (error) {
      console.error('Refresh error:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileData, triggerData, planData, payoutData] = await Promise.all([
          getWorkerProfile(user?.id),
          getLiveTriggers(zone),
          getMyPlan(user?.id),
          getPayoutHistory(user?.id)
        ]);
        
        // Debug logging
        console.log('📊 Active Plan from API:', planData);
        console.log('📊 Plan premium:', planData?.premium);
        console.log('📊 Plan coverage:', planData?.coverage);
        console.log('📊 Plan name:', planData?.name);
        console.log('📊 Plan ID:', planData?.id);
        
        setProfile(profileData);
        setEnvData(triggerData);
        setActivePlan(planData);
        setRecentPayouts(payoutData.slice(0, 3));
        
        // Calculate total protected from payouts (REAL DATA)
        const total = payoutData.reduce((sum, p) => sum + (p.amount || 0), 0);
        setTotalProtected(total);
        
        console.log('📊 Dashboard Data Summary:', {
          profile: profileData,
          totalProtected: total,
          activePlan: planData,
          payoutsCount: payoutData.length
        });
        
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        if (showToast) showToast('Error loading dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.id) {
      fetchData();
    }
  }, [user, zone]);

  if (loading) return <LoadingSpinner message="Loading Dashboard..." />;

  // REAL DATA - from API responses
  const totalEarnings = totalProtected;  // REAL total from payouts table
  const weeklyPremium = activePlan?.premium || 0;
  const coverageAmount = activePlan?.coverage || 0;
  const riskLevel = envData?.risk_level || 'Moderate';
  const userName = profile?.name || "Rider";
  const userUniqueId = user?.id || profile?.id || "Unknown";
  
  // Format unique ID for display (show last 6 digits or custom format)
  const formattedUserId = String(userUniqueId).slice(-6);
  
  // Get readable zone name
  const getReadableZoneName = () => {
    if (detectedLocation?.name) return detectedLocation.name;
    return ZONE_DISPLAY_NAMES[zone] || zone?.replace(/_/g, ' ') || 'Unknown';
  };
  
  const getRiskColor = (level) => {
    if (level === 'High') return '#ef4444';
    if (level === 'Moderate') return '#f59e0b';
    return '#10b981';
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Welcome Header with User Info */}
      <div style={{ 
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <User size={24} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
                Welcome back, {userName.split(' ')[0]}!
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{ 
                  background: 'var(--bg-primary)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)'
                }}>
                  ID: {formattedUserId}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                  • {profile?.phone || 'Active Rider'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Location Display - Auto-detected */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          background: 'var(--bg-primary)',
          padding: '0.5rem 1rem',
          borderRadius: '2rem',
        }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            background: 'var(--success)', 
            borderRadius: '50%',
            display: 'inline-block',
          }}></span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            📍 {getReadableZoneName()}
          </span>
          {detectedLocation?.lat && (
            <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>
              ({detectedLocation.lat.toFixed(2)}, {detectedLocation.lon.toFixed(2)})
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid - NOW WITH REAL DATA */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {/* Total Protected Earnings - REAL */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          padding: '1.25rem',
          border: '1px solid var(--border-light)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Total Protected</span>
            <DollarSign size={18} style={{ color: 'var(--success)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{totalEarnings.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Lifetime earnings protected
          </div>
        </div>

        {/* Active Coverage - REAL */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          padding: '1.25rem',
          border: '1px solid var(--border-light)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Active Coverage</span>
            <Shield size={18} style={{ color: activePlan ? 'var(--success)' : 'var(--danger)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {activePlan ? `₹${coverageAmount.toLocaleString()}` : 'No Coverage'}
          </div>
          <div style={{ fontSize: '0.75rem', color: activePlan ? 'var(--success)' : 'var(--danger)', marginTop: '0.5rem' }}>
            {activePlan ? 'Protected' : 'Activate now'}
          </div>
        </div>

        {/* Weekly Premium - REAL */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          padding: '1.25rem',
          border: '1px solid var(--border-light)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Weekly Premium</span>
            <Award size={18} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{weeklyPremium}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>/week</div>
        </div>

        {/* Risk Level - REAL */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          padding: '1.25rem',
          border: `1px solid ${getRiskColor(riskLevel)}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Risk Level</span>
            <AlertTriangle size={18} style={{ color: getRiskColor(riskLevel) }} />
          </div>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: getRiskColor(riskLevel)
          }}>
            {riskLevel.toUpperCase()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {riskLevel === 'High' ? 'High risk zone' : riskLevel === 'Moderate' ? 'Moderate risk' : 'Low risk'}
          </div>
        </div>
      </div>

      {/* Live Conditions Section */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={20} style={{ color: 'var(--accent-primary)' }} />
          Live Zone Conditions
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
        }}>
          {/* Rainfall */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '1rem',
            padding: '1rem',
            border: `1px solid ${envData?.live_conditions?.rainfall_mm_hr > 40 ? 'var(--danger)' : 'var(--border-light)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <CloudRain size={20} style={{ color: envData?.live_conditions?.rainfall_mm_hr > 40 ? 'var(--danger)' : 'var(--accent-primary)' }} />
              <span style={{ fontWeight: 600 }}>Rainfall Intensity</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
              {envData?.live_conditions?.rainfall_mm_hr || 0} <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>mm/hr</span>
            </div>
            <div style={{ 
              marginTop: '0.5rem',
              height: '4px',
              background: 'var(--bg-primary)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${Math.min(((envData?.live_conditions?.rainfall_mm_hr || 0) / 80) * 100, 100)}%`,
                height: '100%',
                background: envData?.live_conditions?.rainfall_mm_hr > 40 ? 'var(--danger)' : 'var(--accent-primary)',
              }} />
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
              Threshold: 40 mm/hr
            </div>
          </div>

          {/* AQI */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '1rem',
            padding: '1rem',
            border: `1px solid ${envData?.live_conditions?.aqi > 300 ? 'var(--danger)' : 'var(--border-light)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <Wind size={20} style={{ color: envData?.live_conditions?.aqi > 300 ? 'var(--danger)' : 'var(--accent-primary)' }} />
              <span style={{ fontWeight: 600 }}>Air Quality (AQI)</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
              {envData?.live_conditions?.aqi || 0}
            </div>
            <div style={{ 
              marginTop: '0.5rem',
              height: '4px',
              background: 'var(--bg-primary)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${Math.min(((envData?.live_conditions?.aqi || 0) / 500) * 100, 100)}%`,
                height: '100%',
                background: envData?.live_conditions?.aqi > 300 ? 'var(--danger)' : 'var(--accent-primary)',
              }} />
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
              Threshold: 300 AQI
            </div>
          </div>

          {/* Temperature */}
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '1rem',
            padding: '1rem',
            border: `1px solid ${envData?.live_conditions?.temperature_c > 42 ? 'var(--danger)' : 'var(--border-light)'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <Thermometer size={20} style={{ color: envData?.live_conditions?.temperature_c > 42 ? 'var(--danger)' : 'var(--accent-primary)' }} />
              <span style={{ fontWeight: 600 }}>Temperature</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
              {envData?.live_conditions?.temperature_c || 0} <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>°C</span>
            </div>
            <div style={{ 
              marginTop: '0.5rem',
              height: '4px',
              background: 'var(--bg-primary)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${Math.min(((envData?.live_conditions?.temperature_c || 0) / 50) * 100, 100)}%`,
                height: '100%',
                background: envData?.live_conditions?.temperature_c > 42 ? 'var(--danger)' : 'var(--accent-primary)',
              }} />
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
              Threshold: 42°C
            </div>
          </div>
        </div>
      </div>

      {/* DEMO SIMULATION - FOR JUDGES */}
      <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
          borderRadius: '1rem',
          padding: '1.5rem',
          border: '2px dashed var(--accent-primary)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Zap size={24} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontWeight: 'bold' }}>🎬 Demo Mode: Instant Payout Simulation</h3>
            <span style={{
              fontSize: '0.65rem',
              padding: '0.2rem 0.5rem',
              background: 'var(--accent-primary)',
              borderRadius: '1rem',
              color: 'white',
            }}>SHOW JUDGES</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Click any button to simulate a real-world disruption. Payout will be processed in &lt;60 seconds.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={async () => {
                try {
                  const result = await simulateTrigger('HEAVY_RAIN', 55, user?.id);
                  showToast(`🌧️ ${result.message}`, 'success');
                  await refreshAllData();
                } catch (error) {
                  showToast('Demo error: ' + error.message, 'error');
                }
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600,
              }}
            >
              <CloudRain size={18} /> Simulate Heavy Rain (55mm/hr) → ₹{Math.round(300 + (55-40)*10)}
            </button>
            
            <button
              onClick={async () => {
                try {
                  const result = await simulateTrigger('EXTREME_HEAT', 45, user?.id);
                  showToast(`🌡️ ${result.message}`, 'success');
                  await refreshAllData();
                } catch (error) {
                  showToast('Demo error: ' + error.message, 'error');
                }
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#ef4444',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600,
              }}
            >
              <Thermometer size={18} /> Simulate Extreme Heat (45°C) → ₹{Math.round(200 + (45-42)*15)}
            </button>
            
            <button
              onClick={async () => {
                try {
                  const result = await simulateTrigger('HIGH_POLLUTION', 400, user?.id);
                  showToast(`🌫️ ${result.message}`, 'success');
                  await refreshAllData();
                } catch (error) {
                  showToast('Demo error: ' + error.message, 'error');
                }
              }}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#8b5cf6',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 600,
              }}
            >
              <Wind size={18} /> Simulate High Pollution (AQI 400) → ₹{Math.round(250 + (400-300)*2)}
            </button>
          </div>
        </div>
      </div>

      {/* Coverage Status & Recent Payouts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem',
      }}>
        {/* Coverage Status */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          padding: '1.5rem',
          border: '1px solid var(--border-light)',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} style={{ color: 'var(--accent-primary)' }} />
            Earnings Protection Status
          </h2>
          
          {activePlan ? (
            <div>
              <div style={{
                background: 'var(--bg-primary)',
                borderRadius: '0.75rem',
                padding: '1rem',
                marginBottom: '1rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Active Plan</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--success)' }}>{activePlan.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Coverage Amount</span>
                  <span style={{ fontWeight: 'bold' }}>₹{coverageAmount.toLocaleString()}/week</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Weekly Premium</span>
                  <span style={{ fontWeight: 'bold' }}>₹{weeklyPremium}/week</span>
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>Covered Events</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {['Heavy Rainfall (>40mm)', 'Extreme Heat (>42°C)', 'High Pollution (AQI>300)', 'Traffic Congestion', 'Platform Downtime'].map(event => (
                    <span key={event} style={{
                      padding: '0.25rem 0.75rem',
                      background: 'var(--bg-primary)',
                      borderRadius: '1rem',
                      fontSize: '0.7rem',
                      border: '1px solid var(--border-light)',
                    }}>
                      {event}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <Shield size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No active coverage detected</p>
              <button
                onClick={() => navigate('/dashboard/coverage')}

                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Activate Protection →
              </button>
            </div>
          )}
        </div>

        {/* Recent Payouts - REAL DATA */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          padding: '1.5rem',
          border: '1px solid var(--border-light)',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={20} style={{ color: 'var(--success)' }} />
            Recent Payouts
          </h2>
          
          {recentPayouts.length > 0 ? (
            <div>
              {recentPayouts.map((payout, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0',
                  borderBottom: idx < recentPayouts.length - 1 ? '1px solid var(--border-light)' : 'none',
                }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{payout.reason || 'Payout credited'}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={10} /> {payout.timestamp ? new Date(payout.timestamp).toLocaleDateString() : payout.date || 'Recent'}
                    </div>
                    {payout.trigger_value && (
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                        Trigger: {payout.trigger_value}
                      </div>
                    )}
                  </div>
                  <div style={{ fontWeight: 'bold', color: 'var(--success)' }}>
                    +₹{payout.amount}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <DollarSign size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-secondary)' }}>No payouts yet</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Click simulation buttons to test payouts</p>
            </div>
          )}
          
          {recentPayouts.length > 0 && (
            <button
             onClick={() => navigate('/dashboard/history')}
              style={{
                width: '100%',
                marginTop: '1rem',
                padding: '0.5rem',
                background: 'transparent',
                border: '1px solid var(--border-light)',
                borderRadius: '0.5rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              View All →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}