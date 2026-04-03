import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { Toast } from './components/Toast';

// Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import LiveMonitor from './pages/LiveMonitor';
import MyCoverage from './pages/MyCoverage';
import PayoutHistory from './pages/PayoutHistory';
import RiskProfile from './pages/RiskProfile';
import OAuthCallback from './pages/OAuthCallback';

export const ToastContext = React.createContext();

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function DashboardLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: mobileMenuOpen ? 0 : '-280px',
        transition: 'left 0.3s ease',
        zIndex: 100,
      }}>
        <Sidebar />
      </div>
      
      <div style={{ flex: 1, marginLeft: '280px' }}>
        <Topbar onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <div style={{ padding: '2rem' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/live" element={<LiveMonitor />} />
            <Route path="/coverage" element={<MyCoverage />} />
            <Route path="/history" element={<PayoutHistory />} />
            <Route path="/risk" element={<RiskProfile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: -280px;
          }
          .main-content {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

function AppContent() {
  const [toast, setToast] = useState(null);
  // Remove any API calls here

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </ToastContext.Provider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}