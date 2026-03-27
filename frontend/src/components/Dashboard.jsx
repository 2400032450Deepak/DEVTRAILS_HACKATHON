// frontend/src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCloudRain, FiThermometer, FiWind, FiShield, FiDollarSign, FiAlertCircle } from 'react-icons/fi';
import { getLiveEnvironmentalData, getPlans, getPayouts } from '../services/api';
import { predictRiskScore } from '../services/ai';
import StatCard from './StatCard';
import StatusBadge from './StatusBadge';
import Loader from './Loader';
import AppHeader from './AppHeader';
import AnimatedPage from './AnimatedPage';
import Toast from './Toast';

const Dashboard = () => {
  const [envData, setEnvData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [environment, plansData, payoutsData] = await Promise.all([
        getLiveEnvironmentalData({ enableLiveLocation: true }),
        getPlans(),
        getPayouts()
      ]);
      
      setEnvData(environment);
      setPlans(plansData);
      setPayouts(payoutsData);
      
      // AI risk prediction
      const risk = await predictRiskScore(environment);
      setRiskData(risk);
    } catch (error) {
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) return <Loader text="Loading your safety dashboard..." />;

  return (
    <AnimatedPage className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-24">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <AppHeader 
          title="DeliverShield"
          subtitle="Protecting delivery partners in real-time"
          titleClassName="text-white"
          subtitleClassName="text-cyan-300"
        />

        {/* Environmental Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard 
            title="Temperature"
            numericValue={envData?.temp || 0}
            suffix="°C"
            icon={FiThermometer}
            color="text-orange-400"
          />
          <StatCard 
            title="Rainfall"
            numericValue={envData?.rain || 0}
            suffix="mm"
            icon={FiCloudRain}
            color="text-blue-400"
          />
          <StatCard 
            title="Air Quality"
            numericValue={envData?.aqi || 0}
            suffix="AQI"
            icon={FiWind}
            color="text-emerald-400"
          />
        </div>

        {/* Risk Level Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-2xl p-5 mb-6 border border-white/10"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-white font-semibold mb-2">Current Risk Status</h3>
              <StatusBadge status={envData?.label || 'Safe'} />
            </div>
            {riskData && (
              <div className="text-right">
                <p className="text-xs text-slate-400">AI Risk Score</p>
                <p className="text-2xl font-bold text-white">{riskData.score}/100</p>
              </div>
            )}
          </div>
          
          {/* Safety Recommendations */}
          {riskData?.recommendations && riskData.recommendations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-sm font-medium text-cyan-300 mb-2 flex items-center gap-2">
                <FiAlertCircle size={14} />
                Safety Recommendations
              </p>
              <ul className="space-y-1">
                {riskData.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-cyan-400">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>

        {/* Quick Actions Tabs */}
        <div className="flex gap-2 mb-4 border-b border-white/10">
          {['overview', 'plans', 'payouts'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab 
                  ? 'text-cyan-300 border-b-2 border-cyan-300' 
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Active Plan Card */}
            <div className="glass-panel rounded-2xl p-5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FiShield className="text-cyan-400" size={20} />
                  <h3 className="text-white font-semibold">Active Protection</h3>
                </div>
                <span className="text-xs text-cyan-300">Active</span>
              </div>
              <p className="text-2xl font-bold text-white">Pro Shield</p>
              <p className="text-sm text-slate-400 mt-1">Coverage: ₹1,200 | Premium: ₹25/month</p>
              <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">₹850 remaining coverage</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-panel rounded-2xl p-4 text-center">
                <p className="text-xs text-slate-400">Total Deliveries</p>
                <p className="text-2xl font-bold text-white">24</p>
                <p className="text-xs text-emerald-400 mt-1">+8 this week</p>
              </div>
              <div className="glass-panel rounded-2xl p-4 text-center">
                <p className="text-xs text-slate-400">Total Payouts</p>
                <p className="text-2xl font-bold text-white">₹540</p>
                <p className="text-xs text-emerald-400 mt-1">From 2 claims</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'plans' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-panel rounded-2xl p-5 cursor-pointer hover:border-cyan-500/50 transition-all"
                onClick={() => showToast(`Coming soon: ${plan.name} activation`, 'info')}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">Coverage up to ₹{plan.coverage}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-cyan-300">₹{plan.premium}</p>
                    <p className="text-xs text-slate-400">/month</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded">24/7 Support</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">Auto Claims</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'payouts' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {payouts.length > 0 ? (
              payouts.map((payout, idx) => (
                <motion.div
                  key={payout.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-panel rounded-2xl p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="text-white font-medium">{payout.reason}</p>
                    <p className="text-xs text-slate-400 mt-1">{payout.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiDollarSign className="text-emerald-400" />
                    <span className="text-xl font-bold text-emerald-400">+{payout.amount}</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="glass-panel rounded-2xl p-8 text-center">
                <p className="text-slate-400">No payouts yet</p>
                <p className="text-xs text-slate-500 mt-2">Complete deliveries to earn payouts</p>
              </div>
            )}
          </motion.div>
        )}
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

export default Dashboard;