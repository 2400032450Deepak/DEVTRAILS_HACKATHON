import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiCloudRain, FiThermometer, FiWind } from "react-icons/fi";
import { getLiveEnvironmentalData } from "../services/api";
import AppHeader from "../components/AppHeader";
import Loader from "../components/Loader";
import StatCard from "../components/StatCard";
import AnimatedPage from "../components/AnimatedPage";
import MotionButton from "../components/MotionButton";
import SkeletonCards from "../components/SkeletonCards";
import { listVariants } from "../lib/motion";
import { useApp } from "../hooks/useApp";
import { useLocationState } from "../hooks/useLocationState";

const REFRESH_INTERVAL_MS = 60000;

const MonitoringPage = () => {
  const { actions } = useApp();
  const { isLocationEnabled, locationCoords, cityName } = useLocationState();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async ({ forceRefresh = false } = {}) => {
    setLoading(true);
    setError("");
    try {
      const status = await getLiveEnvironmentalData({
        forceRefresh,
        locationCoords: isLocationEnabled ? locationCoords : null,
        enableLiveLocation: false
      });
      setData(status);
      actions.setStatus(status.label || "Safe");
      if (status?.error) {
        setError(status.error.includes("API key") ? "Live weather unavailable" : status.error);
      }
    } catch (apiError) {
      const message = apiError.message || "Unable to fetch monitoring data";
      setError(message.includes("API key") ? "Live weather unavailable" : message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData({ forceRefresh: true });
  }, [isLocationEnabled, locationCoords?.lat, locationCoords?.lon]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData({ forceRefresh: true });
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isLocationEnabled, locationCoords?.lat, locationCoords?.lon]);

  return (
    <AnimatedPage>
      <AppHeader title="Live Monitoring" subtitle="Weather and air quality snapshot" />

      <div className="mb-3 space-y-1">
        {isLocationEnabled ? (
          <>
            <p className="text-xs font-medium tracking-wide text-cyan-200/95">📍 Using live location</p>
            <p className="text-xs font-medium tracking-wide text-slate-300">{cityName ? `📍 ${cityName}` : "Location detected"}</p>
          </>
        ) : (
          <p className="text-xs font-medium tracking-wide text-slate-300">Location disabled</p>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          <Loader text="Syncing live metrics..." />
          <SkeletonCards />
        </div>
      ) : null}
      {!loading && error ? <div className="mb-4 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</div> : null}

      {!loading && !error && data ? (
        <motion.div variants={listVariants} initial="initial" animate="animate" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard title="Rainfall" value={`${data.rain} mm`} numericValue={data.rain} suffix=" mm" icon={FiCloudRain} color="text-sky-300" />
          <StatCard title="Temperature" value={`${data.temp}°C`} numericValue={data.temp} suffix="°C" icon={FiThermometer} color="text-orange-300" />
          <StatCard title="AQI" value={data.aqi} numericValue={data.aqi} icon={FiWind} color="text-violet-300" />
        </motion.div>
      ) : null}

      <MotionButton onClick={() => fetchData({ forceRefresh: true })} className="glass-panel mt-4 w-full rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white">
        Refresh Live Data
      </MotionButton>
    </AnimatedPage>
  );
};

export default MonitoringPage;
