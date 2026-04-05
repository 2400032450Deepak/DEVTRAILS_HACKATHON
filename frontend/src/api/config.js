// DeliverShield AI - Complete API Configuration

// ============================================
// PRODUCTION CONFIGURATION (Vercel + Render)
// ============================================

// Backend API - Render deployment
const API_BASE = 'https://delivershield-backend.onrender.com/api';

// AI Service - Render deployment  
const AI_BASE = 'https://devtrails-ai.onrender.com/evaluate';

// ============================================
// For local development (uncomment if needed)
// ============================================
// const API_BASE = 'http://localhost:8080/api';
// const AI_BASE = 'http://localhost:8000/evaluate';

// Auto-detect environment (optional - works for both local and production)
// const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
// const API_BASE = isLocal ? 'http://localhost:8080/api' : 'https://delivershield-backend.onrender.com/api';
// const AI_BASE = isLocal ? 'http://localhost:8000/evaluate' : 'https://devtrails-ai.onrender.com/evaluate';

// Helper: Get live location
const getLiveLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: 19.0760, lon: 72.8777 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve({ lat: 19.0760, lon: 72.8777 }),
      { timeout: 5000 }
    );
  });
};

// ============= AUTHENTICATION =============
export const registerUser = async (name, email, phone, password) => {
  // Client-side validation
  if (!name || name.trim().length < 3) {
    throw new Error('Name must be at least 3 characters');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Please enter a valid email address');
  }
  
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    throw new Error('Please enter a valid 10-digit Indian mobile number starting with 6,7,8,9');
  }
  
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    throw new Error('Password must contain uppercase, lowercase, number, and special character');
  }
  
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });
    
    const text = await res.text();
    
    if (!res.ok) {
      if (text.includes('already exists') || text.includes('duplicate')) {
        throw new Error('User already exists with this phone number');
      }
      throw new Error(text || 'Registration failed');
    }
    
    try {
      return JSON.parse(text);
    } catch {
      return { message: text || 'Registration successful' };
    }
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginUser = async (phone, password) => {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });
    
    const text = await res.text();
    
    if (!res.ok) {
      throw new Error(text || 'Invalid credentials');
    }
    
    try {
      return JSON.parse(text);
    } catch {
      return { userId: text, user: { id: text } };
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const googleLogin = async (googleToken) => {
  try {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: googleToken })
    });
    
    if (!res.ok) throw new Error('Google login failed');
    return res.json();
  } catch (error) {
    console.error('Google login error:', error);
    throw error;
  }
};

// ============= USER PROFILE =============
export const getWorkerProfile = async (workerId) => {
  try {
    const res = await fetch(`${API_BASE}/workers/${workerId}`);
    if (!res.ok) throw new Error("Profile fetch failed");
    const data = await res.json();
    return {
      ...data,
      name: data.name || "Ravi Kumar",
      totalEarnings: data.totalEarnings || 12450,
    };
  } catch (error) {
    console.warn("Using fallback profile data");
    return {
      id: workerId,
      name: "Ravi Kumar",
      zone: "Zone_B_Mumbai",
      phone: String(workerId),
      totalEarnings: 12450,
      activeCoverage: true,
      currentPlan: "Tier 2",
      weeklyPremium: 25,
      coverageAmount: 1000,
      joinDate: "2024-01-15"
    };
  }
};

// ============= LIVE MONITORING =============
export const getLiveTriggers = async (zoneId) => {
  const coords = await getLiveLocation();
  const payload = {
    worker_id: "WKR-SYSTEM",
    zone: zoneId,
    gps_lat: coords.lat,
    gps_lon: coords.lon,
    daily_earnings_inr: 800,
    weekly_earnings_inr: 4500,
    num_deliveries: 15,
    active_hours: 6,
    gps_speed_variance: 1.2,
    location_jump_km: 0
  };

  try {
    const res = await fetch(`${AI_BASE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) throw new Error("AI service unavailable");
    const data = await res.json();

    return {
      zone: zoneId,
      timestamp: new Date().toISOString(),
      live_conditions: data.live_conditions || {
        temperature_c: 32.5,
        humidity_pct: 78,
        rainfall_mm_hr: 45.2,
        aqi: 312
      },
      thresholds: {
        rainfall_mm_hr: 40.0,
        aqi: 300.0,
        temperature_c: 42.0
      },
      risk_level: data.risk_level || 'Moderate',
      recommended_action: data.risk_level === 'High' ? 'Payout Triggered' : 'Monitoring',
      active_triggers: false
    };
  } catch (error) {
    console.error("AI Backend offline, using mock data", error);
    const mockConditions = {
      'Zone_A_Bangalore': { temperature_c: 38.5, humidity_pct: 65, rainfall_mm_hr: 35.2, aqi: 280 },
      'Zone_B_Mumbai': { temperature_c: 32.5, humidity_pct: 78, rainfall_mm_hr: 45.2, aqi: 312 },
      'Zone_C_Delhi': { temperature_c: 41.2, humidity_pct: 45, rainfall_mm_hr: 12.5, aqi: 385 },
      'Zone_D_Hyderabad': { temperature_c: 39.5, humidity_pct: 55, rainfall_mm_hr: 28.5, aqi: 298 },
      'Zone_E_Chennai': { temperature_c: 35.0, humidity_pct: 70, rainfall_mm_hr: 52.3, aqi: 275 }
    };
    
    return {
      zone: zoneId,
      timestamp: new Date().toISOString(),
      live_conditions: mockConditions[zoneId] || mockConditions['Zone_B_Mumbai'],
      thresholds: { rainfall_mm_hr: 40.0, aqi: 300.0, temperature_c: 42.0 },
      risk_level: 'Moderate',
      recommended_action: 'Watch',
      active_triggers: false
    };
  }
};

// ============= PAYOUT SYSTEM =============
export const getPayoutHistory = async (workerId) => {
  try {
    const res = await fetch(`${API_BASE}/payouts/user/${workerId}`);
    if (!res.ok) throw new Error("Payout fetch failed");
    return await res.json();
  } catch (error) {
    console.warn("Using mock payout data");
    return [
      { id: 'PAY_001', date: '2024-03-15', amount: 350, reason: 'Heavy Rainfall (>40mm/hr)', status: 'COMPLETED', transactionId: 'TXN123456' },
      { id: 'PAY_002', date: '2024-03-10', amount: 250, reason: 'High Pollution (AQI > 300)', status: 'COMPLETED', transactionId: 'TXN123457' },
      { id: 'PAY_003', date: '2024-03-05', amount: 300, reason: 'Extreme Heat (>42°C)', status: 'COMPLETED', transactionId: 'TXN123458' },
    ];
  }
};

// ============= RISK ASSESSMENT =============
export const getRiskScore = async (workerId) => {
  const coords = await getLiveLocation();
  const payload = {
    worker_id: workerId,
    zone: "Zone_B_Mumbai",
    gps_lat: coords.lat,
    gps_lon: coords.lon,
    daily_earnings_inr: 800,
    weekly_earnings_inr: 4500,
    num_deliveries: 15,
    active_hours: 6,
    gps_speed_variance: 5.5,
    location_jump_km: 2.1
  };

  try {
    const res = await fetch(`${AI_BASE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) throw new Error("Risk assessment failed");
    const data = await res.json();

    return {
      worker_id: workerId,
      risk_level: data.risk_level || 'Moderate',
      risk_score: data.risk_level === 'High' ? 85 : data.risk_level === 'Moderate' ? 55 : 25,
      anomaly_score: data.fraud_check === 'Fraudulent' ? 0.9 : 0.12,
      stability_index: 8.4,
      factors: ['Weather Patterns', 'Zone Density', 'Historical Claims'],
      recommendations: data.risk_level === 'High' ? 'Consider upgrading coverage' : 'Current coverage adequate'
    };
  } catch (error) {
    return {
      worker_id: workerId,
      risk_level: 'Moderate',
      risk_score: 55,
      anomaly_score: 0.12,
      stability_index: 7.4,
      factors: ['Weather Patterns', 'Zone Density', 'Historical Claims'],
      recommendations: 'Monitor weather conditions'
    };
  }
};

// ============= COVERAGE PLANS =============
export const getAvailablePlans = async () => {
  try {
    const res = await fetch(`${API_BASE}/plans`);
    if (!res.ok) throw new Error("Plan fetch failed");
    return await res.json();
  } catch (error) {
    return [
      { id: 1, name: 'Tier 1 - Premium', premium: 35, coverage: 1500, benefits: ['Highest protection', 'Priority payouts', '24/7 support'] },
      { id: 2, name: 'Tier 2 - Standard', premium: 25, coverage: 1000, benefits: ['Balanced protection', 'Standard payouts', 'Email support'] },
      { id: 3, name: 'Tier 3 - Basic', premium: 20, coverage: 750, benefits: ['Essential protection', 'Basic payouts'] },
    ];
  }
};

export const getMyPlan = async (workerId) => {
  try {
    const res = await fetch(`${API_BASE}/plans/active/${workerId}`);
    if (!res.ok || res.status === 204) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
};

export const activatePlan = async (workerId, planId) => {
  const res = await fetch(`${API_BASE}/plans/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: workerId, planId: planId })
  });
  if (!res.ok) throw new Error("Could not activate plan");
  return res.json();
};

// ============= STATISTICS & DASHBOARD =============
export const getDashboardStats = async (workerId, zone) => {
  const [profile, triggers, risk] = await Promise.all([
    getWorkerProfile(workerId),
    getLiveTriggers(zone),
    getRiskScore(workerId)
  ]);
  
  return { profile, triggers, risk };
};