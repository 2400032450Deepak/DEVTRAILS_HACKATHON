import React from "react";
import { motion } from "framer-motion";
import { itemVariants } from "../lib/motion";

const AppHeader = ({ title, subtitle, rightSlot }) => {
  return (
    <motion.header variants={itemVariants} className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-300/90 md:text-base">{subtitle}</p> : null}
      </div>
      {rightSlot || null}
    </motion.header>
  );
};

export default AppHeader;
