import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiZap } from "react-icons/fi";
import AppHeader from "../components/AppHeader";
import AnimatedPage from "../components/AnimatedPage";
import MotionButton from "../components/MotionButton";
import CountUp from "../components/CountUp";
import { itemVariants, pulseGlow } from "../lib/motion";
import { useApp } from "../hooks/useApp";

const PayoutPage = () => {
  const { state, actions } = useApp();
  const latest = state.latestPayout || state.payouts[0];
  const [flash, setFlash] = useState(false);
  const isLightMode = !document.documentElement.classList.contains("dark");

  useEffect(() => {
    if (!latest) {
      return;
    }
    setFlash(true);
    const timer = setTimeout(() => setFlash(false), 1300);
    return () => clearTimeout(timer);
  }, [latest?.id]);

  const simulateTrigger = () => {
    const payout = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      reason: "Heavy Rain Detected",
      amount: 300
    };
    actions.addPayout(payout);
    actions.setStatus("Triggered");
    actions.notify("Demo payout trigger created", "success");
  };

  return (
    <AnimatedPage>
      <div className={isLightMode ? "rounded-3xl bg-[#f8fafc] p-4 text-[#1f2937]" : ""}>
      <AppHeader
        title="Payout Status"
        subtitle="Automatic payout updates based on trigger conditions"
        titleClassName={isLightMode ? "text-black" : "text-white"}
        subtitleClassName={isLightMode ? "!text-slate-800 font-semibold" : "!text-slate-300"}
      />

      {latest ? (
        <motion.div variants={itemVariants} animate={pulseGlow} className={`gradient-border relative overflow-hidden rounded-2xl p-5 ${isLightMode ? "border border-slate-200 bg-white shadow-lg" : "glass-panel shadow-cyan"}`}>
          <AnimatePresence>
            {flash ? (
              <motion.div
                initial={{ opacity: 0.5, scale: 0.7 }}
                animate={{ opacity: 0, scale: 2.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: "easeOut" }}
                className="pointer-events-none absolute inset-0 m-auto h-56 w-56 rounded-full border border-cyan-300/40"
              />
            ) : null}
          </AnimatePresence>

          <div className="mb-3 inline-flex animate-pulseSlow items-center gap-2 rounded-full bg-danger/20 px-3 py-1 text-xs font-semibold text-danger shadow-[0_0_25px_rgba(239,68,68,0.55)]">
            <FiZap />
            Trigger Event
          </div>

          <p className={`text-sm ${isLightMode ? "text-slate-600" : "text-slate-300"}`}>Detected Event</p>
          <h2 className={`text-xl font-bold ${isLightMode ? "text-slate-900" : "text-white"}`}>{latest.reason}</h2>

          <p className={`mt-3 text-sm ${isLightMode ? "text-slate-600" : "text-slate-300"}`}>Payout Credited</p>
          <motion.p
            key={latest.id}
            initial={{ opacity: 0.3, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`text-4xl font-extrabold ${isLightMode ? "text-cyan-700" : "text-cyan-200 drop-shadow-[0_0_16px_rgba(34,211,238,0.8)]"}`}
          >
            ₹<CountUp value={latest.amount} duration={1.5} />
          </motion.p>

          <p className={`mt-2 text-xs ${isLightMode ? "text-slate-500" : "text-slate-400"}`}>Date: {latest.date}</p>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className={`rounded-2xl p-5 text-center text-sm ${isLightMode ? "border border-slate-200 bg-white text-slate-600 shadow-md" : "glass-panel text-slate-300"}`}>
          No payout has been triggered yet.
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="mt-4">
        <MotionButton onClick={simulateTrigger} className={`w-full rounded-xl px-4 py-3 text-sm font-semibold ${isLightMode ? "border border-cyan-200 bg-cyan-50 text-cyan-800 shadow-sm hover:bg-cyan-100" : "border border-cyan-300/40 bg-cyan-300/15 text-cyan-100 shadow-glow"}`}>
          Simulate Trigger
        </MotionButton>
      </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default PayoutPage;
