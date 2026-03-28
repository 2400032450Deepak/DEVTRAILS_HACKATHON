// Update the imports at the top
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiCloudRain, FiThermometer, FiWind, FiShield, FiLogOut, FiUser, FiChevronDown, FiAlertCircle } from "react-icons/fi";
import { getLiveEnvironmentalData } from "../services/api";
import { predictRiskScore } from "../services/ai"; // Add this import
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
  const [riskData, setRiskData] = useState(null); // Add AI risk data state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [simulateGpsAnomaly, setSimulateGpsAnomaly] = useState(false);
  const [themeMode, setThemeMode] = useState("light");
  const [trafficLevel, setTrafficLevel] = useState("low");
  const [platformStatus, setPlatformStatus] = useState("active");
  const isLightMode = themeMode === "light";

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
      
      // Add AI risk prediction
      const risk = await predictRiskScore(status);
      setRiskData(risk);
      
      const trafficSamples = ["low", "moderate", "high"];
      const platformSamples = ["active", "inactive"];
      setTrafficLevel(trafficSamples[Math.floor(Math.random() * trafficSamples.length)]);
      setPlatformStatus(platformSamples[Math.floor(Math.random() * platformSamples.length)]);

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
    const isDark = themeMode === "dark";
    document.documentElement.classList.toggle("dark", isDark);
  }, [themeMode]);

  // Update sensor cards to include AI recommendations
  const sensorCards = envData
    ? [
        {
          title: "Rainfall",
          value: `${envData.rain} mm`,
          trigger: envData.rain >= 15,
          recommendation: envData.rain >= 40 ? "⚠️ Heavy rain - Consider postponing delivery" : envData.rain >= 15 ? "☔ Light rain - Carry rain gear" : null
        },
        {
          title: "Temperature",
          value: `${envData.temp}°C`,
          trigger: envData.temp >= 35,
          recommendation: envData.temp >= 40 ? "🔥 Extreme heat - Take frequent breaks" : envData.temp >= 35 ? "💧 High temperature - Stay hydrated" : null
        },
        {
          title: "AQI",
          value: `${envData.aqi}`,
          trigger: envData.aqi >= 120,
          recommendation: envData.aqi >= 250 ? "😷 Hazardous - Wear N95 mask" : envData.aqi >= 120 ? "😷 Unhealthy - Limit exposure" : null
        },
        {
          title: "Traffic",
          value: trafficLevel.charAt(0).toUpperCase() + trafficLevel.slice(1),
          trigger: trafficLevel === "high",
          recommendation: trafficLevel === "high" ? "🚗 Heavy traffic - Allow extra time" : null
        },
        {
          title: "Platform",
          value: platformStatus.charAt(0).toUpperCase() + platformStatus.slice(1),
          trigger: platformStatus === "inactive",
          recommendation: platformStatus === "inactive" ? "⚠️ Platform issues - Contact support" : null
        }
      ]
    : [];

  useEffect(() => {
    const interval = setInterval(() => {
      loadStatus({ forceRefresh: true });
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isLocationEnabled, locationCoords?.lat, locationCoords?.lon]);

  // Calculate AI risk percentage
  const aiRiskPercentage = riskData?.score || 72;

  return (
    <AnimatedPage>
      <div className={isLightMode ? "rounded-3xl bg-[#f8fafc] p-4 text-[#1f2937]" : ""}>
      <AppHeader
        title="Deliver Shield AI"
        titleClassName={isLightMode ? "text-black" : "text-white"}
        subtitle={`Hi ${state.user?.name || "Partner"}, stay protected today.`}
        subtitleClassName={isLightMode ? "!text-slate-900 font-semibold" : "!text-yellow-200 font-semibold"}

        rightSlot={
          <div className="mt-1 flex items-center gap-2">
            <div className="relative">
              <MotionButton
                onClick={() => setThemeOpen((prev) => !prev)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-semibold ${
                  isLightMode ? "border border-slate-300 bg-white text-slate-700 shadow-sm" : "border border-white/15 bg-slate-900/55 text-slate-200"
                }`}
              >
                {themeMode === "dark" ? "Dark" : "Light"}
                <FiChevronDown size={12} />
              </MotionButton>
              <AnimatePresence>
                {themeOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className={`absolute right-0 top-12 z-20 w-32 rounded-xl p-2 ${
                      isLightMode ? "border border-slate-200 bg-white shadow-lg" : "glass-panel border border-white/15 shadow-cyan"
                    }`}
                  >
                    <button
                      onClick={() => {
                        setThemeMode("dark");
                        setThemeOpen(false);
                      }}
                      className={`w-full rounded-md px-2 py-1.5 text-left text-xs ${
                        themeMode === "dark" ? "bg-cyan-300 text-slate-900" : isLightMode ? "text-slate-700 hover:bg-slate-100" : "text-slate-200 hover:bg-white/10"
                      }`}
                    >
                      Dark Mode
                    </button>
                    <button
                      onClick={() => {
                        setThemeMode("light");
                        setThemeOpen(false);
                      }}
                      className={`mt-1 w-full rounded-md px-2 py-1.5 text-left text-xs ${
                        themeMode === "light" ? "bg-cyan-300 text-slate-900" : isLightMode ? "text-slate-700 hover:bg-slate-100" : "text-slate-200 hover:bg-white/10"
                      }`}
                    >
                      Light Mode
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <div className="relative">
              <MotionButton
                onClick={() => setProfileOpen((prev) => !prev)}
                className={`rounded-lg px-3 py-2 text-xs ${
                  isLightMode ? "border border-slate-300 bg-white text-slate-600 shadow-sm" : "border border-white/15 bg-slate-900/55 text-slate-300"
                }`}
              >
                <FiUser size={14} />
              </MotionButton>

              <AnimatePresence>
                {profileOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className={`absolute right-0 top-12 z-20 w-56 rounded-xl p-3 ${
                      isLightMode ? "border border-slate-200 bg-white shadow-xl" : "glass-panel border border-white/15 shadow-cyan"
                    }`}
                  >
                    <p className={`text-xs uppercase tracking-wide ${isLightMode ? "text-slate-500" : "text-slate-400"}`}>My Profile</p>
                    <p className={`mt-2 text-sm font-semibold ${isLightMode ? "text-slate-900" : "text-white"}`}>{state.user?.name || "User"}</p>
                    <p className={`text-xs ${isLightMode ? "text-slate-600" : "text-slate-300"}`}>{state.user?.contact || "No phone number"}</p>
                    <MotionButton onClick={actions.logout} className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${isLightMode ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50" : "border border-white/15 bg-slate-900/60 text-slate-200"}`}>
                      <FiLogOut size={13} />
                      Logout
                    </MotionButton>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        }
      />

      <motion.div variants={itemVariants} className="mb-3 space-y-2">
        <div className={`flex items-center justify-between rounded-xl px-4 py-3 ${isLightMode ? "border border-slate-200 bg-white shadow-sm" : "border border-cyan-300/20 bg-cyan-400/5"}`}>
          <p className={`text-sm font-semibold ${isLightMode ? "text-slate-800" : "text-cyan-100"}`}>Enable Live Location</p>
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
              isLocationEnabled ? "border-cyan-500 bg-cyan-400/35" : isLightMode ? "border-slate-300 bg-slate-200" : "border-white/25 bg-slate-800/80"
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
            <p className={`text-sm font-medium tracking-wide ${isLightMode ? "text-slate-700" : "text-cyan-200/95"}`}>📍 Using live location</p>
            <p className={`text-sm font-medium tracking-wide ${isLightMode ? "text-slate-800" : "text-slate-300"}`}>{cityName ? `📍 ${cityName}` : locationLoading ? "Detecting city..." : "Location detected"}</p>
          </>
        ) : (
          <p className={`text-sm font-medium tracking-wide ${isLightMode ? "text-slate-700" : "text-slate-300"}`}>Location disabled</p>
        )}

        {locationError ? <p className="text-xs text-danger">{locationError}</p> : null}
      </motion.div>

      <motion.div variants={itemVariants} className={`mb-4 rounded-2xl p-5 ${isLightMode ? "border border-slate-200 bg-white shadow-lg" : "glass-panel gradient-border shadow-cyan"}`}>
        <div className="mb-2 flex items-center justify-between">
          <p className={`text-sm font-semibold ${isLightMode ? "text-slate-700" : "text-slate-300"}`}>Current Status</p>
          <StatusBadge status={state.status} />
        </div>
        <p className={`text-2xl font-bold ${isLightMode ? "text-slate-900" : "text-white"}`}>{state.activePlan ? state.activePlan.name : "No Plan Active"}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className={`rounded-xl p-4 ${isLightMode ? "border border-slate-200 bg-slate-50" : "bg-slate-900/45"}`}>
            <p className={`${isLightMode ? "text-slate-600" : "text-slate-400"}`}>Weekly Coverage</p>
            <p className={`font-bold ${isLightMode ? "text-slate-900" : "text-cyan-100"}`}>₹<CountUp value={state.weeklyCoverage || 0} /></p>
          </div>
          <div className={`rounded-xl p-4 ${isLightMode ? "border border-slate-200 bg-slate-50" : "bg-slate-900/45"}`}>
            <p className={`${isLightMode ? "text-slate-600" : "text-slate-400"}`}>Premium Paid</p>
            <p className={`font-bold ${isLightMode ? "text-slate-900" : "text-cyan-100"}`}>₹<CountUp value={state.premiumPaid || 0} /></p>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          <Loader text="Fetching live environment data..." />
          <SkeletonCards />
        </div>
      ) : null}

      {!loading && error ? <div className={`mb-4 rounded-xl p-3 text-sm font-medium ${isLightMode ? "border border-red-200 bg-red-50 text-red-700" : "border border-danger/30 bg-danger/10 text-danger"}`}>{error}</div> : null}

      {!loading && envData ? (
        <motion.div variants={itemVariants} className="mb-4">
          <h3 className={`mb-3 text-lg font-bold ${isLightMode ? "text-slate-900" : "text-white"}`}>Live Parametric Sensors</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {sensorCards.map((sensor) => {
              const isTriggered = sensor.trigger;
              return (
                <div
                  key={sensor.title}
                  className={`rounded-2xl border p-4 shadow-sm ${
                    isTriggered
                      ? isLightMode
                        ? "border-red-300 bg-red-50"
                        : "border-red-400/60 bg-red-500/10"
                      : isLightMode
                        ? "border-slate-200 bg-white shadow-md"
                        : "border-white/15 bg-slate-900/40"
                  }`}
                >
                  <p className={`text-sm font-semibold ${isLightMode ? "text-slate-600" : "text-slate-300"}`}>{sensor.title}</p>
                  <p className={`mt-1 text-2xl font-bold ${isLightMode ? "text-slate-900" : "text-white"}`}>{sensor.value}</p>
                  <p className={`mt-2 text-sm font-semibold ${isTriggered ? "text-red-600" : isLightMode ? "text-emerald-700" : "text-emerald-300"}`}>
                    {isTriggered ? "Trigger active" : "Normal"}
                  </p>
                  {sensor.recommendation && isTriggered && (
                    <p className="mt-2 text-xs flex items-center gap-1 text-yellow-600">
                      <FiAlertCircle size={12} />
                      {sensor.recommendation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      ) : null}

      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        <Link to="/plans" className={`rounded-xl px-4 py-3 text-center text-sm font-semibold transition ${isLightMode ? "bg-cyan-600 text-white shadow-md hover:bg-cyan-700 active:scale-[0.99]" : "bg-gradient-to-r from-cyan-300 to-teal-300 text-slate-900 shadow-glow hover:opacity-90"}`}>
          Activate Plan
        </Link>
        <Link to="/payouts" className={`rounded-xl px-4 py-3 text-center text-sm font-semibold ${isLightMode ? "border border-slate-300 bg-white text-slate-800 shadow-sm hover:bg-slate-50" : "border border-cyan-300/30 bg-cyan-400/10 text-cyan-100"}`}>
          View Payouts
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-3 grid grid-cols-2 gap-3">
        <Link to="/monitoring" className={`rounded-xl px-4 py-3 text-center text-sm font-medium ${isLightMode ? "border border-slate-300 bg-white text-slate-800 shadow-sm hover:bg-slate-50" : "glass-panel text-slate-200"}`}>
          Live Monitoring
        </Link>
        <MotionButton onClick={() => loadStatus({ forceRefresh: true })} className={`rounded-xl px-4 py-3 text-center text-sm font-medium ${isLightMode ? "border border-slate-300 bg-white text-slate-800 shadow-sm hover:bg-slate-50" : "glass-panel text-slate-200"}`}>
          Refresh Status
        </MotionButton>
      </motion.div>

      {/* Updated AI Risk Intelligence Section */}
      <motion.div variants={itemVariants} className={`mt-4 rounded-2xl p-5 ${isLightMode ? "border border-slate-200 bg-white shadow-lg" : "border border-white/10 bg-gradient-to-r from-[#0f1b32] via-[#101d36] to-[#1a283c] shadow-cyan"}`}>
        <p className={`mb-4 text-3xl font-bold ${isLightMode ? "text-slate-900" : "text-white"}`}>AI Risk Intelligence</p>
        
        {/* AI Risk Score and Recommendations */}
        <div className="flex items-center justify-between gap-6 mb-4">
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(#60a5fa 0deg, #60a5fa ${aiRiskPercentage * 3.6}deg, rgba(96,165,250,0.15) ${aiRiskPercentage * 3.6}deg)`
              }}
            />
            <div className={`absolute inset-[9px] rounded-full ${isLightMode ? "bg-white" : "bg-[#10213c]"}`} />
            <span className={`relative text-4xl font-extrabold ${isLightMode ? "text-slate-900" : "text-white"}`}>{aiRiskPercentage}%</span>
          </div>

          <div className="flex-1">
            <p className={`text-lg font-semibold ${isLightMode ? "text-slate-800" : "text-slate-300"}`}>
              AI Forecast: {riskData?.level || "Medium"} risk probability
            </p>
            <p className={`text-sm mt-1 ${isLightMode ? "text-slate-600" : "text-slate-400"}`}>
              Based on weather, AQI, and traffic conditions
            </p>
          </div>
        </div>

        {/* AI Recommendations */}
        {riskData?.recommendations && riskData.recommendations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className={`text-sm font-semibold mb-2 flex items-center gap-2 ${isLightMode ? "text-slate-700" : "text-cyan-300"}`}>
              <FiAlertCircle size={14} />
              AI Safety Recommendations
            </p>
            <ul className="space-y-1">
              {riskData.recommendations.slice(0, 3).map((rec, idx) => (
                <li key={idx} className={`text-xs flex items-start gap-2 ${isLightMode ? "text-slate-600" : "text-slate-300"}`}>
                  <span className="text-cyan-400">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        <label className={`mt-4 flex items-center gap-2 text-sm font-medium ${isLightMode ? "text-slate-800" : "text-white"}`}>
          <input
            type="checkbox"
            checked={simulateGpsAnomaly}
            onChange={(e) => setSimulateGpsAnomaly(e.target.checked)}
            className={`h-4 w-4 rounded ${isLightMode ? "border-slate-400 bg-white" : "border-white/30 bg-slate-900/70"}`}
          />
          Simulate GPS anomaly
        </label>
      </motion.div>

      <motion.div variants={itemVariants} className={`mt-3 rounded-2xl border p-4 text-sm ${isLightMode ? "border-slate-300 bg-white text-slate-700" : "border-white/10 bg-[#0f1b32]/90 text-slate-300"}`}>
        <div className="mb-2 flex items-center gap-2 text-cyan-300">
          <FiShield />
          <p className="font-semibold">Protection Tip</p>
        </div>
        <p>Keep location enabled during high-risk windows and refresh status before long delivery routes to reduce payout delays.</p>
      </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default DashboardPage;