import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Eye, Ban, Clock, TrendingUp, Users, DollarSign } from 'lucide-react';

export default function AdminFraudDashboard() {
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClaims: 0,
    flaggedClaims: 0,
    approvedClaims: 0,
    fraudRate: 0,
    totalPayouts: 0
  });

  useEffect(() => {
    fetchFraudAlerts();
    fetchStats();
  }, []);

  const fetchFraudAlerts = async () => {
    try {
      // Mock data for demo - replace with actual API call
      const mockAlerts = [
        {
          id: 'CLM001',
          userId: 8,
          userName: 'Deepak Kumar',
          triggerType: 'Heavy Rainfall',
          amount: 450,
          fraudScore: 85,
          reasons: ['No motion detected', 'GPS speed variance > 15', 'Unrealistic location jump'],
          timestamp: '2026-04-17T10:30:00',
          status: 'PENDING'
        },
        {
          id: 'CLM002',
          userId: 5,
          userName: 'example',
          triggerType: 'Extreme Heat',
          amount: 245,
          fraudScore: 45,
          reasons: ['Excessive working hours'],
          timestamp: '2026-04-16T15:20:00',
          status: 'PENDING'
        },
        {
          id: 'CLM003',
          userId: 4,
          userName: 'priya',
          triggerType: 'High Pollution',
          amount: 450,
          fraudScore: 92,
          reasons: ['No motion detected', 'GPS spoofing detected', 'VPN detected', 'Device emulator'],
          timestamp: '2026-04-16T09:15:00',
          status: 'PENDING'
        }
      ];
      setFraudAlerts(mockAlerts);
    } catch (error) {
      console.error('Failed to fetch fraud alerts:', error);
    }
  };

  const fetchStats = async () => {
    // Mock stats - replace with actual API
    setStats({
      totalClaims: 156,
      flaggedClaims: 23,
      approvedClaims: 133,
      fraudRate: 14.7,
      totalPayouts: 45250
    });
    setLoading(false);
  };

  const reviewClaim = async (claimId, action) => {
    console.log(`Reviewing claim ${claimId}: ${action}`);
    // Update local state
    setFraudAlerts(alerts => alerts.filter(a => a.id !== claimId));
    setStats(prev => ({
      ...prev,
      flaggedClaims: prev.flaggedClaims - 1,
      approvedClaims: action === 'approve' ? prev.approvedClaims + 1 : prev.approvedClaims
    }));
  };

  const getFraudColor = (score) => {
    if (score >= 70) return { bg: '#fee2e2', text: '#ef4444', label: 'HIGH' };
    if (score >= 40) return { bg: '#fef3c7', text: '#f59e0b', label: 'MEDIUM' };
    return { bg: '#d1fae5', text: '#10b981', label: 'LOW' };
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Shield size={28} style={{ color: '#667eea' }} />
          Fraud Detection Dashboard
        </h1>
        <p style={{ color: '#6b7280' }}>Monitor and review flagged claims with AI-powered fraud detection</p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <AlertTriangle size={20} style={{ color: '#ef4444' }} />
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Flagged Claims</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.flaggedClaims}</div>
        </div>
        
        <div style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <CheckCircle size={20} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Approved Claims</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.approvedClaims}</div>
        </div>
        
        <div style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <TrendingUp size={20} style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Fraud Rate</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.fraudRate}%</div>
        </div>
        
        <div style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <DollarSign size={20} style={{ color: '#667eea' }} />
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Total Payouts</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{stats.totalPayouts.toLocaleString()}</div>
        </div>
      </div>

      {/* Fraud Alerts Table */}
      <div style={{
        background: 'white',
        borderRadius: '0.5rem',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '1rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontWeight: 'bold' }}>Pending Reviews</h2>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem' }}>Claim ID</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem' }}>User</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem' }}>Trigger</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem' }}>Amount</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem' }}>Fraud Score</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem' }}>Reasons</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fraudAlerts.map(alert => {
                const fraudColor = getFraudColor(alert.fraudScore);
                return (
                  <tr key={alert.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontFamily: 'monospace' }}>#{alert.id}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{alert.userName}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>{alert.triggerType}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 'bold', color: '#10b981' }}>₹{alert.amount}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        background: fraudColor.bg,
                        color: fraudColor.text,
                        padding: '0.25rem 0.5rem',
                        borderRadius: '1rem',
                        fontSize: '0.7rem',
                        fontWeight: 'bold'
                      }}>
                        {alert.fraudScore}% ({fraudColor.label})
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.7rem', maxWidth: '200px' }}>
                      {alert.reasons.slice(0, 2).join(', ')}
                      {alert.reasons.length > 2 && ` +${alert.reasons.length - 2} more`}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => reviewClaim(alert.id, 'approve')}
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.7rem'
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => reviewClaim(alert.id, 'reject')}
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.7rem'
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fraud Detection Layers Info */}
      <div style={{
        marginTop: '2rem',
        background: 'white',
        borderRadius: '0.5rem',
        border: '1px solid #e5e7eb',
        padding: '1rem'
      }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>🛡️ 12-Layer Fraud Detection System</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.7rem' }}>
          <span style={{ background: '#d1fae5', padding: '0.25rem 0.5rem', borderRadius: '1rem' }}>GPS Spoofing</span>
          <span style={{ background: '#d1fae5', padding: '0.25rem 0.5rem', borderRadius: '1rem' }}>IP-Geolocation</span>
          <span style={{ background: '#d1fae5', padding: '0.25rem 0.5rem', borderRadius: '1rem' }}>VPN Detection</span>
          <span style={{ background: '#d1fae5', padding: '0.25rem 0.5rem', borderRadius: '1rem' }}>Device Fingerprint</span>
          <span style={{ background: '#d1fae5', padding: '0.25rem 0.5rem', borderRadius: '1rem' }}>Emulator Detection</span>
          <span style={{ background: '#d1fae5', padding: '0.25rem 0.5rem', borderRadius: '1rem' }}>Motion Analysis</span>
          <span style={{ background: '#d1fae5', padding: '0.25rem 0.5rem', borderRadius: '1rem' }}>Route Validation</span>
          <span style={{ background: '#d1fae5', padding: '0.25rem 0.5rem', borderRadius: '1rem' }}>Shared Device</span>
          <span style={{ background: '#d1fae5', padding: '0.25rem 0.5rem', borderRadius: '1rem' }}>Fraud Ring</span>
          <span style={{ background: '#d1fae5', padding: '0.25rem 0.5rem', borderRadius: '1rem' }}>Behavioral Pattern</span>
          <span style={{ background: '#d1fae5', padding: '0.25rem 0.5rem', borderRadius: '1rem' }}>OCR Verification</span>
          <span style={{ background: '#d1fae5', padding: '0.25rem 0.5rem', borderRadius: '1rem' }}>Multi-Signal Fusion</span>
        </div>
      </div>
    </div>
  );
}