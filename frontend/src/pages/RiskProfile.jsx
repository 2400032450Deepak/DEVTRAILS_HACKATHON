import React, { useEffect, useState, useContext } from 'react';
import { getRiskScore } from '../api/config';
import { useAuth } from '../context/AuthContext';
import { ToastContext } from '../App';
import { 
  Radar, TrendingUp, AlertTriangle, CheckCircle, 
  Shield, Activity, Target, Gauge,
  MapPin, Clock, Zap, Brain,
  CloudRain, Wind, Thermometer, AlertCircle
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function RiskProfile() {
  const { user, zone } = useAuth();
  const { showToast } = useContext(ToastContext);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  useEffect(() => {
    const fetchRisk = async () => {
      setLoading(true);
      try {
        const data = await getRiskScore(user?.id);
        setRiskData(data);
      } catch (error) {
        console.error('Risk fetch error:', error);
        if (showToast) showToast('Error loading risk profile', 'error');
        setRiskData({
          worker_id: user?.id,
          risk_level: 'Moderate',
          risk_score: 55,
          anomaly_score: 0.12,
          stability_index: 7.4,
          factors: ['Weather Patterns', 'Zone Density', 'Historical Claims', 'Peak Hours'],
          recommendations: 'Monitor weather conditions and consider upgrading coverage',
          daily_risk: [35, 42, 58, 65, 72, 68, 55],
          risk_factors: {
            weather: 65,
            traffic: 45,
            zone_density: 70,
            historical: 40,
            peak_hours: 55
          }
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.id) {
      fetchRisk();
    }
  }, [user]);

  const getRiskColor = (level) => {
    if (level === 'High') return '#ef4444';
    if (level === 'Moderate') return '#f59e0b';
    return '#10b981';
  };

  const getRiskBgColor = (level) => {
    if (level === 'High') return 'rgba(239, 68, 68, 0.1)';
    if (level === 'Moderate') return 'rgba(245, 158, 11, 0.1)';
    return 'rgba(16, 185, 129, 0.1)';
  };

  const getRiskText = (level) => {
    if (level === 'High') return 'High Risk - Immediate attention recommended';
    if (level === 'Moderate') return 'Moderate Risk - Monitor conditions';
    return 'Low Risk - Standard operations';
  };

  const getRecommendationColor = (level) => {
    if (level === 'High') return '#ef4444';
    if (level === 'Moderate') return '#f59e0b';
    return '#10b981';
  };

  const getFactorIcon = (factor) => {
    const lowerFactor = factor.toLowerCase();
    if (lowerFactor.includes('weather')) return <CloudRain size={14} />;
    if (lowerFactor.includes('traffic')) return <Zap size={14} />;
    if (lowerFactor.includes('zone')) return <MapPin size={14} />;
    if (lowerFactor.includes('historical')) return <Clock size={14} />;
    if (lowerFactor.includes('peak')) return <Activity size={14} />;
    return <Target size={14} />;
  };

  if (loading) return <LoadingSpinner message="Analyzing risk profile..." />;
  if (!riskData) return <LoadingSpinner message="Loading risk assessment..." />;

  const riskPercentage = riskData.risk_score || 55;
  const anomalyPercentage = (riskData.anomaly_score || 0) * 100;
  const stabilityPercentage = (riskData.stability_index || 7.4) * 10;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Radar size={28} style={{ color: 'var(--accent-primary)' }} />
          Risk Profile
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          AI-powered risk assessment based on your zone, weather patterns, and riding behavior
        </p>
      </div>

      {/* Main Risk Card */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
        borderRadius: '1rem',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        border: `2px solid ${getRiskColor(riskData.risk_level)}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>CURRENT RISK LEVEL</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: getRiskColor(riskData.risk_level) }}>
              {riskData.risk_level?.toUpperCase()}
            </div>
            <div style={{ fontSize: '0.75rem', color: getRiskColor(riskData.risk_level), marginTop: '0.25rem' }}>
              {getRiskText(riskData.risk_level)}
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: '120px', height: '120px' }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border-light)" strokeWidth="8"/>
                <circle 
                  cx="60" 
                  cy="60" 
                  r="54" 
                  fill="none" 
                  stroke={getRiskColor(riskData.risk_level)} 
                  strokeWidth="8"
                  strokeDasharray={`${riskPercentage * 3.39} 339`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{riskPercentage}%</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>Risk Score</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Risk Meter */}
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
            <span>Low Risk</span>
            <span>Moderate</span>
            <span>High Risk</span>
          </div>
          <div style={{ height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: '33%', background: '#10b981', height: '100%' }} />
            <div style={{ width: '34%', background: '#f59e0b', height: '100%' }} />
            <div style={{ width: '33%', background: '#ef4444', height: '100%' }} />
          </div>
          <div style={{ 
            width: `${riskPercentage}%`, 
            height: '2px', 
            background: getRiskColor(riskData.risk_level), 
            marginTop: '4px',
            position: 'relative',
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: getRiskColor(riskData.risk_level),
              borderRadius: '50%',
              position: 'absolute',
              right: '-6px',
              top: '-5px',
            }} />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        {/* Anomaly Score */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          padding: '1rem',
          border: '1px solid var(--border-light)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>ANOMALY SCORE</span>
            <AlertTriangle size={16} style={{ color: riskData.anomaly_score > 0.3 ? '#f59e0b' : '#10b981' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{(riskData.anomaly_score * 100).toFixed(1)}%</div>
          <div style={{ marginTop: '0.5rem', height: '4px', background: 'var(--bg-primary)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${anomalyPercentage}%`, height: '100%', background: riskData.anomaly_score > 0.3 ? '#f59e0b' : '#10b981' }} />
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
            {riskData.anomaly_score > 0.3 ? 'Unusual patterns detected' : 'Normal behavior pattern'}
          </div>
        </div>

        {/* Stability Index */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          padding: '1rem',
          border: '1px solid var(--border-light)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>STABILITY INDEX</span>
            <Gauge size={16} style={{ color: stabilityPercentage > 70 ? '#10b981' : '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{riskData.stability_index || 7.4}/10</div>
          <div style={{ marginTop: '0.5rem', height: '4px', background: 'var(--bg-primary)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${stabilityPercentage}%`, height: '100%', background: stabilityPercentage > 70 ? '#10b981' : '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
            {stabilityPercentage > 70 ? 'Stable earnings pattern' : 'Variable earnings detected'}
          </div>
        </div>

        {/* Zone Risk */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          padding: '1rem',
          border: '1px solid var(--border-light)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>ZONE RISK FACTOR</span>
            <MapPin size={16} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>High</div>
          <div style={{ marginTop: '0.5rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {zone?.replace('_', ' ')} - High density zone
            </div>
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
            Premium adjustment: +20%
          </div>
        </div>
      </div>

      {/* Risk Factors Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem',
      }}>
        {/* Risk Factors List */}
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          padding: '1.5rem',
          border: '1px solid var(--border-light)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Brain size={18} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Risk Factors Analysis</h2>
          </div>
          
          {riskData.factors?.map((factor, idx) => {
            const factorValues = {
              'Weather Patterns': 65,
              'Zone Density': 70,
              'Historical Claims': 40,
              'Peak Hours': 55,
              'Traffic Conditions': 45
            };
            const value = factorValues[factor] || 50;
            const getFactorColor = (val) => {
              if (val > 60) return '#ef4444';
              if (val > 40) return '#f59e0b';
              return '#10b981';
            };
            
            return (
              <div key={idx} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                    {getFactorIcon(factor)}
                    <span>{factor}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: getFactorColor(value) }}>{value}%</span>
                </div>
                <div style={{ height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${value}%`, height: '100%', background: getFactorColor(value) }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recommendations */}
        <div style={{
          background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
          borderRadius: '1rem',
          padding: '1.5rem',
          border: `1px solid ${getRecommendationColor(riskData.risk_level)}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Target size={18} style={{ color: getRecommendationColor(riskData.risk_level) }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>AI Recommendations</h2>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.875rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
              {riskData.recommendations || 'Based on your risk profile, we recommend monitoring weather conditions and maintaining active coverage.'}
            </div>
          </div>
          
          <div style={{
            padding: '1rem',
            background: getRiskBgColor(riskData.risk_level),
            borderRadius: '0.75rem',
            marginTop: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Shield size={16} style={{ color: getRecommendationColor(riskData.risk_level) }} />
              <span style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Suggested Action</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {riskData.risk_level === 'High' 
                ? 'Consider upgrading to Tier 1 coverage for maximum protection' 
                : riskData.risk_level === 'Moderate'
                ? 'Your current coverage is adequate. Continue monitoring weather alerts.'
                : 'Standard coverage sufficient. Keep protection active for peace of mind.'}
            </div>
          </div>
        </div>
      </div>

      {/* Historical Risk Trend */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: '1rem',
        padding: '1.5rem',
        border: '1px solid var(--border-light)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} style={{ color: 'var(--accent-primary)' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Historical Risk Trend</h2>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['week', 'month', 'quarter'].map(tf => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                style={{
                  padding: '0.25rem 0.75rem',
                  background: selectedTimeframe === tf ? 'var(--accent-primary)' : 'var(--bg-primary)',
                  color: selectedTimeframe === tf ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                }}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Risk Trend Chart */}
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
            <span>Lower Risk</span>
            <span>Higher Risk</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '200px' }}>
            {(riskData.daily_risk || [35, 42, 58, 65, 72, 68, 55]).map((value, idx) => {
              const height = (value / 100) * 180;
              const getBarColor = (val) => {
                if (val > 60) return '#ef4444';
                if (val > 40) return '#f59e0b';
                return '#10b981';
              };
              
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ 
                    height: `${height}px`, 
                    width: '100%', 
                    background: getBarColor(value),
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s ease',
                    position: 'relative',
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '0.6rem',
                      fontWeight: 'bold',
                      color: getBarColor(value),
                    }}>
                      {value}%
                    </div>
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: 'var(--bg-primary)',
          borderRadius: '0.5rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '1.5rem',
          fontSize: '0.65rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '2px' }} />
            <span>Low Risk (&lt;40%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px' }} />
            <span>Moderate (40-60%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px' }} />
            <span>High Risk (&gt;60%)</span>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{
        marginTop: '1.5rem',
        padding: '0.75rem',
        background: 'var(--bg-primary)',
        borderRadius: '0.5rem',
        textAlign: 'center',
        fontSize: '0.65rem',
        color: 'var(--text-tertiary)',
      }}>
        <AlertCircle size={12} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'middle' }} />
        Risk assessment is updated in real-time based on live conditions. Scores are calculated using AI algorithms.
      </div>
    </div>
  );
}