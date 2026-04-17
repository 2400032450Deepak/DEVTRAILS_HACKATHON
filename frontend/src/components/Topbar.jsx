import React, { useState, useEffect } from 'react';
import { Bell, Menu, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ZONE_DISPLAY_NAMES } from '../utils/constants';

export default function Topbar({ onMenuClick }) {
  const { setZone, zone, user } = useAuth();
  const [time, setTime] = useState("");
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [ws, setWs] = useState(null);

  // ============================================
  // REAL-TIME NOTIFICATION FUNCTIONS
  // ============================================

  // Add a real notification
  const addNotification = (message, type = 'info', eventType = 'general') => {
    const newNotification = {
      id: Date.now(),
      message,
      type, // 'success', 'error', 'warning', 'info'
      eventType, // 'location', 'payout', 'weather', 'demo'
      read: false,
      time: new Date().toLocaleTimeString('en-IN', { hour12: false })
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
    
    // Also show toast if available
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: { message, type: type === 'success' ? 'success' : type === 'warning' ? 'error' : 'info' }
      }));
    }
    
    return newNotification.id;
  };

  // ============================================
  // LOCATION DETECTION NOTIFICATION
  // ============================================
  const detectLocation = async () => {
    try {
      addNotification('📍 Detecting your location...', 'info', 'location');
      
      const getCoordinates = () => {
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation not supported"));
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            (err) => reject(err),
            { timeout: 10000, enableHighAccuracy: true }
          );
        });
      };

      const coords = await getCoordinates();
      console.log(`📍 Current coordinates: ${coords.lat}, ${coords.lon}`);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lon}`
      );
      const data = await response.json();

      const city = data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.state_district ||
        "";

      const state = data.address?.state || "";
      
      console.log(`📍 Detected city: ${city}, State: ${state}`);

      let detectedZone = "Zone_D_Hyderabad";
      let locationName = city || state || "your area";

      // Zone detection logic
      const cityLower = city.toLowerCase();
      const stateLower = state.toLowerCase();
      
      if (cityLower.includes("bangalore") || cityLower.includes("bengaluru")) {
        detectedZone = "Zone_A_Bangalore";
        locationName = "Bangalore";
      } 
      else if (cityLower.includes("mumbai")) {
        detectedZone = "Zone_B_Mumbai";
        locationName = "Mumbai";
      } 
      else if (cityLower.includes("delhi") || cityLower.includes("new delhi")) {
        detectedZone = "Zone_C_Delhi";
        locationName = "Delhi";
      } 
      else if (cityLower.includes("hyderabad") || 
               cityLower.includes("secunderabad") ||
               cityLower.includes("guntur") ||
               cityLower.includes("vijayawada") ||
               stateLower.includes("andhra pradesh") ||
               stateLower.includes("telangana")) {
        detectedZone = "Zone_D_Hyderabad";
        locationName = city || "Hyderabad Region";
      } 
      else if (cityLower.includes("chennai")) {
        detectedZone = "Zone_E_Chennai";
        locationName = "Chennai";
      }
      else if (coords.lat >= 14.0 && coords.lat <= 18.0 && coords.lon >= 77.0 && coords.lon <= 82.0) {
        detectedZone = "Zone_D_Hyderabad";
        locationName = "Andhra Pradesh/Telangana Region";
      }

      console.log(`📍 Setting zone to: ${detectedZone} (based on: ${locationName})`);
      setZone(detectedZone);
      localStorage.setItem('userZone', detectedZone);
      
      // SUCCESS NOTIFICATION
      addNotification(
        `📍 Location detected: ${locationName} | Zone: ${detectedZone.replace('Zone_', '').replace('_', ' ')}`,
        'success',
        'location'
      );
      
    } catch (error) {
      console.error("Location detection failed:", error);
      addNotification(`⚠️ Location detection failed: ${error.message}`, 'error', 'location');
      
      const savedZone = localStorage.getItem('userZone');
      if (savedZone) {
        setZone(savedZone);
        addNotification(`📍 Using saved zone: ${savedZone.replace('Zone_', '').replace('_', ' ')}`, 'info', 'location');
      }
    }
  };

  // ============================================
  // PAYOUT NOTIFICATION (called from Dashboard)
  // ============================================
  const showPayoutNotification = (amount, triggerType) => {
    const triggerNames = {
      'HEAVY_RAIN': 'Heavy Rainfall',
      'EXTREME_HEAT': 'Extreme Heat',
      'HIGH_POLLUTION': 'High Pollution',
      'TRAFFIC_CONGESTION': 'Traffic Congestion',
      'PLATFORM_OUTAGE': 'Platform Outage'
    };
    
    const triggerName = triggerNames[triggerType] || triggerType;
    addNotification(
      `💰 ₹${amount} payout credited for ${triggerName}!`,
      'success',
      'payout'
    );
  };

  // ============================================
  // WEATHER ALERT NOTIFICATION
  // ============================================
  const showWeatherAlert = (condition, value) => {
    const alerts = {
      'HEAVY_RAIN': `🌧️ Heavy Rainfall Alert: ${value}mm/hr - Coverage Active`,
      'EXTREME_HEAT': `🌡️ Extreme Heat Alert: ${value}°C - Coverage Active`,
      'HIGH_POLLUTION': `🌫️ High Pollution Alert: AQI ${value} - Coverage Active`
    };
    
    addNotification(
      alerts[condition] || `⚠️ Weather Alert: ${condition} detected`,
      'warning',
      'weather'
    );
  };

  // ============================================
  // DEMO SIMULATION NOTIFICATION
  // ============================================
  const showDemoNotification = (triggerType, amount) => {
    const demoMessages = {
      'HEAVY_RAIN': `🎬 DEMO: Heavy Rain simulation triggered! ₹${amount} payout processed`,
      'EXTREME_HEAT': `🎬 DEMO: Extreme Heat simulation triggered! ₹${amount} payout processed`,
      'HIGH_POLLUTION': `🎬 DEMO: High Pollution simulation triggered! ₹${amount} payout processed`
    };
    
    addNotification(
      demoMessages[triggerType] || `🎬 DEMO: ${triggerType} simulation - ₹${amount} payout`,
      'info',
      'demo'
    );
  };

  // ============================================
  // REAL-TIME WEATHER MONITORING
  // ============================================
  const startWeatherMonitoring = async () => {
    const checkWeather = async () => {
      try {
        const response = await fetch('https://devtrails-ai.onrender.com/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zone: zone || 'Zone_D_Hyderabad' })
        });
        const data = await response.json();
        const conditions = data.live_conditions;
        
        // Check for triggers
        if (conditions.rainfall_mm_hr > 40) {
          showWeatherAlert('HEAVY_RAIN', conditions.rainfall_mm_hr);
        }
        if (conditions.temperature_c > 42) {
          showWeatherAlert('EXTREME_HEAT', conditions.temperature_c);
        }
        if (conditions.aqi > 300) {
          showWeatherAlert('HIGH_POLLUTION', conditions.aqi);
        }
      } catch (error) {
        console.error('Weather check failed:', error);
      }
    };
    
    // Check every 5 minutes
    const interval = setInterval(checkWeather, 300000);
    return () => clearInterval(interval);
  };

  // ============================================
  // MARK NOTIFICATIONS
  // ============================================
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // ============================================
  // INITIALIZATION
  // ============================================
  useEffect(() => {
    // Detect location on mount
    detectLocation();
    
    // Start weather monitoring
    let weatherCleanup;
    startWeatherMonitoring().then(cleanup => { weatherCleanup = cleanup; });
    
    // Listen for custom events from Dashboard
    const handlePayoutEvent = (event) => {
      showPayoutNotification(event.detail.amount, event.detail.triggerType);
    };
    
    const handleDemoEvent = (event) => {
      showDemoNotification(event.detail.triggerType, event.detail.amount);
    };
    
    const handleWeatherEvent = (event) => {
      showWeatherAlert(event.detail.condition, event.detail.value);
    };
    
    window.addEventListener('payoutTriggered', handlePayoutEvent);
    window.addEventListener('demoTriggered', handleDemoEvent);
    window.addEventListener('weatherAlert', handleWeatherEvent);
    
    return () => {
      if (weatherCleanup) weatherCleanup();
      window.removeEventListener('payoutTriggered', handlePayoutEvent);
      window.removeEventListener('demoTriggered', handleDemoEvent);
      window.removeEventListener('weatherAlert', handleWeatherEvent);
    };
  }, []);

  // ============================================
  // Fetch user profile
  // ============================================
  useEffect(() => {
    if (user?.id) {
      fetch(`https://delivershield-backend.onrender.com/api/workers/${user.id}`)
        .then(res => res.json())
        .then(data => setProfile(data))
        .catch(err => console.error('Failed to fetch profile:', err));
    }
  }, [user]);

  // ============================================
  // Time updater
  // ============================================
  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not available';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    if (digits.length === 12 && digits.startsWith('91')) {
      return `+${digits.slice(0, 2)} ${digits.slice(2, 7)} ${digits.slice(7)}`;
    }
    return phone;
  };

  const getReadableZoneName = () => {
    return ZONE_DISPLAY_NAMES[zone] || zone?.replace(/_/g, ' ') || 'Unknown';
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'success': return '💰';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '📍';
    }
  };

  const getNotificationColor = (type) => {
    switch(type) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#667eea';
    }
  };

  return (
    <header style={{
      height: '64px',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-light)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      boxShadow: 'var(--shadow-sm)',
    }}>
      
      {/* LEFT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onMenuClick}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-primary)',
          }}
          className="mobile-menu-btn"
        >
          <Menu size={24} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            width: '8px',
            height: '8px',
            background: 'var(--success)',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'pulse 2s infinite',
          }}></span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            SYSTEM ONLINE
          </span>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        
        {/* Zone Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--bg-primary)',
          padding: '0.3rem 0.8rem',
          borderRadius: '2rem',
          border: '1px solid var(--border-light)'
        }}>
          <MapPin size={12} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-primary)' }}>
            {getReadableZoneName()}
          </span>
        </div>

        {/* Logged in as indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--bg-primary)',
          padding: '0.3rem 0.8rem',
          borderRadius: '2rem',
          border: '1px solid var(--border-light)'
        }}>
          <Phone size={12} style={{ color: 'var(--success)' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-primary)' }}>
            {formatPhoneNumber(profile?.phone)}
          </span>
          <div style={{
            width: '6px',
            height: '6px',
            background: 'var(--success)',
            borderRadius: '50%'
          }} />
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
            Active
          </span>
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              position: 'relative',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: '0.5rem',
              padding: '0.5rem',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--danger)',
                color: 'white',
                fontSize: '0.6rem',
                padding: '2px 5px',
                borderRadius: '10px',
                fontWeight: 'bold',
                minWidth: '16px',
                textAlign: 'center',
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div 
                onClick={() => setShowNotifications(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 39,
                }}
              />
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '360px',
                maxWidth: '90vw',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-light)',
                borderRadius: '0.75rem',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 40,
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '1rem',
                  borderBottom: '1px solid var(--border-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>Notifications</span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginLeft: '0.5rem' }}>
                      {unreadCount} unread
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.7rem',
                      color: 'var(--accent-primary)',
                      cursor: 'pointer',
                    }}>
                      Mark all read
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                      <Bell size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                      <div style={{ fontSize: '0.8rem' }}>No notifications yet</div>
                      <div style={{ fontSize: '0.7rem' }}>Check back for updates</div>
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        style={{
                          padding: '0.75rem 1rem',
                          borderBottom: '1px solid var(--border-light)',
                          background: notif.read ? 'transparent' : `${getNotificationColor(notif.type)}10`,
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '1rem' }}>{getNotificationIcon(notif.type)}</span>
                          <span style={{ fontSize: '0.8rem', fontWeight: notif.read ? 'normal' : 'bold' }}>
                            {notif.message}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginLeft: '1.5rem' }}>
                          {notif.time}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Time */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          background: 'var(--bg-primary)',
          padding: '0.25rem 0.75rem',
          borderRadius: '0.5rem',
        }}>
          {time}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}