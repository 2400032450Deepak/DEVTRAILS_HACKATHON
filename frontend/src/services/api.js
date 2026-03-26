import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";
const USE_MOCK_API = (process.env.REACT_APP_USE_MOCK_API || "true") === "true";

// NOTE: Frontend keys are exposed at build time. In production, proxy weather calls from backend.
const OPEN_WEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY || "";
const MISSING_API_KEY_MESSAGE = "Live weather unavailable";
console.log("API KEY:", process.env.REACT_APP_OPENWEATHER_API_KEY);
const DEFAULT_COORDS = {
  lat: Number(process.env.REACT_APP_DEFAULT_LAT || 28.6139),
  lon: Number(process.env.REACT_APP_DEFAULT_LON || 77.209)
};
const ENV_CACHE_TTL_MS = 45000;

let envCache = {
  timestamp: 0,
  data: null
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    "Content-Type": "application/json"
  }
});

const weatherClient = axios.create({
  baseURL: "https://api.openweathermap.org/data/2.5",
  timeout: 12000
});
const geoClient = axios.create({
  baseURL: "https://api.openweathermap.org/geo/1.0",
  timeout: 12000
});

const readApiError = (error, fallbackMessage) => {
  return error?.response?.data?.message || error?.response?.data?.error || error?.message || fallbackMessage;
};

const isWeatherAuthError = (error) => {
  const status = Number(error?.response?.status || 0);
  const message = String(readApiError(error, "") || "").toLowerCase();
  return status === 401 || status === 403 || message.includes("invalid api key") || message.includes("api key");
};

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("deliverShieldToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("deliverShieldToken");
      localStorage.removeItem("deliverShieldState");
    }
    return Promise.reject(error);
  }
);

const mockDelay = (ms = 700) => new Promise((resolve) => setTimeout(resolve, ms));

const mockPlans = [
  { id: 1, name: "Starter Shield", premium: 20, coverage: 1000 },
  { id: 2, name: "Pro Shield", premium: 25, coverage: 1200 },
  { id: 3, name: "Max Shield", premium: 35, coverage: 1500 }
];

const mockPayouts = [
  { id: 501, date: "2026-03-10", reason: "Heavy Rain Detected", amount: 300 },
  { id: 502, date: "2026-03-18", reason: "High AQI Exposure", amount: 240 }
];
const DEMO_PHONE = "9876543210";
const DEMO_OTP = "123456";

const withFallback = async (realCall, mockCall) => {
  if (USE_MOCK_API) {
    return mockCall();
  }
  return realCall();
};

const normalizeAQI = (owmAQI) => {
  const map = {
    1: 40,
    2: 95,
    3: 185,
    4: 290,
    5: 380
  };
  return map[owmAQI] || 0;
};

const deriveRiskLabel = ({ rain, temp, aqi }) => {
  if (rain >= 40 || aqi >= 250 || temp >= 40) return "Triggered";
  if (rain >= 15 || aqi >= 120 || temp >= 35) return "Risk";
  return "Safe";
};

export const getUserLocation = async () => {
  if (typeof window === "undefined" || !window.navigator?.geolocation) {
    return { ...DEFAULT_COORDS, source: "fallback", reason: "GEOLOCATION_UNAVAILABLE" };
  }

  return new Promise((resolve) => {
    window.navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: Number(position.coords.latitude),
          lon: Number(position.coords.longitude),
          source: "live"
        });
      },
      (error) => {
        const reason = error?.code === 1 ? "LOCATION_PERMISSION_DENIED" : "LOCATION_FETCH_FAILED";
        resolve({ ...DEFAULT_COORDS, source: "fallback", reason });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  });
};

export const getWeatherData = async (lat, lon) => {
  if (!OPEN_WEATHER_API_KEY) {
    throw new Error(MISSING_API_KEY_MESSAGE);
  }

  const response = await weatherClient.get("/weather", {
    params: {
      lat,
      lon,
      appid: OPEN_WEATHER_API_KEY,
      units: "metric"
    }
  });

  const payload = response.data || {};
  const temp = Number(payload?.main?.temp ?? 0);
  const rainFrom1h = Number(payload?.rain?.["1h"] ?? 0);
  const rainFrom3h = Number(payload?.rain?.["3h"] ?? 0);
  const rain = rainFrom1h || rainFrom3h || 0;

  return {
    temp: Number(temp.toFixed(1)),
    rain: Number(rain.toFixed(1))
  };
};

export const getAQIData = async (lat, lon) => {
  if (!OPEN_WEATHER_API_KEY) {
    throw new Error(MISSING_API_KEY_MESSAGE);
  }

  const response = await weatherClient.get("/air_pollution", {
    params: {
      lat,
      lon,
      appid: OPEN_WEATHER_API_KEY
    }
  });

  const rawAqi = Number(response?.data?.list?.[0]?.main?.aqi ?? 0);
  return {
    rawAqi,
    aqi: normalizeAQI(rawAqi)
  };
};

export const getCityName = async (lat, lon) => {
  if (!OPEN_WEATHER_API_KEY) {
    return null;
  }

  try {
    // NOTE: In production, this should be proxied through backend to avoid exposing API keys.
    const request = geoClient.get("/reverse", {
      params: {
        lat,
        lon,
        limit: 1,
        appid: OPEN_WEATHER_API_KEY
      }
    });
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));
    const response = await Promise.race([request, timeout]);

    const city = response?.data?.[0]?.name || "";
    const country = response?.data?.[0]?.country || "";

    if (!city) {
      return null;
    }

    return {
      city,
      state: response?.data?.[0]?.state || "",
      country
    };
  } catch (error) {
    console.error("City reverse geocoding failed", error);
    return null;
  }
};

export const formatCityLabel = (place = {}) => {
  return [place.city, place.country].filter(Boolean).join(", ");
};

export const getLiveEnvironmentalData = async ({ forceRefresh = false, locationCoords = null, enableLiveLocation = false } = {}) => {
  const now = Date.now();
  if (!forceRefresh && envCache.data && now - envCache.timestamp < ENV_CACHE_TTL_MS) {
    return envCache.data;
  }

  try {
    let location = null;
    if (locationCoords?.lat && locationCoords?.lon) {
      location = { lat: Number(locationCoords.lat), lon: Number(locationCoords.lon), source: "live" };
    } else if (enableLiveLocation) {
      location = await getUserLocation();
    } else {
      location = { ...DEFAULT_COORDS, source: "fallback", reason: "LIVE_LOCATION_NOT_ENABLED" };
    }

    const [weather, aqiData] = await Promise.all([getWeatherData(location.lat, location.lon), getAQIData(location.lat, location.lon)]);

    const combined = {
      rain: weather.rain,
      temp: weather.temp,
      aqi: aqiData.aqi,
      label: deriveRiskLabel({ rain: weather.rain, temp: weather.temp, aqi: aqiData.aqi }),
      location
    };

    envCache = { timestamp: now, data: combined };
    return combined;
  } catch (error) {
    if (envCache.data) {
      const cachedError = isWeatherAuthError(error) ? MISSING_API_KEY_MESSAGE : readApiError(error, "Using cached environmental data");
      return {
        ...envCache.data,
        location: { ...envCache.data.location, source: "cache" },
        error: cachedError
      };
    }

    const fallbackError = readApiError(error, "Unable to fetch live environmental data");
    const fallback = {
      rain: 0,
      temp: 30,
      aqi: 95,
      label: "Risk",
      location: { ...DEFAULT_COORDS, source: "fallback", reason: "LIVE_API_UNAVAILABLE" },
      error: isWeatherAuthError(error) ? MISSING_API_KEY_MESSAGE : fallbackError
    };

    envCache = { timestamp: now, data: fallback };
    return fallback;
  }
};

export const loginUser = async (payload) => {
  return withFallback(
    async () => {
      const response = await apiClient.post("/login", payload);
      return response.data;
    },
    async () => {
      await mockDelay(800);
      return {
        token: "mock-jwt-token",
        user: {
          id: Date.now(),
          name: payload.name || "Delivery Partner",
          contact: payload.contact
        }
      };
    }
  ).catch((error) => {
    throw new Error(readApiError(error, "Login failed"));
  });
};

export const loginWithEmailPassword = async ({ email, password }) => {
  return withFallback(
    async () => {
      const response = await apiClient.post("/login", { email, password });
      return response.data;
    },
    async () => {
      await mockDelay(700);
      if (!email || !password) {
        throw new Error("Invalid email or password");
      }
      return {
        token: "mock-jwt-token",
        user: {
          id: Date.now(),
          name: "Delivery Partner",
          contact: email
        }
      };
    }
  ).catch((error) => {
    throw new Error(readApiError(error, "Unable to login. Please try again."));
  });
};

// Backend will handle OTP generation and verification.
export const sendOtp = async (phone) => {
  if (USE_MOCK_API) {
    await mockDelay(500);
    if (phone !== DEMO_PHONE) {
      throw new Error("Use demo number 9876543210");
    }
    return { success: true, message: "OTP sent successfully" };
  }

  try {
    const response = await apiClient.post("/send-otp", { phone });
    return response.data;
  } catch (error) {
    throw new Error(readApiError(error, "Something went wrong"));
  }
};

// Backend will handle OTP generation and verification.
export const verifyOtp = async (phone, otp) => {
  if (USE_MOCK_API) {
    await mockDelay(600);
    if (phone !== DEMO_PHONE) {
      throw new Error("Use demo number 9876543210");
    }
    if (otp !== DEMO_OTP) {
      throw new Error("Invalid OTP");
    }
    return {
      token: "demo-jwt-token",
      user: {
        id: 1001,
        name: "Demo Rider",
        contact: phone
      }
    };
  }

  try {
    const response = await apiClient.post("/verify-otp", { phone, otp });
    return response.data;
  } catch (error) {
    throw new Error(readApiError(error, "Something went wrong"));
  }
};

export const getPlans = async () => {
  return withFallback(
    async () => {
      const response = await apiClient.get("/plans");
      return response.data;
    },
    async () => {
      await mockDelay(600);
      return mockPlans;
    }
  ).catch((error) => {
    throw new Error(readApiError(error, "Unable to fetch plans"));
  });
};

export const activatePlan = async (payload) => {
  return withFallback(
    async () => {
      const response = await apiClient.post("/activate-plan", payload);
      return response.data;
    },
    async () => {
      await mockDelay(900);
      const plan = mockPlans.find((item) => item.id === payload.planId);
      return {
        success: true,
        message: "Plan activated",
        activePlan: plan || null,
        activatedAt: new Date().toISOString()
      };
    }
  ).catch((error) => {
    throw new Error(readApiError(error, "Plan activation failed"));
  });
};

export const getStatus = async () => {
  return getLiveEnvironmentalData();
};

export const getPayouts = async () => {
  return withFallback(
    async () => {
      const response = await apiClient.get("/payouts");
      return response.data;
    },
    async () => {
      await mockDelay(700);
      return mockPayouts;
    }
  ).catch((error) => {
    throw new Error(readApiError(error, "Unable to fetch payouts"));
  });
};

export const createPayment = async (payload) => {
  return withFallback(
    async () => {
      const response = await apiClient.post("/payment", payload);
      return response.data;
    },
    async () => {
      await mockDelay(1200);

      if (payload.simulateFailure) {
        return {
          success: false,
          status: "FAILED",
          message: "Payment simulation failed"
        };
      }

      return {
        success: true,
        status: "SUCCESS",
        paymentId: `PAY-${Date.now()}`,
        gateway: payload.gateway || "SIMULATED",
        amount: payload.amount
      };
    }
  ).catch((error) => {
    throw new Error(readApiError(error, "Payment request failed"));
  });
};

export { apiClient, weatherClient, geoClient, API_BASE_URL, USE_MOCK_API, OPEN_WEATHER_API_KEY };

export default apiClient;

// Backend-friendly method aliases.
export const login = loginUser;
export const initiatePayment = createPayment;
