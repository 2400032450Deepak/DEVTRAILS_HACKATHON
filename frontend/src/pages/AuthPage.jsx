import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiShield, FiMail, FiLock } from "react-icons/fi";
import { loginWithEmailPassword } from "../services/api";
import Loader from "../components/Loader";
import AnimatedPage from "../components/AnimatedPage";
import MotionButton from "../components/MotionButton";
import { itemVariants } from "../lib/motion";
import { useApp } from "../hooks/useApp";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-slate-900/50 px-3 py-2.5 text-white outline-none transition focus:border-cyan-300 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.2)]";

const AuthPage = () => {
  const { actions } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.trim().length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isEmailValid) {
      setError("Enter a valid email address.");
      return;
    }

    if (!isPasswordValid) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithEmailPassword({ email: email.trim(), password });
      actions.login(result);
    } catch (apiError) {
      setError(apiError.message || "Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage className="relative mx-auto mt-8 w-full max-w-md">
      <motion.div
        animate={{ rotate: [0, 3, 0, -3, 0], y: [0, -6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-8 left-1/2 h-16 w-16 -translate-x-1/2 rounded-2xl bg-cyan-400/20 blur-xl"
      />

      <motion.div variants={itemVariants} className="glass-panel gradient-border rounded-3xl p-6 shadow-deep">
        <div className="mb-7 text-center">
          <motion.div
            className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/20 text-cyan-200 shadow-glow"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <FiShield size={26} />
          </motion.div>
          <h1 className="text-3xl font-bold text-white">DeliverShield AI</h1>
          <p className="mt-2 text-sm text-slate-300">Insurance safety net for quick commerce riders</p>
        </div>

        {loading ? (
          <Loader text="Signing you in..." />
        ) : (
          <motion.form onSubmit={handleSubmit} className="space-y-4" initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.08 } } }}>
            <motion.div variants={itemVariants}>
              <label className="mb-1 block text-sm text-slate-300">Email</label>
              <div className="relative">
                <FiMail className="pointer-events-none absolute left-3 top-3.5 text-slate-400" />
                <input
                  className={`${inputClass} pl-10`}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="mb-1 block text-sm text-slate-300">Password</label>
              <div className="relative">
                <FiLock className="pointer-events-none absolute left-3 top-3.5 text-slate-400" />
                <input
                  className={`${inputClass} pl-10`}
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
            </motion.div>

            {error ? <p className="text-sm text-danger">{error}</p> : null}

            <motion.div variants={itemVariants}>
              <MotionButton
                type="submit"
                disabled={!isEmailValid || !isPasswordValid || loading}
                className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-300 to-teal-300 px-4 py-2.5 font-semibold text-slate-900 shadow-glow disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="shimmer absolute inset-0 opacity-50" />
                <span className="relative">Login</span>
              </MotionButton>
            </motion.div>
          </motion.form>
        )}
      </motion.div>
    </AnimatedPage>
  );
};

export default AuthPage;
