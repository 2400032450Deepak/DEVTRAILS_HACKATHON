// DeliverShield AI - Complete API Configuration

// ============================================
// PRODUCTION CONFIGURATION
// ============================================

const API_BASE = 'https://delivershield-backend.onrender.com/api';
const AI_BASE = 'https://devtrails-ai.onrender.com/evaluate';

// ============================================
// Helper: Wake up backend (fix Render cold start)
// ============================================
const wakeUpBackend = async () => {
  try {
    await fetch('https://delivershield-backend.onrender.com');
  } catch {
    console.warn("Backend wake-up skipped");
  }
};

// ============================================
// Helper: Fetch with timeout (prevents hanging)
// ============================================
const fetchWithTimeout = async (url, options = {}, timeout = 4000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
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
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        }),
      () => resolve({ lat: 19.0760, lon: 72.8777 }),
      { timeout: 4000 }
    );
  });
};

// ============================================
// AUTH
// ============================================

export const registerUser = async (name, email, phone, password) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone, password })
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || "Registration failed");
  }

  return JSON.parse(text);
};

export const loginUser = async (phone, password) => {
  try {
    // 🔥 Wake backend first
    await wakeUpBackend();

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });

    const text = await res.text();

    if (!res.ok) {
      throw new Error(text || "Invalid credentials");
    }

    try {
      return JSON.parse(text);
    } catch {
      return { userId: text, user: { id: text } };
    }
  } catch (err) {
    console.error("Login error:", err);
    throw err;
  }
};

// Replace the existing googleLogin function with this:
export const googleLogin = async () => {
  try {
    // Redirect to backend's Google OAuth endpoint
    window.location.href = 'https://delivershield-backend.onrender.com/oauth2/authorization/google';
  } catch (err) {
    console.error("Google login error:", err);
    throw err;
  }
};

// ============================================
// PROFILE
// ============================================

export const getWorkerProfile = async (workerId) => {
  try {
    const res = await fetch(`${API_BASE}/workers/${workerId}`);
    if (!res.ok) throw new Error();

    return await res.json();
  } catch {
    return {
      id: workerId,
      name: "Ravi Kumar",
      totalEarnings: 12450
    };
  }
};

// ============================================
// AI + LIVE DATA
// ============================================

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
    });

    if (!res.ok) throw new Error();

    const data = await res.json();

    return {
      zone: zoneId,
      risk_level: data.risk_level || "Moderate",
      live_conditions: data.live_conditions || {}
    };
  } catch {
    return {
      zone: zoneId,
      risk_level: "Moderate",
      live_conditions: {
        temperature_c: 32,
        rainfall_mm_hr: 20,
        aqi: 150
      }
    };
  }
};

export const getRiskScore = async (workerId) => {
  const coords = await getLiveLocation();

  const payload = {
    worker_id: workerId,
    zone: "Zone_B_Mumbai",
    gps_lat: coords.lat,
    gps_lon: coords.lon
  };

  try {
    const res = await fetchWithTimeout(`${AI_BASE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error();

    const data = await res.json();

    return {
      worker_id: workerId,
      risk_level: data.risk_level || "Moderate",
      risk_score:
        data.risk_level === "High"
          ? 85
          : data.risk_level === "Low"
          ? 25
          : 55
    };
  } catch {
    return {
      worker_id: workerId,
      risk_level: "Moderate",
      risk_score: 55
    };
  }
};

// ============================================
// PAYOUTS
// ============================================

export const getPayoutHistory = async (workerId) => {
  try {
    const res = await fetch(`${API_BASE}/payouts/user/${workerId}`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return [];
  }
};

// ============================================
// PLANS
// ============================================

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
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: workerId, planId })
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || "Activation failed");
  }

  return JSON.parse(text);
};

// ============================================
// DASHBOARD
// ============================================

export const getDashboardStats = async (workerId, zone) => {
  const profile = await getWorkerProfile(workerId);
  const triggers = await getLiveTriggers(zone);
  const risk = await getRiskScore(workerId);

  return { profile, triggers, risk };
};