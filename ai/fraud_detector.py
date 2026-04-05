import numpy as np

def predict_fraud(model, data):
    """
    Rule-based fraud detection (simpler and more reliable)
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