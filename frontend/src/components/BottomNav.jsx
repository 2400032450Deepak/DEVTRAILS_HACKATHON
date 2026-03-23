import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHome, FiShield, FiCreditCard, FiClock, FiActivity } from "react-icons/fi";

const links = [
  { to: "/dashboard", icon: FiHome, label: "Home" },
  { to: "/plans", icon: FiShield, label: "Plans" },
  { to: "/payment", icon: FiCreditCard, label: "Pay" },
  { to: "/payouts", icon: FiActivity, label: "Payout" },
  { to: "/history", icon: FiClock, label: "History" }
];

const BottomNav = () => {
  return (
    <nav className="glass-panel fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 px-3 py-2 md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-1 rounded-lg p-2 text-[11px] transition ${
                isActive ? "text-cyan-200" : "text-slate-400"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }} className={`rounded-lg p-1 ${isActive ? "bg-cyan-400/15 shadow-glow" : ""}`}>
                  <item.icon size={16} />
                </motion.div>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
