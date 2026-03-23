import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import BottomNav from "./components/BottomNav";
import ProtectedRoute from "./components/ProtectedRoute";
import Toast from "./components/Toast";
import Loader from "./components/Loader";
import { AppProvider } from "./context/AppContext";
import { LocationProvider } from "./context/LocationContext";
import { useApp } from "./hooks/useApp";

const AuthPage = lazy(() => import("./pages/AuthPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const PlansPage = lazy(() => import("./pages/PlansPage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const PayoutPage = lazy(() => import("./pages/PayoutPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const MonitoringPage = lazy(() => import("./pages/MonitoringPage"));

const AppRoutes = () => {
  const { state, toast, actions } = useApp();
  const location = useLocation();
  const showBottomNav = state.isLoggedIn && location.pathname !== "/";

  return (
    <div className="relative min-h-screen overflow-hidden pb-20 md:pb-6">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-br from-[#030712] via-[#051a2f] to-[#02040a]" />
      <div className="pointer-events-none absolute -left-24 top-8 -z-10 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 -z-10 h-96 w-96 rounded-full bg-teal-300/10 blur-3xl" />

      <div className="mx-auto w-full max-w-md px-4 py-5 md:max-w-4xl md:px-6">
        <Suspense fallback={<Loader text="Loading page..." />}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
              <Routes location={location}>
                <Route path="/" element={state.isLoggedIn ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/plans"
                  element={
                    <ProtectedRoute>
                      <PlansPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payment"
                  element={
                    <ProtectedRoute>
                      <PaymentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payouts"
                  element={
                    <ProtectedRoute>
                      <PayoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <HistoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/monitoring"
                  element={
                    <ProtectedRoute>
                      <MonitoringPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </div>

      {showBottomNav ? <BottomNav /> : null}

      <Toast message={toast.message} type={toast.type} onClose={actions.clearToast} />
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <LocationProvider>
        <AppRoutes />
      </LocationProvider>
    </AppProvider>
  );
};

export default App;
