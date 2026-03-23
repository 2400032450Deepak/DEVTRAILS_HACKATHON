import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiCloudRain, FiThermometer, FiWind, FiShield, FiLogOut, FiUser } from "react-icons/fi";
import { getLiveEnvironmentalData } from "../services/api";
import AppHeader from "../components/AppHeader";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import Loader from "../components/Loader";
import SkeletonCards from "../components/SkeletonCards";
import AnimatedPage from "../components/AnimatedPage";
import MotionButton from "../components/MotionButton";
import CountUp from "../components/CountUp";
import { itemVariants, listVariants } from "../lib/motion";
import { useApp } from "../hooks/useApp";
import { useLocationState } from "../hooks/useLocationState";

const REFRESH_INTERVAL_MS = 60000;

const DashboardPage = () => {
  const { state, actions } = useApp();
  const { isLocationEnabled, locationCoords, cityName, locationLoading, locationError, enableLiveLocation, disableLiveLocation } = useLocationState();

  const [envData, setEnvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);

  const loadStatus = async ({ forceRefresh = false } = {}) => {
    setLoading(true);
    setError("");
    try {
      const status = await getLiveEnvironmentalData({
        forceRefresh,
        locationCoords: isLocationEnabled ? locationCoords : null,
        enableLiveLocation: false
      });

      setEnvData(status);
      actions.setStatus(status.label || "Safe");

      if (status?.error) {
        setError(status.error.includes("API key") ? "Live weather unavailable" : status.error);
      }
    } catch (apiError) {
      const message = apiError.message || "Failed to load live data";
      setError(message.includes("API key") ? "Live weather unavailable" : message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus({ forceRefresh: true });
  }, [isLocationEnabled, locationCoords?.lat, locationCoords?.lon]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadStatus({ forceRefresh: true });
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isLocationEnabled, locationCoords?.lat, locationCoords?.lon]);

  return (
    <AnimatedPage>
      <AppHeader
        title="Dashboard"
        subtitle={`Hi ${state.user?.name || "Partner"}, stay protected today.`}
        rightSlot={
          <div className="relative mt-1">
            <MotionButton onClick={() => setProfileOpen((prev) => !prev)} className="rounded-lg border border-white/15 bg-slate-900/55 px-3 py-2 text-xs text-slate-300">
              <FiUser size={14} />
            </MotionButton>

            <AnimatePresence>
              {profileOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="glass-panel absolute right-0 top-12 z-20 w-56 rounded-xl border border-white/15 p-3 shadow-cyan"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-400">My Profile</p>
                  <p className="mt-2 text-sm font-semibold text-white">{state.user?.name || "User"}</p>
                  <p className="text-xs text-slate-300">{state.user?.contact || "No phone number"}</p>
                  <MotionButton onClick={actions.logout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-slate-900/60 px-3 py-2 text-xs text-slate-200">
                    <FiLogOut size={13} />
                    Logout
                  </MotionButton>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        }
      />

      <motion.div variants={itemVariants} className="mb-3 space-y-2">
        <div className="flex items-center justify-between rounded-xl border border-cyan-300/20 bg-cyan-400/5 px-3 py-2">
          <p className="text-sm font-medium text-cyan-100">Enable Live Location</p>
          <button
            type="button"
            role="switch"
            aria-checked={isLocationEnabled}
            disabled={locationLoading}
            onClick={() => {
              if (isLocationEnabled) {
                disableLiveLocation();
              } else {
                enableLiveLocation();
              }
            }}
            className={`relative h-7 w-14 rounded-full border transition ${
              isLocationEnabled ? "border-cyan-300 bg-cyan-400/35" : "border-white/25 bg-slate-800/80"
            } ${locationLoading ? "opacity-70" : ""}`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                isLocationEnabled ? "left-7" : "left-0.5"
              }`}
            />
            <span className="sr-only">Toggle live location</span>
          </button>
        </div>

        {isLocationEnabled ? (
          <>
            <p className="text-xs font-medium tracking-wide text-cyan-200/95">📍 Using live location</p>
            <p className="text-xs font-medium tracking-wide text-slate-300">{cityName ? `📍 ${cityName}` : locationLoading ? "Detecting city..." : "Location detected"}</p>
          </>
        ) : (
          <p className="text-xs font-medium tracking-wide text-slate-300">Location disabled</p>
        )}

        {locationError ? <p className="text-xs text-danger">{locationError}</p> : null}
      </motion.div>

      <motion.div variants={itemVariants} className="glass-panel gradient-border mb-4 rounded-2xl p-4 shadow-cyan">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm text-slate-300">Current Status</p>
          <StatusBadge status={state.status} />
        </div>
        <p className="text-xl font-semibold text-white">{state.activePlan ? state.activePlan.name : "No Plan Active"}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-slate-900/45 p-3">
            <p className="text-slate-400">Weekly Coverage</p>
            <p className="font-semibold text-cyan-100">₹<CountUp value={state.weeklyCoverage || 0} /></p>
          </div>
          <div className="rounded-xl bg-slate-900/45 p-3">
            <p className="text-slate-400">Premium Paid</p>
            <p className="font-semibold text-cyan-100">₹<CountUp value={state.premiumPaid || 0} /></p>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          <Loader text="Fetching live environment data..." />
          <SkeletonCards />
        </div>
      ) : null}

      {!loading && error ? <div className="mb-4 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</div> : null}

      {!loading && envData ? (
        <motion.div variants={listVariants} initial="initial" animate="animate" className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard title="Rainfall" value={`${envData.rain} mm`} numericValue={envData.rain} suffix=" mm" icon={FiCloudRain} color="text-sky-300" />
          <StatCard title="Temperature" value={`${envData.temp}°C`} numericValue={envData.temp} suffix="°C" icon={FiThermometer} color="text-orange-300" />
          <StatCard title="AQI" value={envData.aqi} numericValue={envData.aqi} icon={FiWind} color="text-violet-300" />
        </motion.div>
      ) : null}

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        <Link to="/plans" className="rounded-xl bg-gradient-to-r from-cyan-300 to-teal-300 px-4 py-3 text-center text-sm font-semibold text-slate-900 shadow-glow transition hover:opacity-90">
          Activate Plan
        </Link>
        <Link to="/payouts" className="rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-3 text-center text-sm font-semibold text-cyan-100">
          View Payouts
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-3 grid grid-cols-2 gap-3">
        <Link to="/monitoring" className="glass-panel rounded-xl px-4 py-3 text-center text-sm text-slate-200">
          Live Monitoring
        </Link>
        <MotionButton onClick={() => loadStatus({ forceRefresh: true })} className="glass-panel rounded-xl px-4 py-3 text-center text-sm text-slate-200">
          Refresh Status
        </MotionButton>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-panel gradient-border mt-4 rounded-2xl p-4 text-sm text-slate-300">
        <div className="mb-2 flex items-center gap-2 text-cyan-300">
          <FiShield />
          <p className="font-semibold">Protection Tip</p>
        </div>
        <p>Enable your weekly plan before peak rain hours. Trigger events can auto-credit payout to your wallet.</p>
      </motion.div>
    </AnimatedPage>
  );
};

export default DashboardPage;
