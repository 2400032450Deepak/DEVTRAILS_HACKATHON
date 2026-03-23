import React from "react";
import { motion } from "framer-motion";

const StatusBadge = ({ status = "Safe" }) => {
  const map = {
    Safe: "bg-safe/20 text-safe border-safe/40",
    Risk: "bg-warn/20 text-warn border-warn/40",
    Triggered: "bg-danger/20 text-danger border-danger/50 shadow-[0_0_22px_rgba(239,68,68,0.4)]"
  };

  const pulse = status === "Risk" || status === "Triggered";

  return (
    <motion.span
      animate={pulse ? { scale: [1, 1.05, 1], opacity: [1, 0.9, 1] } : { scale: 1, opacity: 1 }}
      transition={{ duration: status === "Triggered" ? 0.95 : 1.6, repeat: pulse ? Infinity : 0, ease: "easeInOut" }}
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${map[status] || map.Safe}`}
    >
      {status}
    </motion.span>
  );
};

export default StatusBadge;
