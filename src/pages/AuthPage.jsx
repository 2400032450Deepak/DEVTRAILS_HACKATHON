import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FiShield, FiSmartphone } from "react-icons/fi";
import { sendOtp, verifyOtp } from "../services/api";
import Loader from "../components/Loader";
import AnimatedPage from "../components/AnimatedPage";
import MotionButton from "../components/MotionButton";
import { itemVariants } from "../lib/motion";
import { useApp } from "../hooks/useApp";

const PHONE_LENGTH = 10;
const OTP_LENGTH = 6;
const PROFILE_STORAGE_KEY = "deliverShieldProfiles";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-slate-900/50 px-3 py-2.5 text-white outline-none transition focus:border-cyan-300 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.2)]";

const maskPhone = (phone) => `+91 ${"X".repeat(Math.max(0, PHONE_LENGTH - 2))}${phone.slice(-2)}`;

const readProfiles = () => {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const getStoredName = (phone) => {
  const profiles = readProfiles();
  return profiles?.[phone]?.name || "";
};

const saveProfileName = (phone, name) => {
  const profiles = readProfiles();
  profiles[phone] = { name };
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
};

const AuthPage = () => {
  const { actions } = useApp();
  const otpRefs = useRef([]);

  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(0);
  const [verifiedPayload, setVerifiedPayload] = useState(null);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [error, setError] = useState("");

  const otpValue = useMemo(() => otpDigits.join(""), [otpDigits]);
  const isPhoneValid = /^\d{10}$/.test(phone);
  const isOtpValid = /^\d{6}$/.test(otpValue);

  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer((prev) => prev - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const normalizePhoneInput = (value) => value.replace(/\D/g, "").slice(0, PHONE_LENGTH);

  const handleSendOtp = async () => {
    setError("");
    if (!isPhoneValid) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    setSendingOtp(true);
    try {
      await sendOtp(phone);
      setStep("otp");
      setTimer(30);
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      setTimeout(() => otpRefs.current[0]?.focus(), 0);
    } catch (apiError) {
      setError(apiError.message || "Something went wrong");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0 || resendingOtp || !isPhoneValid) return;

    setError("");
    setResendingOtp(true);
    try {
      await sendOtp(phone);
      setTimer(30);
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      setTimeout(() => otpRefs.current[0]?.focus(), 0);
    } catch (apiError) {
      setError(apiError.message || "Something went wrong");
    } finally {
      setResendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (!isOtpValid) {
      setError("Enter a valid 6-digit OTP.");
      return;
    }

    setVerifyingOtp(true);
    try {
      const result = await verifyOtp(phone, otpValue);
      if (!result?.token || !result?.user) {
        throw new Error("Something went wrong");
      }

      const storedName = getStoredName(phone);
      const isFirstTimeLogin = !storedName;

      if (isFirstTimeLogin) {
        setVerifiedPayload(result);
        setName("");
        setStep("name");
        return;
      }

      const finalUser = {
        ...result.user,
        contact: phone,
        name: result.user?.name || storedName
      };
      actions.login({ ...result, user: finalUser });
    } catch (apiError) {
      const message = (apiError.message || "Something went wrong").toLowerCase();
      setError(message.includes("invalid") ? "Invalid OTP" : "Something went wrong");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSaveName = async () => {
    setError("");
    const cleaned = name.trim();
    if (cleaned.length < 2) {
      setError("Please enter a valid name.");
      return;
    }
    if (!verifiedPayload?.token || !verifiedPayload?.user) {
      setError("Session expired. Please verify OTP again.");
      setStep("phone");
      return;
    }

    setSavingName(true);
    try {
      saveProfileName(phone, cleaned);
      const finalUser = {
        ...verifiedPayload.user,
        contact: phone,
        name: cleaned
      };
      actions.login({ ...verifiedPayload, user: finalUser });
    } finally {
      setSavingName(false);
    }
  };

  const handleOtpInput = (index, value) => {
    const next = value.replace(/\D/g, "").slice(-1);
    setOtpDigits((prev) => {
      const updated = [...prev];
      updated[index] = next;
      return updated;
    });

    if (next && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const nextDigits = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((digit, idx) => {
      nextDigits[idx] = digit;
    });

    setOtpDigits(nextDigits);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    otpRefs.current[focusIndex]?.focus();
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

        {sendingOtp || verifyingOtp || savingName ? (
          <Loader text={sendingOtp ? "Sending OTP..." : verifyingOtp ? "Verifying OTP..." : "Saving profile..."} />
        ) : step === "phone" ? (
          <motion.div className="space-y-4" initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.08 } } }}>
            <motion.div variants={itemVariants}>
              <label className="mb-1 block text-sm text-slate-300">Phone Number</label>
              <div className="relative">
                <FiSmartphone className="pointer-events-none absolute left-3 top-3.5 text-slate-400" />
                <input
                  className={`${inputClass} pl-10`}
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={PHONE_LENGTH}
                  value={phone}
                  onChange={(e) => setPhone(normalizePhoneInput(e.target.value))}
                  placeholder="9876543210"
                />
              </div>
            </motion.div>

            {error ? <p className="text-sm text-danger">{error}</p> : null}

            <motion.div variants={itemVariants}>
              <MotionButton
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp || !isPhoneValid}
                className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-300 to-teal-300 px-4 py-2.5 font-semibold text-slate-900 shadow-glow disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="shimmer absolute inset-0 opacity-50" />
                <span className="relative">Send OTP</span>
              </MotionButton>
            </motion.div>
          </motion.div>
        ) : step === "otp" ? (
          <motion.div className="space-y-4" initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.08 } } }}>
            <motion.p variants={itemVariants} className="text-sm text-slate-300">
              OTP sent to {maskPhone(phone)}
            </motion.p>

            <motion.div variants={itemVariants} className="grid grid-cols-6 gap-2" onPaste={handleOtpPaste}>
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpRefs.current[index] = el;
                  }}
                  value={digit}
                  inputMode="numeric"
                  maxLength={1}
                  autoComplete="one-time-code"
                  onKeyDown={(event) => handleOtpKeyDown(index, event)}
                  onChange={(event) => handleOtpInput(index, event.target.value)}
                  className="h-12 rounded-xl border border-white/15 bg-slate-900/50 text-center text-lg font-semibold text-white outline-none transition focus:border-cyan-300 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.2)]"
                />
              ))}
            </motion.div>

            {error ? <p className="text-sm text-danger">{error}</p> : null}

            <motion.div variants={itemVariants} className="space-y-2">
              <MotionButton
                type="button"
                onClick={handleVerifyOtp}
                disabled={verifyingOtp || !isOtpValid}
                className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-300 to-teal-300 px-4 py-2.5 font-semibold text-slate-900 shadow-glow disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="shimmer absolute inset-0 opacity-50" />
                <span className="relative">Verify OTP</span>
              </MotionButton>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setError("");
                    setOtpDigits(Array(OTP_LENGTH).fill(""));
                  }}
                  className="text-slate-300 underline underline-offset-4"
                >
                  Change number
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={timer > 0 || resendingOtp}
                  className="text-cyan-200 disabled:text-slate-500"
                >
                  {timer > 0 ? `Resend OTP in ${timer}s` : resendingOtp ? "Sending..." : "Resend OTP"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div className="space-y-4" initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.08 } } }}>
            <motion.p variants={itemVariants} className="text-sm text-slate-300">
              Welcome! Please add your name to continue.
            </motion.p>

            <motion.div variants={itemVariants}>
              <label className="mb-1 block text-sm text-slate-300">Full Name</label>
              <input
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </motion.div>

            {error ? <p className="text-sm text-danger">{error}</p> : null}

            <motion.div variants={itemVariants}>
              <MotionButton
                type="button"
                onClick={handleSaveName}
                disabled={savingName || name.trim().length < 2}
                className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-300 to-teal-300 px-4 py-2.5 font-semibold text-slate-900 shadow-glow disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span className="shimmer absolute inset-0 opacity-50" />
                <span className="relative">Continue</span>
              </MotionButton>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatedPage>
  );
};

export default AuthPage;
