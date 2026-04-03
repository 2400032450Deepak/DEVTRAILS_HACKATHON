import React, { useEffect, useState, useContext } from 'react';
import { getPayoutHistory } from '../api/config';
import { useAuth } from '../context/AuthContext';
import { ToastContext } from '../App';
import { 
  History, DollarSign, Calendar, Clock, CheckCircle, 
  Download, Filter, TrendingUp, Award, Zap,
  CloudRain, Wind, Thermometer, Search, ChevronDown
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PayoutHistory() {
  const { user } = useAuth();
  const { showToast } = useContext(ToastContext);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchPayouts = async () => {
      setLoading(true);
      try {
        const data = await getPayoutHistory(user?.id);
        setPayouts(data);
      } catch (error) {
        console.error('Payout fetch error:', error);
        if (showToast) showToast('Error loading payout history', 'error');
        // Mock data for demo
        setPayouts([
          { id: 'PAY_001', date: '2024-03-15', amount: 350, reason: 'Heavy Rainfall (>40mm/hr)', status: 'COMPLETED', transactionId: 'TXN123456', triggerType: 'rainfall' },
          { id: 'PAY_002', date: '2024-03-10', amount: 250, reason: 'High Pollution (AQI > 300)', status: 'COMPLETED', transactionId: 'TXN123457', triggerType: 'aqi' },
          { id: 'PAY_003', date: '2024-03-05', amount: 300, reason: 'Extreme Heat (>42°C)', status: 'COMPLETED', transactionId: 'TXN123458', triggerType: 'temperature' },
          { id: 'PAY_004', date: '2024-02-28', amount: 200, reason: 'Traffic Congestion', status: 'COMPLETED', transactionId: 'TXN123459', triggerType: 'traffic' },
          { id: 'PAY_005', date: '2024-02-20', amount: 350, reason: 'Heavy Rainfall (>40mm/hr)', status: 'COMPLETED', transactionId: 'TXN123460', triggerType: 'rainfall' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.id) {
      fetchPayouts();
    }
  }, [user]);

  const getTriggerIcon = (reason) => {
    const lowerReason = reason.toLowerCase();
    if (lowerReason.includes('rainfall')) return <CloudRain size={16} style={{ color: '#3b82f6' }} />;
    if (lowerReason.includes('pollution') || lowerReason.includes('aqi')) return <Wind size={16} style={{ color: '#8b5cf6' }} />;
    if (lowerReason.includes('heat') || lowerReason.includes('temperature')) return <Thermometer size={16} style={{ color: '#ef4444' }} />;
    if (lowerReason.includes('traffic')) return <Zap size={16} style={{ color: '#f59e0b' }} />;
    return <Award size={16} style={{ color: '#10b981' }} />;
  };

  const getStatusColor = (status) => {
    if (status === 'COMPLETED') return { bg: 'var(--success-glow)', text: 'var(--success)', icon: <CheckCircle size={12} /> };
    if (status === 'PENDING') return { bg: 'var(--warning-glow)', text: 'var(--warning)', icon: <Clock size={12} /> };
    return { bg: 'var(--danger-glow)', text: 'var(--danger)', icon: null };
  };

  const getFilteredPayouts = () => {
    let filtered = [...payouts];
    
    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter(p => {
        if (filter === 'rainfall') return p.reason.toLowerCase().includes('rainfall');
        if (filter === 'aqi') return p.reason.toLowerCase().includes('pollution') || p.reason.toLowerCase().includes('aqi');
        if (filter === 'temperature') return p.reason.toLowerCase().includes('heat') || p.reason.toLowerCase().includes('temperature');
        return true;
      });
    }
    
    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date);
      }
      if (sortBy === 'amount') {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
      return 0;
    });
    
    return filtered;
  };

  const getTotalPayout = () => {
    return payouts.reduce((sum, p) => sum + p.amount, 0);
  };

  const getAveragePayout = () => {
    if (payouts.length === 0) return 0;
    return getTotalPayout() / payouts.length;
  };

  const filteredPayouts = getFilteredPayouts();

  if (loading) return <LoadingSpinner message="Loading payout history..." />;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <History size={28} style={{ color: 'var(--accent-primary)' }} />
          Payout History
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          View all your automatic payouts from parametric triggers
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          padding: '1rem',
          border: '1px solid var(--border-light)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>Total Payouts</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>₹{getTotalPayout().toLocaleString()}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Lifetime earnings</div>
        </div>
        
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          padding: '1rem',
          border: '1px solid var(--border-light)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>Average Payout</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>₹{Math.round(getAveragePayout()).toLocaleString()}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>per trigger</div>
        </div>
        
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          padding: '1rem',
          border: '1px solid var(--border-light)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>Total Transactions</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{payouts.length}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>successful payouts</div>
        </div>
        
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          padding: '1rem',
          border: '1px solid var(--border-light)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>Most Common</div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
            <CloudRain size={16} /> Rainfall
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>primary trigger</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        padding: '1rem',
        background: 'var(--bg-secondary)',
        borderRadius: '1rem',
        border: '1px solid var(--border-light)',
      }}>
        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '0.5rem 1rem',
              background: filter === 'all' ? 'var(--accent-primary)' : 'var(--bg-primary)',
              color: filter === 'all' ? 'white' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            All
          </button>
          <button
            onClick={() => setFilter('rainfall')}
            style={{
              padding: '0.5rem 1rem',
              background: filter === 'rainfall' ? 'var(--accent-primary)' : 'var(--bg-primary)',
              color: filter === 'rainfall' ? 'white' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <CloudRain size={12} /> Rainfall
          </button>
          <button
            onClick={() => setFilter('aqi')}
            style={{
              padding: '0.5rem 1rem',
              background: filter === 'aqi' ? 'var(--accent-primary)' : 'var(--bg-primary)',
              color: filter === 'aqi' ? 'white' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Wind size={12} /> Pollution
          </button>
          <button
            onClick={() => setFilter('temperature')}
            style={{
              padding: '0.5rem 1rem',
              background: filter === 'temperature' ? 'var(--accent-primary)' : 'var(--bg-primary)',
              color: filter === 'temperature' ? 'white' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Thermometer size={12} /> Heat
          </button>
        </div>
        
        {/* Search and Sort */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search payouts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.5rem 0.5rem 0.5rem 2rem',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-light)',
                borderRadius: '0.5rem',
                color: 'var(--text-primary)',
                fontSize: '0.75rem',
                width: '200px',
              }}
            />
          </div>
          
          <button
            onClick={() => {
              if (sortBy === 'date') {
                setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
              } else {
                setSortBy('date');
                setSortOrder('desc');
              }
            }}
            style={{
              padding: '0.5rem 1rem',
              background: sortBy === 'date' ? 'var(--accent-glow)' : 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: '0.5rem',
              color: 'var(--text-primary)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Calendar size={12} /> Date {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          
          <button
            onClick={() => {
              if (sortBy === 'amount') {
                setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
              } else {
                setSortBy('amount');
                setSortOrder('desc');
              }
            }}
            style={{
              padding: '0.5rem 1rem',
              background: sortBy === 'amount' ? 'var(--accent-glow)' : 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: '0.5rem',
              color: 'var(--text-primary)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <DollarSign size={12} /> Amount {sortBy === 'amount' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
        </div>
      </div>

      {/* Payouts Table */}
      {filteredPayouts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem',
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          border: '1px solid var(--border-light)',
        }}>
          <DollarSign size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>No Payouts Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {searchTerm || filter !== 'all' ? 'Try adjusting your filters' : 'Your payouts will appear here'}
          </p>
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          border: '1px solid var(--border-light)',
          overflow: 'hidden',
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '80px 100px 1fr 100px 120px',
            gap: '1rem',
            padding: '1rem 1.5rem',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-light)',
            fontSize: '0.7rem',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
          }}>
            <div>ID</div>
            <div>Date</div>
            <div>Trigger Event</div>
            <div>Amount</div>
            <div>Status</div>
          </div>
          
          {/* Table Rows */}
          <div>
            {filteredPayouts.map((payout, idx) => {
              const statusStyle = getStatusColor(payout.status);
              return (
                <div
                  key={payout.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 100px 1fr 100px 120px',
                    gap: '1rem',
                    padding: '1rem 1.5rem',
                    borderBottom: idx < filteredPayouts.length - 1 ? '1px solid var(--border-light)' : 'none',
                    transition: 'background 0.2s',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* ID */}
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 500 }}>
                    #{payout.id.slice(-6)}
                  </div>
                  
                  {/* Date */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
                    <Calendar size={12} style={{ color: 'var(--text-tertiary)' }} />
                    <span>{new Date(payout.date).toLocaleDateString('en-IN')}</span>
                  </div>
                  
                  {/* Trigger Event */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {getTriggerIcon(payout.reason)}
                    <span style={{ fontSize: '0.875rem' }}>{payout.reason}</span>
                    {payout.transactionId && (
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                        {payout.transactionId}
                      </span>
                    )}
                  </div>
                  
                  {/* Amount */}
                  <div style={{ fontWeight: 'bold', color: 'var(--success)', fontSize: '1rem' }}>
                    +₹{payout.amount.toLocaleString()}
                  </div>
                  
                  {/* Status */}
                  <div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.5rem',
                      background: statusStyle.bg,
                      borderRadius: '1rem',
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      color: statusStyle.text,
                    }}>
                      {statusStyle.icon}
                      {payout.status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Footer */}
      {filteredPayouts.length > 0 && (
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem 1.5rem',
          background: 'var(--bg-secondary)',
          borderRadius: '1rem',
          border: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Showing {filteredPayouts.length} of {payouts.length} payouts
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Total Amount</span>
              <div style={{ fontWeight: 'bold', color: 'var(--success)' }}>
                ₹{filteredPayouts.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Average Payout</span>
              <div style={{ fontWeight: 'bold' }}>
                ₹{Math.round(filteredPayouts.reduce((sum, p) => sum + p.amount, 0) / filteredPayouts.length).toLocaleString()}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              // Download as CSV functionality
              const csv = [['ID', 'Date', 'Reason', 'Amount', 'Status']];
              filteredPayouts.forEach(p => {
                csv.push([p.id, p.date, p.reason, p.amount, p.status]);
              });
              const csvContent = csv.map(row => row.join(',')).join('\n');
              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `payout_history_${new Date().toISOString().split('T')[0]}.csv`;
              a.click();
              URL.revokeObjectURL(url);
              if (showToast) showToast('Download started', 'success');
            }}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: '0.5rem',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      )}
    </div>
  );
}