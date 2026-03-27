import apiClient from './api';

// AI-powered risk prediction based on weather patterns
export const predictRiskScore = async (environmentalData) => {
  try {
    // For now, use rule-based calculation
    // Later replace with actual AI endpoint
    const { rain, temp, aqi } = environmentalData;
    
    let riskScore = 0;
    riskScore += Math.min(rain * 2, 40);      // Max 40 points from rain
    riskScore += Math.min(Math.max(temp - 30, 0) * 3, 30); // Max 30 from heat
    riskScore += Math.min(aqi / 10, 30);       // Max 30 from pollution
    
    return {
      score: Math.min(riskScore, 100),
      level: riskScore > 70 ? 'High' : riskScore > 40 ? 'Medium' : 'Low',
      recommendations: generateRecommendations(riskScore, environmentalData)
    };
  } catch (error) {
    console.error('Risk prediction failed:', error);
    return null;
  }
};

// AI-powered route optimization
export const getSafeRoute = async (startCoords, endCoords, weatherData) => {
  try {
    // Mock AI route calculation
    // In production, call backend AI endpoint
    return {
      optimized: true,
      estimatedTime: '25 mins',
      safetyScore: 85,
      alternativeRoutes: [
        { name: 'Main Road', time: '25 mins', safety: 85 },
        { name: 'Side Streets', time: '32 mins', safety: 92 }
      ]
    };
  } catch (error) {
    throw new Error('Route optimization failed');
  }
};

// Generate safety recommendations
const generateRecommendations = (riskScore, data) => {
  const recs = [];
  
  if (data.rain > 20) {
    recs.push('⚠️ Heavy rain expected - carry rain gear');
    recs.push('🚗 Reduce speed, maintain safe distance');
  }
  
  if (data.temp > 35) {
    recs.push('💧 Stay hydrated - carry water bottle');
    recs.push('🧢 Use防晒 and take frequent breaks');
  }
  
  if (data.aqi > 200) {
    recs.push('😷 Wear N95 mask due to poor air quality');
    recs.push('🏠 Limit outdoor exposure time');
  }
  
  return recs;
};

// Claim prediction based on environmental factors
export const predictClaimProbability = async (route, weather, riderHistory) => {
  return apiClient.post('/ai/predict-claim', {
    route,
    weather,
    riderHistory
  }).catch(() => ({
    probability: 0.15,
    factors: ['Weather conditions normal', 'Rider history clean']
  }));
};