import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiShield, FiMail, FiLock } from "react-icons/fi";
import { loginWithEmailPassword } from "../services/api";
import Loader from "../components/Loader";
import AnimatedPage from "../components/AnimatedPage";
import MotionButton from "../components/MotionButton";
import { itemVariants } from "../lib/motion";
import { useApp } from "../hooks/useApp";

const inputClass =
  "w-full rounded-2xl border border-white/15 bg-slate-900/50 px-4 py-3 text-base text-white outline-none transition focus:border-cyan-300 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.2)]";
const ADMIN_EMAIL = "admin@devtrails.com";
const ADMIN_PASSWORD = "devtrail@422";

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
      const normalizedEmail = email.trim().toLowerCase();
      const isAdminLogin = normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD;

      if (isAdminLogin) {
        const adminPayload = {
          token: "admin-session-token",
          user: {
            id: "admin-1",
            name: "DeliverShield Admin",
            contact: ADMIN_EMAIL
          }
        };
        actions.login(adminPayload, { redirectTo: "/admin", isAdmin: true });
        return;
      }

      const result = await loginWithEmailPassword({ email: email.trim(), password });
      actions.login(result);
    } catch (apiError) {
      setError(apiError.message || "Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage className="relative mx-auto mt-10 w-full max-w-xl">
      <motion.div
        animate={{ rotate: [0, 3, 0, -3, 0], y: [0, -6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -top-8 left-1/2 h-16 w-16 -translate-x-1/2 rounded-2xl bg-cyan-400/20 blur-xl"
      />

      <motion.div variants={itemVariants} className="glass-panel gradient-border rounded-3xl p-7 shadow-deep md:p-8">
        <div className="mb-8 text-center">
          <motion.div
            className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/20 text-cyan-200 shadow-glow"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <FiShield size={26} />
          </motion.div>
          <h1 className="text-4xl font-bold text-white">DeliverShield AI</h1>
          <p className="mt-2 text-base leading-relaxed text-slate-300">Insurance safety net for quick commerce riders</p>
        </div>

        {loading ? (
          <Loader text="Signing you in..." />
        ) : (
          <motion.form onSubmit={handleSubmit} className="space-y-5" initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.08 } } }}>
            <motion.div variants={itemVariants}>
              <label className="mb-1.5 block text-base text-slate-300">Email</label>
              <div className="relative">
                <FiMail className="pointer-events-none absolute left-3.5 top-4 text-slate-400" />
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
              <label className="mb-1.5 block text-base text-slate-300">Password</label>
              <div className="relative">
                <FiLock className="pointer-events-none absolute left-3.5 top-4 text-slate-400" />
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

            <motion.div variants={itemVariants}>
              <Link to="/register" className="block text-center text-base text-cyan-200 underline underline-offset-4 hover:text-cyan-100">
                New user? Register
              </Link>
            </motion.div>
          </motion.form>
        )}
      </motion.div>
    </AnimatedPage>
  );
};

export default AuthPage;

