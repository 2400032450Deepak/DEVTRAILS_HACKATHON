import React from "react";
import { motion } from "framer-motion";
import { itemVariants } from "../lib/motion";

const AppHeader = ({ title, subtitle, rightSlot, subtitleClassName = "text-cyan-300", titleClassName = "text-white" }) => {
  return (
    <motion.header variants={itemVariants} className="mb-6 flex items-start justify-between gap-4 md:mb-7">
      <div>
        <h1 className={`text-3xl font-bold tracking-tight md:text-4xl ${titleClassName}`}>{title}</h1>
        {subtitle ? <p className={`mt-2 text-base leading-relaxed md:text-lg ${subtitleClassName}`}>{subtitle}</p> : null}
      </div>
      {rightSlot || null}
    </motion.header>
  );
};

export default AppHeader;
