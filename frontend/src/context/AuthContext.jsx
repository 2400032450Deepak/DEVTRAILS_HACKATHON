import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const detectZoneFromLocation = (lat, lon) => {
  console.log(`📍 Detecting zone for coordinates: ${lat}, ${lon}`);
  
  if (lat >= 15.5 && lat <= 17.5 && lon >= 79.5 && lon <= 81.0) return 'Zone_D_Hyderabad';
  if (lat >= 17.2 && lat <= 17.5 && lon >= 78.3 && lon <= 78.5) return 'Zone_D_Hyderabad';
  if (lat >= 12.8 && lat <= 13.2 && lon >= 77.4 && lon <= 77.8) return 'Zone_A_Bangalore';
  if (lat >= 18.8 && lat <= 19.3 && lon >= 72.7 && lon <= 73.0) return 'Zone_B_Mumbai';
  if (lat >= 28.4 && lat <= 28.8 && lon >= 77.0 && lon <= 77.3) return 'Zone_C_Delhi';
  if (lat >= 12.9 && lat <= 13.2 && lon >= 80.1 && lon <= 80.3) return 'Zone_E_Chennai';
  
  const savedZone = localStorage.getItem('userZone');
  if (savedZone) return savedZone;
  
  if (lat >= 14.0 && lat <= 18.0 && lon >= 77.0 && lon <= 82.0) return 'Zone_D_Hyderabad';
  
  return 'Zone_D_Hyderabad';
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [zone, setZone] = useState(() => {
    const savedZone = localStorage.getItem('userZone');
    return savedZone || 'Zone_D_Hyderabad';
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUserId = localStorage.getItem('workerId');
    console.log("AuthProvider - storedUserId:", storedUserId);
    if (storedUserId) {
      setUser({ id: storedUserId });
    }
    
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
  };

  const logout = () => {
    console.log("🚪 Logout called");
    localStorage.removeItem('workerId');
    localStorage.removeItem('userZone');
    setUser(null);
    setZone('Zone_D_Hyderabad');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, zone, setZone }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);