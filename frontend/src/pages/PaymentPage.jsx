import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiCreditCard, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { activatePlan } from "../services/api";
import { initiatePayment, verifyPayment, paymentGatewayHandlers } from "../services/paymentService";
import AppHeader from "../components/AppHeader";
import Loader from "../components/Loader";
import AnimatedPage from "../components/AnimatedPage";
import MotionButton from "../components/MotionButton";
import { itemVariants } from "../lib/motion";
import { useApp } from "../hooks/useApp";

const PaymentPage = () => {
  const { state, actions } = useApp();
  const [loading, setLoading] = useState(false);
  const [paymentState, setPaymentState] = useState({ status: "IDLE", message: "" });
  const [gateway, setGateway] = useState("SIMULATED");
  const [simulateFailure, setSimulateFailure] = useState(false);
  const navigate = useNavigate();

  const selectedPlan = state.selectedPlan;

  const handlePayment = async () => {
    if (!selectedPlan) {
      actions.notify("Please select a plan first", "warning");
      navigate("/plans");
      return;
    }

    setLoading(true);
    setPaymentState({ status: "PROCESSING", message: "Payment is in progress..." });

    try {
      const paymentResponse = await initiatePayment({ amount: selectedPlan.premium, planId: selectedPlan.id, gateway, simulateFailure });

      if (!paymentResponse.success) {
        setPaymentState({ status: "FAILED", message: paymentResponse.message || "Payment failed" });
        actions.notify(paymentResponse.message || "Payment failed", "warning");
        return;
      }

      if (gateway === "RAZORPAY") {
        await paymentGatewayHandlers.launchRazorpay(paymentResponse);
      } else if (gateway === "UPI") {
        await paymentGatewayHandlers.launchUpi(paymentResponse);
      }

      const verification = await verifyPayment({ paymentId: paymentResponse.paymentId, gateway });
      if (!verification.verified) {
        throw new Error("Payment verification failed");
      }

      await activatePlan({ planId: selectedPlan.id, paymentId: paymentResponse.paymentId });
      setPaymentState({ status: "SUCCESS", message: "Payment successful and plan activated" });
      actions.activatePlan(selectedPlan);
    } catch (error) {
      setPaymentState({ status: "FAILED", message: error.message || "Payment failed" });
      actions.notify(error.message || "Payment failed", "warning");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <AppHeader title="Payment" subtitle="Production-ready payment layer with future gateway hooks" />

      <motion.div variants={itemVariants} className="glass-panel gradient-border rounded-2xl p-4">
        {selectedPlan ? (
          <>
            <p className="text-sm text-slate-400">Selected Plan</p>
            <h2 className="mt-1 text-xl font-semibold text-white">{selectedPlan.name}</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-900/50 p-3">
                <p className="text-slate-400">Premium</p>
                <p className="font-semibold text-cyan-100">₹{selectedPlan.premium}</p>
              </div>
              <div className="rounded-xl bg-slate-900/50 p-3">
                <p className="text-slate-400">Coverage</p>
                <p className="font-semibold text-cyan-100">₹{selectedPlan.coverage}</p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-300">No plan selected yet. Please select a plan to continue.</p>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="glass-panel mt-4 rounded-2xl border border-white/10 p-4">
        <p className="mb-2 text-sm text-slate-300">Payment Gateway</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[{ key: "SIMULATED", label: "Simulated" }, { key: "RAZORPAY", label: "Razorpay" }, { key: "UPI", label: "UPI" }].map((item) => (
            <MotionButton
              key={item.key}
              onClick={() => setGateway(item.key)}
              className={`rounded-lg border px-2 py-2 ${gateway === item.key ? "border-cyan-300 bg-cyan-300/20 text-cyan-100 shadow-glow" : "border-white/10 bg-slate-900/55 text-slate-300"}`}
            >
              {item.label}
            </MotionButton>
          ))}
        </div>

        <label className="mt-3 flex items-center gap-2 text-xs text-slate-300">
          <input type="checkbox" checked={simulateFailure} onChange={(e) => setSimulateFailure(e.target.checked)} className="h-4 w-4 rounded border-white/20 bg-soft" />
          Simulate payment failure (demo)
        </label>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-4">
        {loading ? (
          <Loader text="Processing payment..." />
        ) : (
          <MotionButton onClick={handlePayment} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-teal-300 px-4 py-3 font-semibold text-slate-900 shadow-glow">
            <FiCreditCard />
            Pay Now
          </MotionButton>
        )}
      </motion.div>

      <AnimatePresence>
        {paymentState.status === "SUCCESS" ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 flex items-center gap-2 rounded-xl border border-safe/30 bg-safe/10 p-3 text-sm text-safe">
            <FiCheckCircle />
            {paymentState.message}
          </motion.div>
        ) : null}
        {paymentState.status === "FAILED" ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            <FiAlertCircle />
            {paymentState.message}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </AnimatedPage>
  );
};

export default PaymentPage;
