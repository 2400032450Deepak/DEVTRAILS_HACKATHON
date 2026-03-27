import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiShield, FiLock, FiSmartphone } from "react-icons/fi";
import { loginUser } from "../services/api";
import Loader from "../components/Loader";
import AnimatedPage from "../components/AnimatedPage";
import MotionButton from "../components/MotionButton";
import { itemVariants } from "../lib/motion";
import { useApp } from "../hooks/useApp";

const inputClass =
  "w-full rounded-2xl border border-white/15 bg-slate-900/50 px-4 py-3 text-base text-white outline-none transition focus:border-cyan-300 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.2)]";

const ADMIN_PHONE = "+919876543210";
const ADMIN_PASSWORD = "devtrail@422";

const AuthPage = () => {
  const { actions } = useApp();
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isPhoneValid = phone.length >= 8;
  const isPasswordValid = password.trim().length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isPhoneValid) {
      setError("Enter a valid phone number.");
      return;
    }

    if (!isPasswordValid) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = `${countryCode}${phone}`;
      console.log("🔐 Attempting login with:", formattedPhone);

      const isAdminLogin =
        formattedPhone === ADMIN_PHONE && password === ADMIN_PASSWORD;

      if (isAdminLogin) {
        const adminPayload = {
          token: "admin-session-token",
          user: {
            id: "admin-1",
            name: "DeliverShield Admin",
            contact: ADMIN_PHONE
          }
        };
        actions.login(adminPayload, { redirectTo: "/admin", isAdmin: true });
        return;
      }

      const result = await loginUser({
        phone: formattedPhone,
        password
      });

      // ✅ Check if login was successful
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // ✅ Only login if we have token and user
      if (result.token && result.user) {
        actions.login(result);
      } else {
        setError("Invalid response from server");
      }
      
    } catch (apiError) {
      console.error("Login error:", apiError);
      // ✅ Show specific error message from backend
      if (apiError.message) {
        setError(apiError.message);
      } else {
        setError("Unable to login. Please check your credentials and try again.");
      }
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
          >
            <FiShield size={26} />
          </motion.div>
          <h1 className="text-4xl font-bold text-white">DeliverShield AI</h1>
          <p className="mt-2 text-base leading-relaxed text-slate-300">Insurance safety net for quick commerce riders</p>
        </div>

        {loading ? (
          <Loader text="Signing you in..." />
        ) : (
          <motion.form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Phone Field */}
            <motion.div variants={itemVariants}>
              <label className="mb-1.5 block text-base text-slate-300">Phone</label>

              <div className="flex">
                <select
                  className="bg-slate-800 text-white px-2 rounded-l-md border border-slate-600"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                </select>

                <div className="relative w-full">
                  <FiSmartphone className="absolute left-3.5 top-4 text-slate-400" />
                  <input
                    className={`${inputClass} pl-10 rounded-l-none`}
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants}>
              <label className="mb-1.5 block text-base text-slate-300">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-4 text-slate-400" />
                <input
                  className={`${inputClass} pl-10`}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
            </motion.div>

            {/* Error Message - More Visible */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-500/20 border border-red-500/50"
              >
                <p className="text-sm text-red-400 text-center font-medium">
                  ❌ {error}
                </p>
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <MotionButton
                type="submit"
                disabled={!isPhoneValid || !isPasswordValid}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-300 to-teal-300 py-2.5 font-semibold text-slate-900"
              >
                Login
              </MotionButton>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link to="/register" className="block text-center text-cyan-200 underline">
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