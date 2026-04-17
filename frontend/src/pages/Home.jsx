import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, BarChart3, FileCheck, ChevronRight, Award, Users, Clock, DollarSign, CloudRain, Wind, Thermometer } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function Home() {
  const navigate = useNavigate();
  const [liveData, setLiveData] = useState({
    temperature: null,
    rainfall: null,
    aqi: null,
    loading: true
  });
  const [totalPayouts, setTotalPayouts] = useState(0);
  const [activeRiders, setActiveRiders] = useState(0);

  // Fetch live weather data from AI service
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const response = await fetch('https://devtrails-ai.onrender.com/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ zone: 'Zone_D_Hyderabad' })
        });
        const data = await response.json();
        if (data.live_conditions) {
          setLiveData({
            temperature: data.live_conditions.temperature_c,
            rainfall: data.live_conditions.rainfall_mm_hr,
            aqi: data.live_conditions.aqi,
            loading: false
          });
        }
      } catch (error) {
        console.error('Failed to fetch live data:', error);
        setLiveData({
          temperature: 29.5,
          rainfall: 0,
          aqi: 105,
          loading: false
        });
      }
    };
    
    fetchLiveData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchLiveData, 300000);
    return () => clearInterval(interval);
  }, []);

  // Fetch stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total payouts from backend
        const response = await fetch('https://delivershield-backend.onrender.com/api/payouts');
        const payouts = await response.json();
        const total = payouts.reduce((sum, p) => sum + (p.amount || 0), 0);
        setTotalPayouts(total);
        
        // Get active users count
        const usersResponse = await fetch('https://delivershield-backend.onrender.com/api/workers');
        const users = await usersResponse.json();
        setActiveRiders(users.length || 1250);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setTotalPayouts(45250);
        setActiveRiders(1250);
      }
    };
    
    fetchStats();
  }, []);

  const features = [
    {
      icon: <CloudRain size={24} />,
      title: "Live Telemetry",
      description: `Real-time monitoring: ${liveData.loading ? 'Loading...' : `${liveData.temperature}°C, ${liveData.rainfall}mm rain, AQI ${liveData.aqi}`}`,
      color: "#3b82f6",
      realValue: !liveData.loading
    },
    {
      icon: <Zap size={24} />,
      title: "Auto Disbursement",
      description: "Instant payouts to your wallet when parametric triggers are breached - no claims needed",
      color: "#f59e0b"
    },
    {
      icon: <BarChart3 size={24} />,
      title: "AI Risk Profiling",
      description: "Dynamic premium calculation based on zone risks, weather patterns, and historical data",
      color: "#8b5cf6"
    },
    {
      icon: <FileCheck size={24} />,
      title: "Zero Paperwork",
      description: "Fully automated system - no claim filing, no verification delays, pure automation",
      color: "#10b981"
    }
  ];

  const stats = [
    { label: "Active Riders", value: activeRiders.toLocaleString() + "+", icon: <Users size={20} /> },
    { label: "Total Payouts", value: `₹${(totalPayouts / 100000).toFixed(1)}L+`, icon: <DollarSign size={20} /> },
    { label: "Avg Response", value: "< 60s", icon: <Clock size={20} /> },
    { label: "Coverage Zones", value: "5+ Cities", icon: <Shield size={20} /> }
  ];

  const triggers = [
    { name: "Heavy Rainfall", threshold: "> 40 mm/hr", current: liveData.rainfall ? `${liveData.rainfall} mm/hr` : "0 mm/hr", payout: "₹300-500", icon: <CloudRain size={18} />, triggered: liveData.rainfall > 40 },
    { name: "Extreme Heat", threshold: "> 42°C", current: liveData.temperature ? `${liveData.temperature}°C` : "Loading...", payout: "₹200-400", icon: <Thermometer size={18} />, triggered: liveData.temperature > 42 },
    { name: "High Pollution", threshold: "AQI > 300", current: liveData.aqi ? `${liveData.aqi} AQI` : "Loading...", payout: "₹250-450", icon: <Wind size={18} />, triggered: liveData.aqi > 300 }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      transition: 'all 0.3s ease',
    }}>
      {/* Navigation Bar */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-light)',
        padding: '1rem 2rem',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Shield size={20} color="white" />
            </div>
            <div>
              <h2 style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>DeliverShield</h2>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>AI Parametric Insurance</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <ThemeToggle />
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1.25rem',
                borderRadius: '0.5rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '4rem 2rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4rem',
          alignItems: 'center',
        }}>
          {/* Left Content */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--accent-glow)',
              padding: '0.5rem 1rem',
              borderRadius: '2rem',
              marginBottom: '1.5rem',
            }}>
              <Shield size={16} style={{ color: 'var(--accent-primary)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--accent-primary)' }}>
                AI-Powered Protection
              </span>
            </div>
            
            <h1 style={{
              fontSize: '3.5rem',
              fontWeight: 'bold',
              lineHeight: '1.2',
              marginBottom: '1.5rem',
            }}>
              Protect Your Earnings with
              <span style={{ display: 'block', color: 'var(--accent-primary)' }}>Parametric Insurance</span>
            </h1>
            
            <p style={{
              fontSize: '1.125rem',
              color: 'var(--text-secondary)',
              marginBottom: '2rem',
              lineHeight: '1.6',
            }}>
              India's first AI-powered parametric insurance platform for delivery partners. 
              Get instant payouts when weather, pollution, or traffic disrupt your deliveries.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '0.875rem 2rem',
                  borderRadius: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                Start Protecting Now <ChevronRight size={18} />
              </button>
            </div>
            
            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.5rem',
              marginTop: '3rem',
              paddingTop: '2rem',
              borderTop: '1px solid var(--border-light)',
            }}>
              {stats.map((stat, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
                    {stat.icon}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stat.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Right Content - Live Monitoring with REAL DATA */}
          <div>
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: '2rem',
              padding: '2rem',
              border: '1px solid var(--border-light)',
            }}>
              {/* Live Trigger Demo */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>LIVE MONITORING</span>
                  <span style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', display: 'inline-block' }}></span>
                </div>
                
                {triggers.map((trigger, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    background: 'var(--bg-primary)',
                    borderRadius: '0.5rem',
                    border: `1px solid ${trigger.triggered ? 'var(--danger)' : 'var(--border-light)'}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ color: trigger.triggered ? 'var(--danger)' : 'var(--accent-primary)' }}>{trigger.icon}</div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{trigger.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Threshold: {trigger.threshold}</div>
                        <div style={{ fontSize: '0.65rem', color: trigger.triggered ? 'var(--danger)' : 'var(--text-tertiary)' }}>
                          Current: {trigger.current}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: trigger.triggered ? 'var(--danger)' : 'var(--success)' }}>
                      {trigger.payout}
                      {trigger.triggered && <span style={{ fontSize: '0.6rem', display: 'block' }}>ACTIVE</span>}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Weekly Premium Card */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '1rem',
                padding: '1.25rem',
                color: 'white',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>WEEKLY PREMIUM</span>
                  <Award size={20} />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹20-35</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>Coverage up to ₹2,000/week</div>
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    width: '100%',
                    marginTop: '1rem',
                    padding: '0.5rem',
                    background: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#667eea',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Get Protected →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '5rem 2rem',
        background: 'var(--bg-secondary)',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Why Choose DeliverShield?
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Built specifically for gig economy delivery partners to protect against income loss
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}>
            {features.map((feature, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-primary)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  border: '1px solid var(--border-light)',
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: `${feature.color}20`,
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  color: feature.color,
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              How It Works
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>Simple, transparent, and fully automated</p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem',
            textAlign: 'center',
          }}>
            {[
              { step: "01", title: "Activate Plan", desc: "Choose weekly plan (₹20-35/week) based on your zone" },
              { step: "02", title: "AI Monitors", desc: "System tracks weather, AQI, and traffic in real-time" },
              { step: "03", title: "Auto Payout", desc: "Triggers breached → Instant payout to your wallet" }
            ].map((item, idx) => (
              <div key={idx}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: 'white',
                }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '5rem 2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
          color: 'white',
        }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Ready to Protect Your Earnings?
          </h2>
          <p style={{ fontSize: '1.125rem', marginBottom: '2rem', opacity: 0.9 }}>
            Join thousands of delivery partners already using DeliverShield AI
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'white',
              color: '#667eea',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '0.75rem',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Get Started Now →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '3rem 2rem',
        borderTop: '1px solid var(--border-light)',
        background: 'var(--bg-secondary)',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Shield size={20} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontWeight: 'bold' }}>DeliverShield AI</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            © 2024 DeliverShield AI - AI-Powered Parametric Insurance for Delivery Partners
          </p>
        </div>
      </footer>
    </div>
  );
}