import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// ✅ Zone detection based on coordinates
const detectZoneFromLocation = (lat, lon) => {
  console.log(`📍 Detecting zone for coordinates: ${lat}, ${lon}`);
  
  // Guntur / Andhra Pradesh region (16.3°N, 80.45°E)
  if (lat >= 15.5 && lat <= 17.5 && lon >= 79.5 && lon <= 81.0) return 'Zone_D_Hyderabad';
  
  // Hyderabad region
  if (lat >= 17.2 && lat <= 17.5 && lon >= 78.3 && lon <= 78.5) return 'Zone_D_Hyderabad';
  
  // Bangalore region
  if (lat >= 12.8 && lat <= 13.2 && lon >= 77.4 && lon <= 77.8) return 'Zone_A_Bangalore';
  
  // Mumbai region
  if (lat >= 18.8 && lat <= 19.3 && lon >= 72.7 && lon <= 73.0) return 'Zone_B_Mumbai';
  
  // Delhi region
  if (lat >= 28.4 && lat <= 28.8 && lon >= 77.0 && lon <= 77.3) return 'Zone_C_Delhi';
  
  // Chennai region
  if (lat >= 12.9 && lat <= 13.2 && lon >= 80.1 && lon <= 80.3) return 'Zone_E_Chennai';
  
  // Default - return saved zone or Hyderabad for AP region
  const savedZone = localStorage.getItem('userZone');
  if (savedZone) return savedZone;
  
  // For Andhra Pradesh region (Guntur, Vijayawada, etc.)
  if (lat >= 14.0 && lat <= 18.0 && lon >= 77.0 && lon <= 82.0) return 'Zone_D_Hyderabad';
  
  return 'Zone_D_Hyderabad'; // Default to Hyderabad for AP region
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [zone, setZone] = useState(() => {
    // Try to get saved zone from localStorage first
    const savedZone = localStorage.getItem('userZone');
    return savedZone || 'Zone_D_Hyderabad'; // Default to Hyderabad
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem('workerId');
    console.log("AuthProvider - storedUserId:", storedUserId);
    if (storedUserId) {
      setUser({ id: storedUserId });
      console.log("AuthProvider - user set to:", storedUserId);
    }
    
    // ✅ Detect zone from geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const detectedZone = detectZoneFromLocation(latitude, longitude);
          console.log(`📍 Location detected: ${latitude}, ${longitude} -> Zone: ${detectedZone}`);
          setZone(detectedZone);
          localStorage.setItem('userZone', detectedZone);
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          // Use saved zone or default
          const savedZone = localStorage.getItem('userZone');
          if (savedZone) {
            setZone(savedZone);
          }
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      console.warn('Geolocation not supported');
      const savedZone = localStorage.getItem('userZone');
      if (savedZone) {
        setZone(savedZone);
      }
    }
    
    setLoading(false);
  }, []);

  const login = (userId) => {
    const userIdStr = String(userId);
    console.log("🔐 Login called with:", userIdStr);
    localStorage.setItem('workerId', userIdStr);
    setUser({ id: userIdStr });
    console.log("✅ User logged in, state updated");
  };

  const logout = () => {
    console.log("🚪 Logout called");
    localStorage.removeItem('workerId');
    localStorage.removeItem('userZone');
    setUser(null);
    setZone('Zone_D_Hyderabad');
  };

  // Google Login redirect to backend
  const loginWithGoogle = () => {
    console.log("🔐 Google Login initiated - redirecting to backend");
    window.location.href = 'https://delivershield-backend.onrender.com/oauth2/authorization/google';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loginWithGoogle, loading, zone, setZone }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);