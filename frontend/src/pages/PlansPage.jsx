import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiShield } from "react-icons/fi";
import { getPlans } from "../services/api";
import AppHeader from "../components/AppHeader";
import Loader from "../components/Loader";
import AnimatedPage from "../components/AnimatedPage";
import MotionButton from "../components/MotionButton";
import { itemVariants, listVariants } from "../lib/motion";
import { useApp } from "../hooks/useApp";

const PlansPage = () => {
  const { state, actions } = useApp();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const isLightMode = !document.documentElement.classList.contains("dark");

  useEffect(() => {
    const loadPlans = async () => {
      setError("");
      try {
        const list = await getPlans();
        setPlans(list);
      } catch (apiError) {
        setError(apiError.message || "Unable to load plans");
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  if (loading) {
    return <Loader text="Loading plans..." />;
  }

  return (
    <AnimatedPage>
      <div className={isLightMode ? "rounded-3xl bg-[#f8fafc] p-4 text-[#1f2937]" : ""}>
      <AppHeader
        title="Select Plan"
        subtitle="Choose your weekly protection plan"
        titleClassName={isLightMode ? "text-black" : "text-white"}
        subtitleClassName={isLightMode ? "!text-slate-800 font-semibold" : "!text-slate-300"}
      />

      {error ? <div className={`mb-4 rounded-xl p-3 text-sm ${isLightMode ? "border border-red-200 bg-red-50 text-red-700" : "border border-danger/30 bg-danger/10 text-danger"}`}>{error}</div> : null}

      <motion.div variants={listVariants} initial="initial" animate="animate" className="space-y-3">
        {plans.map((plan) => {
          const selected = state.selectedPlan?.id === plan.id;
          return (
            <motion.div
              key={plan.id}
              variants={itemVariants}
              whileHover={{ y: -7, rotateX: 2.4, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
              className={`relative overflow-hidden rounded-2xl border p-4 ${
                selected
                  ? isLightMode
                    ? "border-cyan-300 bg-cyan-50 shadow-md"
                    : "border-cyan-300/70 bg-cyan-300/10 shadow-glow"
                  : isLightMode
                    ? "border-slate-200 bg-white shadow-md"
                    : "glass-panel border-white/10"
              }`}
            >
              {selected ? <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-300/12 via-transparent to-teal-300/10" /> : null}

              <div className="relative mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiShield className={isLightMode ? "text-cyan-600" : "text-cyan-300"} />
                  <p className={`font-semibold ${isLightMode ? "text-slate-900" : "text-white"}`}>{plan.name}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs ${isLightMode ? "bg-slate-100 text-slate-700" : "bg-slate-900/55 text-slate-300"}`}>Weekly</span>
              </div>

              <p className={`relative text-sm ${isLightMode ? "text-slate-700" : "text-slate-300"}`}>Premium: ₹{plan.premium}</p>
              <p className={`relative mb-3 text-sm ${isLightMode ? "text-slate-700" : "text-slate-300"}`}>Coverage: ₹{plan.coverage}</p>

              <MotionButton
                onClick={() => {
                  actions.setSelectedPlan(plan);
                  actions.notify("Plan selected. Proceed to payment.", "success");
                  navigate("/payment");
                }}
                className={`relative w-full rounded-xl px-4 py-2.5 text-sm font-semibold ${selected ? "bg-cyan-300 text-slate-900" : "bg-gradient-to-r from-cyan-300 to-teal-300 text-slate-900"}`}
              >
                Select Plan
              </MotionButton>
            </motion.div>
          );
        })}
      </motion.div>
      </div>
    </AnimatedPage>
  );
};

export default PlansPage;
