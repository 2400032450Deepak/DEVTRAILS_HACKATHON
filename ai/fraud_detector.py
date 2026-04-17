# No need to import numpy - it's not used in this file

def predict_fraud(model, data):
    """
    Enhanced fraud detection with sensor data
    """
    # Extract features
    daily_earnings = data.get('daily_earnings_inr', 0)
    weekly_earnings = data.get('weekly_earnings_inr', 0)
    num_deliveries = data.get('num_deliveries', 0)
    active_hours = data.get('active_hours', 0)
    gps_speed_variance = data.get('gps_speed_variance', 0)
    location_jump = data.get('location_jump_km', 0)
    rainfall = data.get('rainfall_mm_hr', 0)
    aqi = data.get('aqi', 0)
    
    # New sensor-based features
    has_motion = data.get('has_motion', True)
    motion_confidence = data.get('motion_confidence', 50)
    is_charging = data.get('battery_charging', False)
    external_temp = data.get('external_temperature_c', 30)
    
    # Rule-based fraud detection
    is_fraud = False
    reasons = []
    anomaly_score = 0
    
    # Rule 1: Suspicious GPS patterns
    if gps_speed_variance > 15:
        is_fraud = True
        reasons.append("Unrealistic GPS speed variance")
        anomaly_score += 0.3
    
    # Rule 2: Impossible location jumps
    if location_jump > 5:
        is_fraud = True
        reasons.append("Impossible location jump")
        anomaly_score += 0.3
    
    # Rule 3: Working too many hours
    if active_hours > 16:
        is_fraud = True
        reasons.append("Excessive working hours")
        anomaly_score += 0.2
    
    # Rule 4: Unrealistic delivery count
    if num_deliveries > 50:
        is_fraud = True
        reasons.append("Unrealistic delivery count")
        anomaly_score += 0.2
    
    # Rule 5: Abnormal earnings
    if daily_earnings > 2000:
        is_fraud = True
        reasons.append("Abnormally high daily earnings")
        anomaly_score += 0.2
    
    if weekly_earnings > 15000:
        is_fraud = True
        reasons.append("Abnormally high weekly earnings")
        anomaly_score += 0.2
    
    # Rule 6: No motion detected (from sensor)
    if not has_motion and motion_confidence < 30:
        is_fraud = True
        reasons.append("No motion detected - possible GPS spoofing")
        anomaly_score += 0.25
    
    # Rule 7: Charging during high temperature
    if is_charging and not has_motion and external_temp > 38:
        is_fraud = True
        reasons.append("Charging indoors during heatwave")
        anomaly_score += 0.2
    
    # Cap anomaly score at 1.0
    anomaly_score = min(anomaly_score, 1.0)
    
    # If no fraud detected, score is 0
    if not is_fraud:
        anomaly_score = 0.0
    
    return {
        "is_fraud": is_fraud,
        "verdict": "Fraudulent" if is_fraud else "Normal",
        "anomaly_score": anomaly_score,
        "reasons": reasons,
        "confidence": 1.0 if is_fraud else 0.0
    }


def detect_sensor_fraud(sensor_data):
    """
    Multi-signal fraud detection based on:
    - Accelerometer patterns (real riding vs stationary spoofing)
    - Battery thermal correlation (indoor vs outdoor)
    - Network consistency
    """
    fraud_score = 0
    reasons = []
    
    # Layer 6: Accelerometer-based motion detection
    has_motion = sensor_data.get('has_motion', False)
    motion_confidence = sensor_data.get('motion_confidence', 0)
    avg_acceleration = sensor_data.get('avg_acceleration', 0)
    
    if not has_motion and motion_confidence < 30:
        fraud_score += 25
        reasons.append("No motion detected - possible GPS spoofing")
    elif has_motion and motion_confidence > 70:
        fraud_score -= 10  # Legitimate rider
    
    # Layer 7: Battery thermal correlation
    battery_level = sensor_data.get('battery_level')
    is_charging = sensor_data.get('battery_charging', False)
    external_temp = sensor_data.get('external_temperature_c', 30)
    
    # Spoofing detection: If phone is charging and no motion in high heat
    if is_charging and not has_motion and external_temp > 38:
        fraud_score += 20
        reasons.append("Charging indoors during heatwave - potential spoof")
    
    # Layer 8: Network consistency
    network_type = sensor_data.get('network_type', 'unknown')
    gps_accuracy = sensor_data.get('gps_accuracy', 0)
    
    if network_type == 'unknown' and gps_accuracy > 50:
        fraud_score += 15
        reasons.append("GPS active but no network - possible mock location")
    
    # Layer 9: Motion variance analysis
    motion_variance = sensor_data.get('motion_variance', 0)
    if motion_variance > 5:
        fraud_score += 10
        reasons.append("Erratic motion pattern - possible GPS drift")
    
    # Layer 10: Time-based anomaly detection
    active_hours = sensor_data.get('active_hours', 0)
    if active_hours > 16:
        fraud_score += 10
        reasons.append("Excessive working hours - possible account sharing")
    
    return {
        "is_fraud": fraud_score > 40,
        "fraud_score": min(fraud_score, 100),
        "reasons": reasons,
        "verdict": "Flagged" if fraud_score > 40 else "Normal"
    }
