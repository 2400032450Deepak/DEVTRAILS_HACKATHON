import React from "react";
import { motion } from "framer-motion";

const MotionButton = ({ children, className = "", ...props }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default MotionButton;
