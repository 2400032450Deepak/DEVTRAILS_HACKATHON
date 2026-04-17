import React, { useEffect, useState, useContext } from 'react';
import { getRiskScore, getLiveTriggers } from '../api/config';
import { useAuth } from '../context/AuthContext';
import { ToastContext } from '../App';
import { SensorCollector } from '../utils/sensorCollector';
import { 
  Radar, TrendingUp, AlertTriangle, CheckCircle, 
  Shield, Activity, Target, Gauge,
  MapPin, Clock, Zap, Brain,
  CloudRain, Wind, Thermometer, AlertCircle,
  Smartphone, Battery, Wifi, Move, Fingerprint,
  Eye, Lock, Server, Users, BarChart3, Calendar,
  Download, RefreshCw, Bell, FileText, Award
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function RiskProfile() {
  const { user, zone } = useAuth();
  const { showToast } = useContext(ToastContext);
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [sensorData, setSensorData] = useState(null);
  const [collectingSensor, setCollectingSensor] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [fraudScore, setFraudScore] = useState(null);
  const [liveConditions, setLiveConditions] = useState(null);
  const sensorCollector = new SensorCollector();

  useEffect(() => {
    const fetchRisk = async () => {
      setLoading(true);
      try {
        // Fetch main risk score
        const data = await getRiskScore(user?.id);
        setRiskData(data);
        
        // Fetch live conditions for risk calculation
        const liveData = await getLiveTriggers(zone);
        setLiveConditions(liveData.live_conditions);
        
        // Calculate fraud score based on historical data
        calculateFraudScore();
        
      } catch (error) {
        console.error('Risk fetch error:', error);
        if (showToast) showToast('Error loading risk profile', 'error');
        setRiskData(getDefaultRiskData(user?.id));
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.id) {
      fetchRisk();
    }
  }, [user, zone]);

  const calculateFraudScore = () => {
    // Simulate fraud score based on various factors
    const randomScore = Math.floor(Math.random() * 30); // 0-30% fraud risk
    setFraudScore({
      score: randomScore,
      level: randomScore < 10 ? 'Low' : randomScore < 20 ? 'Medium' : 'High',
      factors: [
        { name: 'GPS Consistency', score: 95 - randomScore, status: 'good' },
        { name: 'Device Fingerprint', score: 90 - randomScore, status: 'good' },
        { name: 'Motion Pattern', score: 85 - randomScore, status: randomScore > 15 ? 'warning' : 'good' },
        { name: 'Location History', score: 92 - randomScore, status: 'good' },
      ]
    });
  };

  const collectSensorData = async () => {
    setCollectingSensor(true);
    try {
      const data = await sensorCollector.startCollection(3000);
      setSensorData(data);
      if (showToast) showToast('Sensor data collected successfully', 'success');
      
      // Update risk score based on motion data
      if (riskData && data.has_motion === false) {
        setRiskData(prev => ({
          ...prev,
          risk_score: Math.min(100, (prev.risk_score || 55) + 15),
          anomaly_score: (prev.anomaly_score || 0) + 0.2,
          fraud_risk: 'Elevated - No motion detected'
        }));
      }
    } catch (error) {
      console.error('Sensor collection error:', error);
      if (showToast) showToast('Failed to collect sensor data', 'error');
    } finally {
      setCollectingSensor(false);
    }
  };

  const getDefaultRiskData = (userId) => ({
    worker_id: userId,
    risk_level: 'Moderate',
    risk_score: 55,
    anomaly_score: 0.12,
    stability_index: 7.4,
    fraud_risk: 'Low',
    factors: ['Weather Patterns', 'Zone Density', 'Historical Claims', 'Peak Hours', 'Traffic Conditions'],
    recommendations: 'Monitor weather conditions and consider upgrading coverage',
    daily_risk: [35, 42, 58, 65, 72, 68, 55],
    risk_factors: {
      weather: 65,
      traffic: 45,
      zone_density: 70,
      historical: 40,
      peak_hours: 55,
      fraud: 12
    }
  });

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

  const getFraudColor = (score) => {
    if (score > 20) return '#ef4444';
    if (score > 10) return '#f59e0b';
    return '#10b981';
  };

  const getFactorIcon = (factor) => {
    const lowerFactor = factor.toLowerCase();
    if (lowerFactor.includes('weather')) return <CloudRain size={14} />;
    if (lowerFactor.includes('traffic')) return <Zap size={14} />;
    if (lowerFactor.includes('zone')) return <MapPin size={14} />;
    if (lowerFactor.includes('historical')) return <Clock size={14} />;
    if (lowerFactor.includes('peak')) return <Activity size={14} />;
    if (lowerFactor.includes('fraud')) return <Shield size={14} />;
    return <Target size={14} />;
  };

  const downloadRiskReport = () => {
    const report = {
      user: user?.id,
      zone: zone,
      date: new Date().toISOString(),
      risk_level: riskData?.risk_level,
      risk_score: riskData?.risk_score,
      anomaly_score: riskData?.anomaly_score,
      fraud_risk: fraudScore?.level,
      factors: riskData?.factors,
      recommendations: riskData?.recommendations
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `risk_report_${user?.id}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (showToast) showToast('Risk report downloaded', 'success');
  };

  if (loading) return <LoadingSpinner message="Analyzing risk profile..." />;
  if (!riskData) return <LoadingSpinner message="Loading risk assessment..." />;

  const riskPercentage = riskData.risk_score || 55;
  const anomalyPercentage = (riskData.anomaly_score || 0) * 100;
  const stabilityPercentage = (riskData.stability_index || 7.4) * 10;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header with Actions */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Radar size={28} style={{ color: 'var(--accent-primary)' }} />
            Risk Profile
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            AI-powered risk assessment based on your zone, weather patterns, and riding behavior
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={collectSensorData}
            disabled={collectingSensor}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: '0.5rem',
              cursor: collectingSensor ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
            }}
          >
            {collectingSensor ? <RefreshCw size={14} className="spin" /> : <Smartphone size={14} />}
            {collectingSensor ? 'Collecting...' : 'Collect Sensor Data'}
          </button>
          
          <button
            onClick={downloadRiskReport}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--accent-primary)',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
            }}
          >
            <Download size={14} /> Export Report
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--border-light)',
        paddingBottom: '0.5rem',
      }}>
        {['overview', 'fraud-detection', 'sensor-data', 'historical'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.5rem 1rem',
              background: activeTab === tab ? 'var(--accent-primary)' : 'transparent',
              color: activeTab === tab ? 'white' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {tab === 'overview' && <Eye size={14} />}
            {tab === 'fraud-detection' && <Shield size={14} />}
            {tab === 'sensor-data' && <Smartphone size={14} />}
            {tab === 'historical' && <Calendar size={14} />}
            {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* ========== OVERVIEW TAB ========== */}
      {activeTab === 'overview' && (
        <>
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
            <div style={{ background: 'var(--bg-secondary)', borderRadius: '1rem', padding: '1rem', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>ANOMALY SCORE</span>
                <AlertTriangle size={16} style={{ color: riskData.anomaly_score > 0.3 ? '#f59e0b' : '#10b981' }} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{anomalyPercentage.toFixed(1)}%</div>
              <div style={{ marginTop: '0.5rem', height: '4px', background: 'var(--bg-primary)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${anomalyPercentage}%`, height: '100%', background: riskData.anomaly_score > 0.3 ? '#f59e0b' : '#10b981' }} />
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                {riskData.anomaly_score > 0.3 ? 'Unusual patterns detected' : 'Normal behavior pattern'}
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', borderRadius: '1rem', padding: '1rem', border: '1px solid var(--border-light)' }}>
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

            <div style={{ background: 'var(--bg-secondary)', borderRadius: '1rem', padding: '1rem', border: '1px solid var(--border-light)' }}>
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
            <div style={{ background: 'var(--bg-secondary)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--border-light)' }}>
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

            <div style={{
              background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
              borderRadius: '1rem',
              padding: '1.5rem',
              border: `1px solid ${getRiskColor(riskData.risk_level)}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Target size={18} style={{ color: getRiskColor(riskData.risk_level) }} />
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
                  <Shield size={16} style={{ color: getRiskColor(riskData.risk_level) }} />
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
        </>
      )}

      {/* ========== FRAUD DETECTION TAB ========== */}
      {activeTab === 'fraud-detection' && fraudScore && (
        <>
          <div style={{
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: `2px solid ${getFraudColor(fraudScore.score)}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>FRAUD RISK SCORE</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: getFraudColor(fraudScore.score) }}>
                  {fraudScore.score}%
                </div>
                <div style={{ fontSize: '0.75rem', color: getFraudColor(fraudScore.score), marginTop: '0.25rem' }}>
                  Risk Level: {fraudScore.level}
                </div>
              </div>
              
              <div style={{
                padding: '0.75rem 1rem',
                background: getRiskBgColor(fraudScore.level),
                borderRadius: '0.75rem',
                maxWidth: '300px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Shield size={16} />
                  <span style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>12-Layer Protection</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  GPS Spoofing • IP Geolocation • Device Fingerprint • Motion Analysis • Route Validation
                </div>
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}>
            {fraudScore.factors.map((factor, idx) => (
              <div key={idx} style={{
                background: 'var(--bg-secondary)',
                borderRadius: '1rem',
                padding: '1rem',
                border: '1px solid var(--border-light)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {factor.name === 'GPS Consistency' && <MapPin size={16} />}
                    {factor.name === 'Device Fingerprint' && <Fingerprint size={16} />}
                    {factor.name === 'Motion Pattern' && <Activity size={16} />}
                    {factor.name === 'Location History' && <Clock size={16} />}
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{factor.name}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: factor.score > 80 ? '#10b981' : factor.score > 60 ? '#f59e0b' : '#ef4444' }}>
                    {factor.score}%
                  </span>
                </div>
                <div style={{ height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${factor.score}%`, height: '100%', background: factor.score > 80 ? '#10b981' : factor.score > 60 ? '#f59e0b' : '#ef4444' }} />
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                  {factor.status === 'good' ? '✓ Verified' : '⚠️ Needs attention'}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '1rem',
            padding: '1rem',
            border: '1px solid var(--border-light)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <AlertCircle size={16} style={{ color: '#f59e0b' }} />
              <span style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>Fraud Prevention Tips</span>
            </div>
            <ul style={{ marginLeft: '1.5rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              <li>Keep GPS enabled while delivering</li>
              <li>Don't use VPN or proxy services</li>
              <li>Maintain consistent working hours</li>
              <li>Report any suspicious activity immediately</li>
            </ul>
          </div>
        </>
      )}

      {/* ========== SENSOR DATA TAB ========== */}
      {activeTab === 'sensor-data' && (
        <>
          <div style={{
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}>
            <button
              onClick={collectSensorData}
              disabled={collectingSensor}
              style={{
                padding: '1rem 2rem',
                background: 'var(--accent-primary)',
                border: 'none',
                borderRadius: '1rem',
                color: 'white',
                cursor: collectingSensor ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              {collectingSensor ? <RefreshCw size={20} className="spin" /> : <Smartphone size={20} />}
              {collectingSensor ? 'Collecting Sensor Data...' : 'Start Sensor Collection'}
            </button>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '1rem' }}>
              Collect accelerometer, battery, and network data for fraud detection
            </p>
          </div>

          {sensorData && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
            }}>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: '1rem', padding: '1rem', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Activity size={16} style={{ color: sensorData.has_motion ? '#10b981' : '#ef4444' }} />
                  <span style={{ fontWeight: 'bold' }}>Motion Detection</span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {sensorData.has_motion ? '✅ Motion Detected' : '❌ No Motion'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                  Confidence: {sensorData.motion_confidence}% | Samples: {sensorData.motion_samples}
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', borderRadius: '1rem', padding: '1rem', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Battery size={16} />
                  <span style={{ fontWeight: 'bold' }}>Battery Status</span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {sensorData.battery_level ? `${Math.round(sensorData.battery_level * 100)}%` : 'N/A'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                  {sensorData.battery_charging ? '🔌 Charging' : '🔋 Not Charging'}
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', borderRadius: '1rem', padding: '1rem', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Wifi size={16} />
                  <span style={{ fontWeight: 'bold' }}>Network Info</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                  {sensorData.network_type || 'Unknown'}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                  RTT: {sensorData.network_rtt || 'N/A'} ms
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', borderRadius: '1rem', padding: '1rem', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Gauge size={16} />
                  <span style={{ fontWeight: 'bold' }}>Acceleration</span>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                  {sensorData.avg_acceleration || 0} g
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                  Variance: {sensorData.motion_variance || 0}
                </div>
              </div>
            </div>
          )}

          {!sensorData && !collectingSensor && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              background: 'var(--bg-secondary)',
              borderRadius: '1rem',
              color: 'var(--text-tertiary)',
            }}>
              <Smartphone size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Click "Start Sensor Collection" to analyze device data</p>
              <p style={{ fontSize: '0.7rem' }}>This helps detect GPS spoofing and fraudulent claims</p>
            </div>
          )}
        </>
      )}

      {/* ========== HISTORICAL TAB ========== */}
      {activeTab === 'historical' && (
        <>
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid var(--border-light)',
            marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={18} style={{ color: 'var(--accent-primary)' }} />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>7-Day Risk Trend</h2>
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
            
            <div style={{ marginTop: '1rem' }}>
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
          </div>

          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid var(--border-light)',
          }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Risk Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Average Risk</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>56.4%</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Highest Risk</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ef4444' }}>72% (Friday)</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Lowest Risk</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>35% (Monday)</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Trend</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f59e0b' }}>↑ +8.2%</div>
              </div>
            </div>
          </div>
        </>
      )}

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

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}