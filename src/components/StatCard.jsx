import React from "react";
import { motion } from "framer-motion";
import CountUp from "./CountUp";
import { floatAnimation } from "../lib/motion";

const StatCard = ({ title, value, numericValue, suffix = "", icon: Icon, color = "text-accent" }) => {
  return (
    <motion.div
      whileHover={{ y: -8, rotateX: 4, rotateY: -4, scale: 1.02 }}
      animate={floatAnimation}
      transition={{ type: "spring", stiffness: 190, damping: 18 }}
      className="gradient-border glass-panel rounded-2xl p-4 shadow-cyan"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-300/80">{title}</p>
        {Icon ? <Icon className={color} size={18} /> : null}
      </div>
      <p className="text-2xl font-bold text-white">
        {typeof numericValue === "number" ? <CountUp value={numericValue} suffix={suffix} /> : value}
      </p>
      <div className="mt-2 flex items-center gap-2 text-xs text-emerald-300/90">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.95)] animate-pulse" />
        Live
      </div>
    </motion.div>
  );
};

export default StatCard;
