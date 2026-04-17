import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAvailablePlans, getMyPlan, activatePlan, createPayment } from '../api/config';
import { ToastContext } from '../App';
import { 
  Shield, Check, Star, TrendingUp, Award, Clock, 
  Zap, Wallet, Calendar, Bell, Info, ChevronRight,
  CloudRain, Wind, Thermometer, TrafficCone, Server,
  CreditCard, AlertTriangle, X
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MyCoverage() {
  const { user, zone } = useAuth();
  const { showToast } = useContext(ToastContext);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  
  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      try {
        const [availablePlans, currentPlan] = await Promise.all([
          getAvailablePlans(),
          getMyPlan(user?.id)
        ]);
        setPlans(availablePlans);
        setActivePlan(currentPlan);
        if (currentPlan) {
          setSelectedPlan(currentPlan);
        } else if (availablePlans[0]) {
          setSelectedPlan(availablePlans[0]);
        }
      } catch (error) {
        console.error('Plan fetch error:', error);
        if (showToast) showToast('Error loading plans', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.id) {
      fetchPlans();
    }
  }, [user]);
  
  useEffect(() => {
  if (activePlan) {
    sessionStorage.setItem('activePlan', JSON.stringify(activePlan));
  }
}, [activePlan]);

  // Handle plan selection - only if no active plan or upgrading
  const handleSelectPlan = (plan) => {
    if (activePlan && activePlan.id !== plan.id) {
      // Upgrading - show upgrade confirmation
      if (window.confirm(`Upgrade from ${activePlan.name} to ${plan.name}? Your current plan will be replaced.`)) {
        setSelectedPlan(plan);
        setShowPaymentModal(true);
      }
    } else if (!activePlan) {
      setSelectedPlan(plan);
      setShowPaymentModal(true);
    } else if (activePlan.id === plan.id) {
      if (showToast) showToast('This is your active plan', 'info');
    }
  };

  // Handle payment and activation
  const handlePaymentAndActivate = async () => {
    if (!acceptedTerms) {
      if (showToast) showToast('Please accept Terms & Conditions', 'error');
      return;
    }
    
    if (paymentMethod === 'upi' && !upiId) {
      if (showToast) showToast('Please enter UPI ID', 'error');
      return;
    }
    
    setPaymentProcessing(true);
    
    try {
      // Step 1: Create payment
      const paymentResult = await createPayment({
        userId: user.id,
        planId: selectedPlan.id,
        amount: selectedPlan.premium,
        paymentMethod: paymentMethod,
        upiId: paymentMethod === 'upi' ? upiId : null
      });
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed');
      }
      
      // Step 2: Activate plan
      await activatePlan(user.id, selectedPlan.id);
      
      // Step 3: Refresh active plan
      const updatedPlan = await getMyPlan(user.id);
      setActivePlan(updatedPlan);
      
      // Step 4: Close modal and show success
      setShowPaymentModal(false);
      if (showToast) showToast(`✅ ${selectedPlan.name} activated! Coverage active for 7 days.`, 'success');
      
      // Reset form
      setAcceptedTerms(false);
      setUpiId('');
      
    } catch (error) {
      console.error('Payment error:', error);
      if (showToast) showToast(error.message || 'Payment failed. Please try again.', 'error');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Handle upgrade/cancel plan
  const handleUpgrade = () => {
    if (!activePlan) return;
    // Find next tier plan
    const currentIndex = plans.findIndex(p => p.id === activePlan.id);
    const nextPlan = plans[currentIndex - 1];
    if (nextPlan) {
      setSelectedPlan(nextPlan);
      setShowPaymentModal(true);
    } else {
      if (showToast) showToast('You are already on the highest plan', 'info');
    }
  };

  const handleCancelPlan = async () => {
    if (window.confirm('Are you sure you want to cancel your coverage? You will not receive any further payouts.')) {
      // Call cancel API (you need to implement this)
      try {
        // await cancelPlan(user.id);
        setActivePlan(null);
        if (showToast) showToast('Plan cancelled successfully', 'success');
      } catch (error) {
        if (showToast) showToast('Failed to cancel plan', 'error');
      }
    }
  };



  const getZoneName = () => {
    const zoneNames = {
      'Zone_A_Bangalore': 'Bangalore',
      'Zone_B_Mumbai': 'Mumbai',
      'Zone_C_Delhi': 'Delhi',
      'Zone_D_Hyderabad': 'Hyderabad',
      'Zone_E_Chennai': 'Chennai'
    };
    return zoneNames[zone] || zone;
  };

  const getRiskLevelText = () => {
    const zoneRisk = {
      'Zone_B_Mumbai': 'High Risk Zone',
      'Zone_C_Delhi': 'Very High Risk Zone',
      'Zone_D_Hyderabad': 'Medium-High Risk Zone',
      'Zone_E_Chennai': 'Medium Risk Zone',
      'Zone_A_Bangalore': 'Low Risk Zone'
    };
    return zoneRisk[zone] || 'Medium Risk Zone';
  };

  const getRiskColor = () => {
    const zoneRisk = {
      'Zone_B_Mumbai': '#ef4444',
      'Zone_C_Delhi': '#dc2626',
      'Zone_D_Hyderabad': '#f59e0b',
      'Zone_E_Chennai': '#f59e0b',
      'Zone_A_Bangalore': '#10b981'
    };
    return zoneRisk[zone] || '#f59e0b';
  };

  if (loading) return <LoadingSpinner message="Loading coverage plans..." />;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header with Active Plan Status */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Shield size={28} style={{ color: 'var(--accent-primary)' }} />
              Insurance Coverage
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Weekly parametric protection • AI-powered premiums • Instant payouts
            </p>
          </div>
          
          {/* Active Plan Indicator */}
          {activePlan && (
            <div style={{
              background: 'var(--success-glow)',
              padding: '0.5rem 1rem',
              borderRadius: '2rem',
              border: '1px solid var(--success)',
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>
                ✅ Active: {activePlan.name} until {new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Zone Risk Info */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
        borderRadius: '1rem',
        padding: '1rem 1.5rem',
        marginBottom: '2rem',
        border: `1px solid ${getRiskColor()}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: `${getRiskColor()}20`,
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <TrendingUp size={24} style={{ color: getRiskColor() }} />
          </div>
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Your Zone: {getZoneName()}</div>
            <div style={{ fontSize: '0.875rem', color: getRiskColor() }}>{getRiskLevelText()}</div>
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          Premiums are adjusted based on zone risk factors
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {plans.map((plan, index) => {
          const adjustedPremium = plan.premium;
          const isActive = activePlan?.id === plan.id;
          const isSelected = selectedPlan?.id === plan.id;
          const canUpgrade = activePlan && plan.premium > activePlan.premium;
          const isDowngrade = activePlan && plan.premium < activePlan.premium;
          
          const planColors = {
            1: { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', icon: '#10b981' },
            2: { bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', icon: '#3b82f6' },
            3: { bg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', icon: '#8b5cf6' }
          };
          
          const planFeatures = {
            1: { coverage: 2000, payout: '800-1200', response: '&lt; 1 min', tier: 'Premium' },
            2: { coverage: 1200, payout: '400-700', response: '&lt; 3 min', tier: 'Standard' },
            3: { coverage: 700, payout: '200-400', response: '&lt; 5 min', tier: 'Basic' }
          };

          return (
            <div
              key={plan.id}
              style={{
                position: 'relative',
                border: `2px solid ${isActive ? '#10b981' : isSelected ? planColors[plan.id]?.icon : 'var(--border-light)'}`,
                borderRadius: '1rem',
                padding: '1.5rem',
                background: 'var(--bg-secondary)',
                cursor: isActive ? 'default' : 'pointer',
                opacity: isActive ? 0.9 : 1,
                transition: 'all 0.3s ease',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
              }}
              onClick={() => !isActive && handleSelectPlan(plan)}
            >
              {/* Tier Badge */}
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '1rem',
                background: planColors[plan.id]?.bg,
                color: 'white',
                padding: '0.25rem 1rem',
                borderRadius: '2rem',
                fontSize: '0.7rem',
                fontWeight: 'bold',
              }}>
                {planFeatures[plan.id]?.tier}
              </div>
              
              {/* Active Badge */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: '#10b981',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '2rem',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}>
                  <Check size={12} /> ACTIVE
                </div>
              )}
              
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{plan.name}</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: planColors[plan.id]?.icon }}>
                  ₹{adjustedPremium}
                  <span style={{ fontSize: '0.875rem', fontWeight: 'normal', color: 'var(--text-tertiary)' }}>/week</span>
                </div>
              </div>
              
              <div style={{
                textAlign: 'center',
                padding: '1rem',
                background: 'var(--bg-primary)',
                borderRadius: '0.75rem',
                margin: '1rem 0',
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>COVERAGE</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: planColors[plan.id]?.icon }}>
                  ₹{planFeatures[plan.id]?.coverage}
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>INCLUDES</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', fontSize: '0.8rem' }}>
                  <Check size={14} style={{ color: '#10b981' }} /> Instant payouts
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', fontSize: '0.8rem' }}>
                  <Check size={14} style={{ color: '#10b981' }} /> 5 triggers covered
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', fontSize: '0.8rem' }}>
                  <Check size={14} style={{ color: '#10b981' }} /> 24/7 support
                </div>
              </div>
              
              {!isActive && (
                <button
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: isSelected ? planColors[plan.id]?.bg : 'var(--bg-primary)',
                    color: isSelected ? 'white' : planColors[plan.id]?.icon,
                    border: `1px solid ${planColors[plan.id]?.icon}`,
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {canUpgrade ? 'UPGRADE' : isDowngrade ? 'DOWNGRADE' : 'SELECT PLAN'}
                </button>
              )}
              
              {isActive && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button
                    onClick={handleUpgrade}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: 'var(--accent-primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                    }}
                  >
                    Upgrade
                  </button>
                  <button
                    onClick={handleCancelPlan}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: 'transparent',
                      color: 'var(--danger)',
                      border: '1px solid var(--danger)',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ============================================ */}
      {/* PAYMENT MODAL */}
      {/* ============================================ */}
      {showPaymentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '1rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
          }}>
            <button
              onClick={() => setShowPaymentModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <X size={24} />
            </button>
            
            <div style={{ padding: '1.5rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <Wallet size={48} style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Complete Payment</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {selectedPlan?.name} - ₹{Math.round(selectedPlan?.premium * getRiskAdjustment(selectedPlan?.id))}/week
                </p>
              </div>
              
              {/* Payment Method Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                  Payment Method
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => setPaymentMethod('upi')}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: paymentMethod === 'upi' ? 'var(--accent-glow)' : 'var(--bg-primary)',
                      border: `1px solid ${paymentMethod === 'upi' ? 'var(--accent-primary)' : 'var(--border-light)'}`,
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                    }}
                  >
                    <CreditCard size={20} style={{ marginRight: '0.5rem' }} />
                    UPI
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: paymentMethod === 'card' ? 'var(--accent-glow)' : 'var(--bg-primary)',
                      border: `1px solid ${paymentMethod === 'card' ? 'var(--accent-primary)' : 'var(--border-light)'}`,
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                    }}
                  >
                    <CreditCard size={20} style={{ marginRight: '0.5rem' }} />
                    Card
                  </button>
                </div>
              </div>
              
              {/* UPI Input */}
              {paymentMethod === 'upi' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                    UPI ID
                  </label>
                  <input
                    type="text"
                    placeholder="username@okhdfcbank"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-light)',
                      borderRadius: '0.5rem',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              )}
              
              {/* Terms & Conditions */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                  />
                  <span style={{ fontSize: '0.875rem' }}>
                    I agree to the{' '}
                    <button
                      onClick={() => setShowTermsModal(true)}
                      style={{ color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Terms & Conditions
                    </button>
                  </span>
                </label>
              </div>
              
              {/* Payment Button */}
              <button
                onClick={handlePaymentAndActivate}
                disabled={paymentProcessing}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontWeight: 600,
                  cursor: paymentProcessing ? 'not-allowed' : 'pointer',
                  opacity: paymentProcessing ? 0.7 : 1,
                }}
              >
                {paymentProcessing ? 'Processing Payment...' : `Pay ₹${Math.round(selectedPlan?.premium * getRiskAdjustment(selectedPlan?.id))}`}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Terms Modal */}
      {showTermsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '1rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            position: 'relative',
            padding: '1.5rem',
          }}>
            <button
              onClick={() => setShowTermsModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Terms & Conditions</h2>
            
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <p><strong>1. Coverage</strong><br />This policy covers income loss due to parametric triggers: heavy rainfall (&gt;40mm/hr), extreme heat (&gt;42°C), high pollution (AQI&gt;300), traffic congestion, and platform downtime.</p>
              <p><strong>2. Exclusions</strong><br />This policy does NOT cover health issues, accidents, vehicle damage, or medical expenses.</p>
              <p><strong>3. Payouts</strong><br />Payouts are automatically triggered when conditions are met. No claim filing required.</p>
              <p><strong>4. Fraud</strong><br />Any fraudulent activity will result in immediate termination and legal action.</p>
              <p><strong>5. Cancellation</strong><br />You may cancel anytime. No refunds for remaining period.</p>
            </div>
            
            <button
              onClick={() => setShowTermsModal(false)}
              style={{
                width: '100%',
                padding: '0.75rem',
                marginTop: '1rem',
                background: 'var(--accent-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}