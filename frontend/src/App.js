import React, { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import BottomNav from "./components/BottomNav";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Toast from "./components/Toast";
import Loader from "./components/Loader";
import { AppProvider } from "./context/AppContext";
import { LocationProvider } from "./context/LocationContext";
import { useApp } from "./hooks/useApp";

const AuthPage = lazy(() => import("./pages/AuthPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const PlansPage = lazy(() => import("./pages/PlansPage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const PayoutPage = lazy(() => import("./pages/PayoutPage"));
const HistoryPage = lazy(() => import("./pages/HistoryPage"));
const MonitoringPage = lazy(() => import("./pages/MonitoringPage"));

const AppRoutes = () => {
  const { state, toast, actions } = useApp();
  const location = useLocation();
  const isAdminSession = localStorage.getItem("isAdmin") === "true";
  const showBottomNav = state.isLoggedIn && location.pathname !== "/" && location.pathname !== "/admin";
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, [location.pathname, state.isLoggedIn]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-sky-100 pb-20 dark:from-[#030712] dark:via-[#051a2f] dark:to-[#02040a] md:pb-6">
      <div className="pointer-events-none absolute -left-24 top-8 -z-10 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl dark:bg-cyan-400/20" />
      <div className="pointer-events-none absolute -right-20 bottom-0 -z-10 h-96 w-96 rounded-full bg-cyan-200/35 blur-3xl dark:bg-teal-300/10" />

      <div className="mx-auto w-full max-w-sm px-5 py-6 md:w-[80vw] md:max-w-[1400px] md:px-8 md:py-8">
        <Suspense fallback={<Loader text="Loading page..." />}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}>
              <Routes location={location}>
                <Route path="/" element={state.isLoggedIn ? <Navigate to={isAdminSession ? "/admin" : "/dashboard"} replace /> : <AuthPage />} />
                <Route path="/register" element={state.isLoggedIn ? <Navigate to={isAdminSession ? "/admin" : "/dashboard"} replace /> : <RegisterPage />} />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminPage />
                    </AdminRoute>
                  }
                />
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

