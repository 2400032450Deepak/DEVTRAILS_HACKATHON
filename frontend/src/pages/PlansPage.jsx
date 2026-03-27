// frontend/src/pages/PlansPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiShield, FiCheck, FiAlertCircle } from "react-icons/fi";
import { getPlans, activatePlan } from "../services/api";
import { useApp } from "../hooks/useApp";
import Loader from "../components/Loader";
import AnimatedPage from "../components/AnimatedPage";
import AppHeader from "../components/AppHeader";
import MotionButton from "../components/MotionButton";
import Toast from "../components/Toast";

const PlansPage = () => {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [toast, setToast] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await getPlans();
      setPlans(data);
    } catch (error) {
      showToast("Failed to load plans", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleActivatePlan = async (plan) => {
    try {
      setProcessingPayment(true);
      showToast(`Processing payment for ${plan.name}...`, "info");
      
      // Step 1: Process payment
      const paymentResponse = await fetch('http://localhost:8080/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('deliverShieldToken')}`
        },
        body: JSON.stringify({
          amount: plan.premium,
          planId: plan.id,
          gateway: 'SIMULATED',
          simulateFailure: false
        })
      });
      
      const paymentResult = await paymentResponse.json();
      
      if (!paymentResult.success) {
        showToast(paymentResult.message || "Payment failed", "error");
        return;
      }
      
      showToast("Payment successful! Activating plan...", "success");
      
      // Step 2: Activate plan with correct data structure
      const activateResult = await activatePlan({
        userId: state.user.id,  // Send userId as Long
        planId: plan.id          // Send planId as Long
      });
      
      // Check response
      if (activateResult.message && activateResult.success !== false) {
        // Update local state
        actions.activatePlan(plan);
        showToast(`🎉 ${plan.name} activated successfully!`, "success");
        
        // Navigate to dashboard after 2 seconds
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        showToast(activateResult.message || "Failed to activate plan", "error");
      }
      
    } catch (error) {
      console.error("Activation error:", error);
      showToast(error.message || "Failed to activate plan", "error");
    } finally {
      setProcessingPayment(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) return <Loader text="Loading plans..." />;

  return (
    <AnimatedPage className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-24">
      <div className="container mx-auto px-4 py-6">
        <AppHeader 
          title="Insurance Plans"
          subtitle="Choose the perfect protection for your deliveries"
          titleClassName="text-white"
          subtitleClassName="text-cyan-300"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`glass-panel rounded-2xl p-6 border ${
                selectedPlan?.id === plan.id 
                  ? 'border-cyan-500 bg-cyan-500/10' 
                  : 'border-white/10 hover:border-cyan-500/50'
              } transition-all cursor-pointer`}
              onClick={() => setSelectedPlan(plan)}
            >
              {/* Plan Name */}
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                {selectedPlan?.id === plan.id && (
                  <FiCheck className="text-cyan-400" size={20} />
                )}
              </div>
              
              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-cyan-300">₹{plan.premium}</span>
                <span className="text-slate-400">/month</span>
              </div>
              
              {/* Coverage */}
              <div className="mb-6">
                <p className="text-slate-300">Coverage up to</p>
                <p className="text-2xl font-bold text-white">₹{plan.coverage}</p>
              </div>
              
              {/* Features */}
              <ul className="space-y-2 mb-6">
                {plan.name === "Starter Shield" && (
                  <>
                    <li className="text-sm text-slate-300 flex items-center gap-2">
                      <FiCheck className="text-green-400" /> Basic weather protection
                    </li>
                    <li className="text-sm text-slate-300 flex items-center gap-2">
                      <FiCheck className="text-green-400" /> AI risk alerts
                    </li>
                  </>
                )}
                {plan.name === "Pro Shield" && (
                  <>
                    <li className="text-sm text-slate-300 flex items-center gap-2">
                      <FiCheck className="text-green-400" /> Enhanced coverage
                    </li>
                    <li className="text-sm text-slate-300 flex items-center gap-2">
                      <FiCheck className="text-green-400" /> Real-time monitoring
                    </li>
                    <li className="text-sm text-slate-300 flex items-center gap-2">
                      <FiCheck className="text-green-400" /> Priority support
                    </li>
                  </>
                )}
                {plan.name === "Max Shield" && (
                  <>
                    <li className="text-sm text-slate-300 flex items-center gap-2">
                      <FiCheck className="text-green-400" /> Maximum coverage
                    </li>
                    <li className="text-sm text-slate-300 flex items-center gap-2">
                      <FiCheck className="text-green-400" /> Instant payouts
                    </li>
                    <li className="text-sm text-slate-300 flex items-center gap-2">
                      <FiCheck className="text-green-400" /> 24/7 dedicated support
                    </li>
                    <li className="text-sm text-slate-300 flex items-center gap-2">
                      <FiCheck className="text-green-400" /> Priority claims
                    </li>
                  </>
                )}
              </ul>
              
              {/* Activate Button */}
              <MotionButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleActivatePlan(plan);
                }}
                disabled={processingPayment}
                className={`w-full py-2 rounded-lg font-semibold transition ${
                  processingPayment
                    ? 'bg-slate-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                } text-white`}
              >
                {processingPayment && selectedPlan?.id === plan.id 
                  ? 'Processing...' 
                  : 'Activate Now'}
              </MotionButton>
            </motion.div>
          ))}
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 glass-panel rounded-2xl p-4 border border-white/10"
        >
          <div className="flex items-start gap-3">
            <FiAlertCircle className="text-cyan-400 mt-1" />
            <div>
              <p className="text-sm text-slate-300">
                💡 All plans include weather-based auto payouts. 
                When environmental conditions exceed thresholds, 
                you'll automatically receive compensation.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Toast Notifications */}
      <Toast 
        message={toast?.message} 
        type={toast?.type} 
        onClose={() => setToast(null)} 
      />
    </AnimatedPage>
  );
};

export default PlansPage;