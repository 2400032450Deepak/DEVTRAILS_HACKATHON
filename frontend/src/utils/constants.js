// DeliverShield AI Constants

export const ZONES = {
  ZONE_A_BANGALORE: 'Zone_A_Bangalore',
  ZONE_B_MUMBAI: 'Zone_B_Mumbai',
  ZONE_C_DELHI: 'Zone_C_Delhi',
  ZONE_D_HYDERABAD: 'Zone_D_Hyderabad',
  ZONE_E_CHENNAI: 'Zone_E_Chennai',
};

export const ZONE_DISPLAY_NAMES = {
  [ZONES.ZONE_A_BANGALORE]: 'Bangalore',
  [ZONES.ZONE_B_MUMBAI]: 'Mumbai',
  [ZONES.ZONE_C_DELHI]: 'Delhi',
  [ZONES.ZONE_D_HYDERABAD]: 'Hyderabad',
  [ZONES.ZONE_E_CHENNAI]: 'Chennai',
};

export const TRIGGER_THRESHOLDS = {
  RAINFALL: { value: 40, unit: 'mm/hr', label: 'Heavy Rainfall' },
  AQI: { value: 300, unit: '', label: 'Air Quality' },
  TEMPERATURE: { value: 42, unit: '°C', label: 'Extreme Heat' },
};

export const PREMIUM_TIERS = {
  TIER_1: { id: 1, name: 'Tier 1 - Premium', premium: 35, coverage: 1500, color: '#f59e0b' },
  TIER_2: { id: 2, name: 'Tier 2 - Standard', premium: 25, coverage: 1000, color: '#10b981' },
  TIER_3: { id: 3, name: 'Tier 3 - Basic', premium: 20, coverage: 750, color: '#6b7280' },
};

export const COVERED_EVENTS = [
  { name: 'Heavy Rainfall', threshold: '> 40 mm/hr', payout: '₹300-500' },
  { name: 'Extreme Heat', threshold: '> 42°C', payout: '₹200-400' },
  { name: 'High Pollution', threshold: 'AQI > 300', payout: '₹250-450' },
  { name: 'Traffic Congestion', threshold: 'Severe', payout: '₹150-300' },
  { name: 'Platform Downtime', threshold: '> 30 min', payout: '₹200-350' },
];