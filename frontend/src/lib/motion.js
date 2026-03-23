import { cubicBezier } from "framer-motion";

export const EASE_STANDARD = cubicBezier(0.22, 1, 0.36, 1);

export const pageVariants = {
  initial: { opacity: 0, y: 18, scale: 0.985 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: EASE_STANDARD, when: "beforeChildren", staggerChildren: 0.06 }
  },
  exit: { opacity: 0, y: -14, scale: 0.985, transition: { duration: 0.34, ease: "easeInOut" } }
};

export const itemVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.42, ease: EASE_STANDARD } }
};

export const listVariants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } }
};

export const floatAnimation = {
  y: [0, -6, 0],
  transition: { duration: 5.4, repeat: Infinity, ease: "easeInOut" }
};

export const pulseGlow = {
  boxShadow: [
    "0 0 0 rgba(34, 211, 238, 0.14)",
    "0 0 34px rgba(34, 211, 238, 0.38)",
    "0 0 0 rgba(34, 211, 238, 0.12)"
  ],
  transition: { duration: 2.1, repeat: Infinity, ease: "easeInOut" }
};

export const shimmerTransition = { duration: 1.5, repeat: Infinity, ease: "linear" };
