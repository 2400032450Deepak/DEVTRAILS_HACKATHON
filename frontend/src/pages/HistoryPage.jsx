import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getPayouts } from "../services/api";
import AppHeader from "../components/AppHeader";
import Loader from "../components/Loader";
import AnimatedPage from "../components/AnimatedPage";
import { listVariants, itemVariants } from "../lib/motion";
import { useApp } from "../hooks/useApp";

const HistoryPage = () => {
  const { state, actions } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      setError("");
      try {
        const list = await getPayouts();
        actions.setPayoutHistory(list);
      } catch (apiError) {
        setError(apiError.message || "Unable to load payout history");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  if (loading) {
    return <Loader text="Loading payout history..." />;
  }

  return (
    <AnimatedPage>
      <AppHeader title="Payout History" subtitle="Track all credited payouts" />
      {error ? <div className="mb-4 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">{error}</div> : null}

      <motion.div variants={listVariants} initial="initial" animate="animate" className="space-y-3">
        {state.payouts.length ? (
          state.payouts.map((item) => (
            <motion.div key={item.id} variants={itemVariants} whileHover={{ y: -5 }} className="glass-panel gradient-border rounded-2xl p-4">
              <div className="mb-1 flex items-center justify-between">
                <p className="font-semibold text-white">{item.reason}</p>
                <p className="font-bold text-cyan-100">₹{item.amount}</p>
              </div>
              <p className="text-xs text-slate-400">Date: {item.date}</p>
            </motion.div>
          ))
        ) : (
          <div className="glass-panel rounded-2xl p-5 text-center text-sm text-slate-300">No payout history available yet.</div>
        )}
      </motion.div>
    </AnimatedPage>
  );
};

export default HistoryPage;
