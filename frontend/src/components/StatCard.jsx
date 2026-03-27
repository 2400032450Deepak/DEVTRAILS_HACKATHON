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
      className="gradient-border glass-panel rounded-3xl p-5 shadow-cyan md:p-6"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300/85">{title}</p>
        {Icon ? <Icon className={color} size={20} /> : null}
      </div>
      <p className="text-3xl font-bold text-white">
        {typeof numericValue === "number" ? <CountUp value={numericValue} suffix={suffix} /> : value}
      </p>
      <div className="mt-3 flex items-center gap-2 text-sm text-emerald-300/90">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.95)] animate-pulse" />
        Live
      </div>
    </motion.div>
  );
};

export default StatCard;
