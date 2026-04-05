import React, { useState, useEffect } from 'react';
import { Bell, Menu, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ onMenuClick }) {
  const { setZone, user } = useAuth();
  const [time, setTime] = useState("");
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Heavy rainfall alert in your zone", read: false, time: "2 min ago" },
    { id: 2, message: "Your payout of ₹350 has been credited", read: false, time: "1 hour ago" },
    { id: 3, message: "Weekly premium due in 2 days", read: false, time: "5 hours ago" }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch user profile for display
  useEffect(() => {
    if (user?.id) {
      fetch(`https://delivershield-backend.onrender.com/api/workers/${user.id}`)
        .then(res => res.json())
        .then(data => setProfile(data))
        .catch(err => console.error('Failed to fetch profile:', err));
    }
  }, [user]);

  // Auto-detect location (runs in background)
  const detectLocation = async () => {
    try {
      const getCoordinates = () => {
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation not supported"));
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            (err) => reject(err),
            { timeout: 10000 }
          );
        });
      };

      const coords = await getCoordinates();

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lon}`
      );
      const data = await response.json();

      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.state_district ||
        "";

      let detectedZone = "Zone_B_Mumbai"; // default

      if (city.toLowerCase().includes("bangalore") || city.toLowerCase().includes("bengaluru")) {
        detectedZone = "Zone_A_Bangalore";
      } else if (city.toLowerCase().includes("mumbai")) {
        detectedZone = "Zone_B_Mumbai";
      } else if (city.toLowerCase().includes("delhi")) {
        detectedZone = "Zone_C_Delhi";
      } else if (city.toLowerCase().includes("hyderabad")) {
        detectedZone = "Zone_D_Hyderabad";
      } else if (city.toLowerCase().includes("chennai")) {
        detectedZone = "Zone_E_Chennai";
      }

      setZone(detectedZone);
    } catch (error) {
      console.error("Location detection failed:", error);
    }
  };

  // Run location detection on mount
  useEffect(() => {
    detectLocation();
  }, []);

  // Time updater
  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Format phone number for display
  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not available';
    // Remove any non-digit characters
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    if (digits.length === 12 && digits.startsWith('91')) {
      return `+${digits.slice(0, 2)} ${digits.slice(2, 7)} ${digits.slice(7)}`;
    }
    return phone;
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
        
        {/* ✅ Logged in as indicator */}
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
                width: '320px',
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
                }}>
                  <span style={{ fontWeight: 'bold' }}>Notifications</span>
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
                  {notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid var(--border-light)',
                        background: notif.read ? 'transparent' : 'var(--accent-glow)',
                        cursor: 'pointer',
                      }}
                    >
                      <div>{notif.message}</div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>
                        {notif.time}
                      </div>
                    </div>
                  ))}
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