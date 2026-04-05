// DeliverShield AI - Complete API Configuration

// ============================================
// PRODUCTION CONFIGURATION (Vercel + Render)
// ============================================

// Backend API - Render deployment
const API_BASE = 'https://delivershield-backend.onrender.com/api';

// AI Service - Render deployment  
const AI_BASE = 'https://devtrails-ai.onrender.com/evaluate';

// ============================================
// Helper: Wake up backend (fix Render cold start)
// ============================================
const wakeUpBackend = async () => {
  try {
    await fetch('https://delivershield-backend.onrender.com');
  } catch (e) {
    console.warn("Backend wake-up failed (ignored)");
  }
};

// ============================================
// Helper: Fetch with timeout (for AI calls)
// ============================================
const fetchWithTimeout = async (url, options = {}, timeout = 4000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// ============================================
// Helper: Get live location
// ============================================
const getLiveLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: 19.0760, lon: 72.8777 });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve({ lat: 19.0760, lon: 72.8777 }),
      { timeout: 4000 }
    );
  });
};

// ============= AUTHENTICATION =============

export const registerUser = async (name, email, phone, password) => {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });

    const text = await res.text();

    if (!res.ok) {
      throw new Error(text || 'Registration failed');
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginUser = async (phone, password) => {
  try {
    // 🔥 Wake backend first (fix slow login)
    await wakeUpBackend();

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

// ============= USER PROFILE =============

export const getWorkerProfile = async (workerId) => {
  try {
    const res = await fetch(`${API_BASE}/workers/${workerId}`);
    if (!res.ok) throw new Error("Profile fetch failed");
    return await res.json();
  } catch {
    return {
      id: workerId,
      name: "Ravi Kumar",
      totalEarnings: 12450
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
    gps_lon: coords.lon
  };

  try {
    const res = await fetchWithTimeout(`${AI_BASE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }, 4000);

    if (!res.ok) throw new Error("AI error");

    const data = await res.json();

    return {
      zone: zoneId,
      risk_level: data.risk_level || 'Moderate',
      live_conditions: data.live_conditions || {}
    };
  } catch (error) {
    console.warn("AI timeout, using fallback");

    return {
      zone: zoneId,
      risk_level: 'Moderate',
      live_conditions: {
        temperature_c: 32,
        rainfall_mm_hr: 20,
        aqi: 150
      }
    };
  }
};

// ============= PAYOUT SYSTEM =============

export const getPayoutHistory = async (workerId) => {
  try {
    const res = await fetch(`${API_BASE}/payouts/user/${workerId}`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return [];
  }
};

// ============= COVERAGE PLANS =============

export const getAvailablePlans = async () => {
  try {
    const res = await fetch(`${API_BASE}/plans`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return [];
  }
};

export const getMyPlan = async (workerId) => {
  try {
    const res = await fetch(`${API_BASE}/plans/active/${workerId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

export const activatePlan = async (workerId, planId) => {
  const res = await fetch(`${API_BASE}/plans/activate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: workerId, planId })
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || "Activation failed");
  }

  return JSON.parse(text);
};

// ============= DASHBOARD =============

export const getDashboardStats = async (workerId, zone) => {
  const profile = await getWorkerProfile(workerId);
  const triggers = await getLiveTriggers(zone);

  return { profile, triggers };
};