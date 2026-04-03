import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAvailablePlans, getMyPlan, activatePlan } from '../api/config';
import { ToastContext } from '../App';
import { 
  Shield, Check, Star, TrendingUp, Award, Clock, 
  Zap, Wallet, Calendar, Bell, Info, ChevronRight,
  CloudRain, Wind, Thermometer, TrafficCone, Server
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

  const handleActivate = async () => {
    if (!selectedPlan) return;
    setActivating(true);
    try {
      await activatePlan(user.id, selectedPlan.id);
      setActivePlan(selectedPlan);
      if (showToast) showToast(`${selectedPlan.name} activated successfully!`, 'success');
    } catch (error) {
      if (showToast) showToast('Failed to activate plan', 'error');
    } finally {
      setActivating(false);
    }
  };

  const getRiskAdjustment = (planId) => {
    const zoneRisk = {
      'Zone_B_Mumbai': 1.2,
      'Zone_C_Delhi': 1.3,
      'Zone_D_Hyderabad': 1.1,
      'Zone_E_Chennai': 1.15,
      'Zone_A_Bangalore': 1.0
    };
    return zoneRisk[zone] || 1.0;
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
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Shield size={28} style={{ color: 'var(--accent-primary)' }} />
          Insurance Coverage
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Weekly parametric protection • AI-powered premiums • Instant payouts
        </p>
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
          const adjustedPremium = Math.round(plan.premium * getRiskAdjustment(plan.id));
          const isSelected = selectedPlan?.id === plan.id;
          const isActive = activePlan?.id === plan.id;
          const isPopular = plan.id === 2;
          
          const planColors = {
            1: { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '#8b5cf6' },
            2: { bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', icon: '#3b82f6' },
            3: { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', icon: '#10b981' }
          };
          
          const planBenefits = {
            1: ['Highest coverage amount', 'Priority payout processing', '24/7 customer support', 'Accident protection add-on', 'Family coverage option'],
            2: ['Balanced coverage', 'Standard payout speed', 'Email support', 'Weather protection', 'Traffic compensation'],
            3: ['Essential coverage', 'Basic payout protection', 'Weather triggers only', 'Email support']
          };
          
          const planFeatures = {
            1: { coverage: 1500, payout: '500-800', response: '&lt; 1 min' },
            2: { coverage: 1000, payout: '300-500', response: '&lt; 5 min' },
            3: { coverage: 750, payout: '200-350', response: '&lt; 10 min' }
          };

          return (
            <div
              key={plan.id}
              onClick={() => !isActive && setSelectedPlan(plan)}
              style={{
                cursor: isActive ? 'default' : 'pointer',
                opacity: isActive ? 0.9 : 1,
                position: 'relative',
                border: `2px solid ${isSelected ? planColors[plan.id]?.icon : 'var(--border-light)'}`,
                transition: 'all 0.3s ease',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
              }}
              className="card-modern"
            >
              {/* Popular Badge */}
              {isPopular && !isActive && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--gradient-primary)',
                  color: 'white',
                  padding: '0.25rem 1rem',
                  borderRadius: '2rem',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  zIndex: 1,
                }}>
                  <Star size={12} /> MOST POPULAR
                </div>
              )}
              
              {/* Active Badge */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'var(--success)',
                  color: 'white',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '2rem',
                  fontSize: '0.7rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  zIndex: 1,
                }}>
                  <Check size={12} /> ACTIVE
                </div>
              )}
              
              {/* Plan Header */}
              <div style={{
                background: planColors[plan.id]?.bg,
                margin: '-1.5rem -1.5rem 1rem -1.5rem',
                padding: '1.5rem',
                borderRadius: '1rem 1rem 0 0',
                color: 'white',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>WEEKLY PLAN</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{plan.name}</div>
                  </div>
                  {plan.id === 1 && <Award size={28} />}
                  {plan.id === 2 && <Zap size={28} />}
                  {plan.id === 3 && <Shield size={28} />}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                  ₹{adjustedPremium}
                  <span style={{ fontSize: '0.875rem', fontWeight: 'normal', opacity: 0.8 }}>/week</span>
                </div>
              </div>
              
              {/* Coverage Amount */}
              <div style={{
                textAlign: 'center',
                padding: '1rem',
                background: 'var(--bg-primary)',
                borderRadius: '0.75rem',
                marginBottom: '1rem',
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>COVERAGE AMOUNT</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                  ₹{planFeatures[plan.id]?.coverage?.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>per week maximum</div>
              </div>
              
              {/* Features */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>WHAT'S INCLUDED</div>
                {planBenefits[plan.id]?.slice(0, 4).map((benefit, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    fontSize: '0.8rem',
                  }}>
                    <Check size={14} style={{ color: 'var(--success)' }} />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
              
              {/* Quick Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.5rem',
                padding: '0.75rem',
                background: 'var(--bg-primary)',
                borderRadius: '0.75rem',
                marginBottom: '1rem',
                textAlign: 'center',
              }}>
                <div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>Payout</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--success)' }}>
                    ₹{planFeatures[plan.id]?.payout}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>Response</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>
                    {planFeatures[plan.id]?.response}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>Claims</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Auto</div>
                </div>
              </div>
              
              {/* Action Button */}
              {!isActive && (
                <button
                  onClick={handleActivate}
                  disabled={activating}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    background: isSelected ? planColors[plan.id]?.bg : 'var(--bg-primary)',
                    color: isSelected ? 'white' : 'var(--text-primary)',
                    border: isSelected ? 'none' : '1px solid var(--border-light)',
                    borderRadius: '0.75rem',
                    fontWeight: 600,
                    cursor: activating ? 'not-allowed' : 'pointer',
                    opacity: activating ? 0.6 : 1,
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!activating && !isSelected) {
                      e.currentTarget.style.background = 'var(--accent-glow)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!activating && !isSelected) {
                      e.currentTarget.style.background = 'var(--bg-primary)';
                    }
                  }}
                >
                  {activating && selectedPlan?.id === plan.id ? 'ACTIVATING...' : isSelected ? 'SELECT THIS PLAN' : 'SELECT PLAN'}
                </button>
              )}
              
              {isActive && (
                <div style={{
                  textAlign: 'center',
                  padding: '0.875rem',
                  background: 'var(--success-glow)',
                  borderRadius: '0.75rem',
                  color: 'var(--success)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}>
                  ✓ CURRENTLY ACTIVE
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Covered Events Section */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: '1rem',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        border: '1px solid var(--border-light)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Bell size={20} style={{ color: 'var(--accent-primary)' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Covered Parametric Events</h2>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
        }}>
          <div style={{ padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <CloudRain size={18} style={{ color: '#3b82f6' }} />
              <span style={{ fontWeight: 600 }}>Heavy Rainfall</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>&gt; 40 mm/hr</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--success)', marginTop: '0.25rem' }}>Payout: ₹300-500</div>
          </div>
          
          <div style={{ padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Thermometer size={18} style={{ color: '#ef4444' }} />
              <span style={{ fontWeight: 600 }}>Extreme Heat</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>&gt; 42°C</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--success)', marginTop: '0.25rem' }}>Payout: ₹200-400</div>
          </div>
          
          <div style={{ padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Wind size={18} style={{ color: '#8b5cf6' }} />
              <span style={{ fontWeight: 600 }}>High Pollution</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AQI &gt; 300</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--success)', marginTop: '0.25rem' }}>Payout: ₹250-450</div>
          </div>
          
          <div style={{ padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <TrafficCone size={18} style={{ color: '#f59e0b' }} />
              <span style={{ fontWeight: 600 }}>Traffic Congestion</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Severe conditions</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--success)', marginTop: '0.25rem' }}>Payout: ₹150-300</div>
          </div>
          
          <div style={{ padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Server size={18} style={{ color: '#6b7280' }} />
              <span style={{ fontWeight: 600 }}>Platform Downtime</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>&gt; 30 minutes</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--success)', marginTop: '0.25rem' }}>Payout: ₹200-350</div>
          </div>
        </div>
      </div>

      {/* FAQ / Info Section */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: '1rem',
        padding: '1.5rem',
        border: '1px solid var(--border-light)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Info size={20} style={{ color: 'var(--accent-primary)' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>How It Works</h2>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
        }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>1</div>
            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Select Your Plan</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Choose from 3 tiers based on your needs and budget</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>2</div>
            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>AI Monitors Conditions</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Real-time tracking of weather, AQI, and traffic</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-primary)', marginBottom: '0.25rem' }}>3</div>
            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>Auto Payout</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Instant disbursement when thresholds are breached</div>
          </div>
        </div>
      </div>
    </div>
  );
}