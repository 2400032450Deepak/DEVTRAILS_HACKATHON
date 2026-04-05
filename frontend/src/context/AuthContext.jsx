import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [zone, setZone] = useState('Zone_B_Mumbai');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only check localStorage, don't make API calls that require auth
    const storedUserId = localStorage.getItem('workerId');
    console.log("AuthProvider - storedUserId:", storedUserId);
    if (storedUserId) {
      setUser({ id: storedUserId });
      console.log("AuthProvider - user set to:", storedUserId);
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
    setUser(null);
  };

  // ✅ NEW: Google Login redirect to backend
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