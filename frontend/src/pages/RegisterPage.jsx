import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiShield, FiUser, FiSmartphone, FiMail } from "react-icons/fi";
import { registerUser } from "../services/api";
import Loader from "../components/Loader";
import AnimatedPage from "../components/AnimatedPage";
import MotionButton from "../components/MotionButton";
import { itemVariants } from "../lib/motion";
import { useApp } from "../hooks/useApp";

const inputClass =
  "w-full rounded-2xl border border-white/15 bg-slate-900/50 px-4 py-3 text-base text-white outline-none transition focus:border-cyan-300 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.2)]";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { actions } = useApp();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizedPhone = useMemo(() => phone.replace(/\D/g, "").slice(0, 10), [phone]);
  const trimmedName = name.trim();
  const trimmedEmail = email.trim();

  const isNameValid = trimmedName.length > 0;
  const isPhoneValid = /^\d{10}$/.test(normalizedPhone);
  const isEmailValid = trimmedEmail === "" || /^[^\s@]+@gmail\.com$/i.test(trimmedEmail);
  const canSubmit = isNameValid && isPhoneValid && isEmailValid && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isNameValid) {
      setError("Name is required.");
      return;
    }
    if (!isPhoneValid) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }
    if (!isEmailValid) {
      setError("Enter a valid Gmail address or leave email empty.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        name: trimmedName,
        phone: normalizedPhone,
        ...(trimmedEmail ? { email: trimmedEmail } : {})
      });
      actions.notify("Registration successful. Please login.", "success");
      navigate("/");
    } catch (apiError) {
      setError(apiError.message || "Unable to register. Please try again.");
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
          <h1 className="text-4xl font-bold text-white">Register</h1>
          <p className="mt-2 text-base leading-relaxed text-slate-300">Create your DeliverShield AI account</p>
        </div>

        {loading ? (
          <Loader text="Creating your account..." />
        ) : (
          <motion.form onSubmit={handleSubmit} className="space-y-5" initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.08 } } }}>
            <motion.div variants={itemVariants}>
              <label className="mb-1.5 block text-base text-slate-300">Name</label>
              <div className="relative">
                <FiUser className="pointer-events-none absolute left-3.5 top-4 text-slate-400" />
                <input className={`${inputClass} pl-10`} type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="mb-1.5 block text-base text-slate-300">Phone</label>
              <div className="relative">
                <FiSmartphone className="pointer-events-none absolute left-3.5 top-4 text-slate-400" />
                <input
                  className={`${inputClass} pl-10`}
                  inputMode="numeric"
                  autoComplete="tel"
                  value={normalizedPhone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={10}
                  placeholder="9876543210"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="mb-1.5 block text-base text-slate-300">Email (optional, Gmail only)</label>
              <div className="relative">
                <FiMail className="pointer-events-none absolute left-3.5 top-4 text-slate-400" />
                <input
                  className={`${inputClass} pl-10`}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                />
              </div>
            </motion.div>

            {error ? <p className="text-sm text-danger">{error}</p> : null}

            <motion.div variants={itemVariants} className="space-y-2">
              <MotionButton
                type="submit"
                disabled={!canSubmit}
                className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-300 to-teal-300 px-4 py-2.5 font-semibold text-slate-900 shadow-glow disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="shimmer absolute inset-0 opacity-50" />
                <span className="relative">Register</span>
              </MotionButton>

              <Link to="/" className="block text-center text-base text-cyan-200 underline underline-offset-4 hover:text-cyan-100">
                Already have an account? Login
              </Link>
            </motion.div>
          </motion.form>
        )}
      </motion.div>
    </AnimatedPage>
  );
};

export default RegisterPage;

