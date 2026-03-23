import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiAlertTriangle } from "react-icons/fi";

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = setTimeout(() => {
      onClose();
    }, 2200);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  const isSuccess = type === "success";

  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ duration: 0.24, ease: "easeInOut" }}
          className="glass-panel fixed bottom-20 left-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 rounded-xl border border-white/15 p-3 text-sm text-white shadow-cyan"
        >
          <div className="flex items-center gap-2">
            {isSuccess ? <FiCheckCircle className="text-safe" size={18} /> : <FiAlertTriangle className="text-warn" size={18} />}
            <span>{message}</span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default Toast;
