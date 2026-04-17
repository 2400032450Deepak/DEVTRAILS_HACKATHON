// Sensor data collector for advanced fraud detection
export class SensorCollector {
  constructor() {
    this.accelerometerData = [];
    this.batteryData = null;
    this.networkData = null;
    this.isCollecting = false;
    this.startTime = null;
  }

  async startCollection(durationMs = 5000) {
    this.isCollecting = true;
    this.startTime = Date.now();
    this.accelerometerData = [];
    
    // 1. Collect accelerometer data (motion patterns for riding detection)
    if ('DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', this.handleMotionEvent);
    }
    
    // 2. Get battery info (thermal correlation for fraud detection)
    if ('getBattery' in navigator) {
      try {
        const battery = await navigator.getBattery();
        this.batteryData = {
          level: battery.level,
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime
        };
        
        battery.addEventListener('levelchange', () => {
          this.batteryData.level = battery.level;
        });
        
        battery.addEventListener('chargingchange', () => {
          this.batteryData.charging = battery.charging;
        });
      } catch (e) {
        console.warn('Battery API not available:', e);
      }
    }
    
    // 3. Get network info
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      this.networkData = {
        effectiveType: connection.effectiveType,
        rtt: connection.rtt,
        downlink: connection.downlink,
        saveData: connection.saveData
      };
    }
    
    // Collect for specified duration
    return new Promise((resolve) => {
      setTimeout(() => {
        this.stopCollection();
        resolve(this.getFraudPayload());
      }, durationMs);
    });
  }

  handleMotionEvent = (event) => {
    if (!this.isCollecting) return;
    
    const accel = event.acceleration;
    if (accel) {
      this.accelerometerData.push({
        x: accel.x || 0,
        y: accel.y || 0,
        z: accel.z || 0,
        timestamp: Date.now()
      });
      
      // Keep last 200 samples
      if (this.accelerometerData.length > 200) {
        this.accelerometerData.shift();
      }
    }
  }

  stopCollection() {
    this.isCollecting = false;
    if ('DeviceMotionEvent' in window) {
      window.removeEventListener('devicemotion', this.handleMotionEvent);
    }
  }

  getMotionSignature() {
    if (this.accelerometerData.length === 0) {
      return { hasMotion: false, confidence: 0, avgAcceleration: 0, variance: 0 };
    }
    
    // Calculate motion intensity
    let totalAccel = 0;
    for (const sample of this.accelerometerData) {
      totalAccel += Math.sqrt(sample.x * sample.x + sample.y * sample.y + sample.z * sample.z);
    }
    const avgAccel = totalAccel / this.accelerometerData.length;
    
    // Calculate variance (for detecting consistent vs random motion)
    let variance = 0;
    for (const sample of this.accelerometerData) {
      const accel = Math.sqrt(sample.x * sample.x + sample.y * sample.y + sample.z * sample.z);
      variance += Math.pow(accel - avgAccel, 2);
    }
    variance = variance / this.accelerometerData.length;
    
    // Real riding has consistent motion between 1.5-3g with moderate variance
    const isRiding = avgAccel > 1.2 && avgAccel < 4.0 && variance < 2.0;
    const confidence = Math.min(100, Math.floor((avgAccel / 4) * 100));
    
    return {
      hasMotion: isRiding,
      confidence: confidence,
      avgAcceleration: parseFloat(avgAccel.toFixed(2)),
      variance: parseFloat(variance.toFixed(2)),
      sampleCount: this.accelerometerData.length
    };
  }

  getFraudPayload(userId = null, zone = null, lat = null, lon = null) {
    const motion = this.getMotionSignature();
    
    return {
      user_id: userId,
      zone: zone,
      gps_lat: lat,
      gps_lon: lon,
      has_motion: motion.hasMotion,
      motion_confidence: motion.confidence,
      avg_acceleration: motion.avgAcceleration,
      motion_variance: motion.variance,
      motion_samples: motion.sampleCount,
      battery_level: this.batteryData?.level || null,
      battery_charging: this.batteryData?.charging || null,
      network_type: this.networkData?.effectiveType || null,
      network_rtt: this.networkData?.rtt || null,
      timestamp: new Date().toISOString(),
      collection_duration_ms: this.startTime ? Date.now() - this.startTime : 0
    };
  }
}

// Helper to get current position with timeout
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 10000,
      enableHighAccuracy: true
    });
  });
};