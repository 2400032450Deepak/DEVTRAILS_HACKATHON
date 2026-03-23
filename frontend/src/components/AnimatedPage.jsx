import React from "react";
import { motion } from "framer-motion";
import { pageVariants } from "../lib/motion";

const AnimatedPage = ({ children, className = "" }) => {
  return (
    <motion.div
      className={className}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;
