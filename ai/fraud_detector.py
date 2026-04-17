import joblib
import numpy as np
import os
from sklearn.ensemble import IsolationForest

class FraudDetector:
    def __init__(self):
        self.model = None
        self.load_or_train_model()
    
    def load_or_train_model(self):
        """Load trained Isolation Forest model"""
        model_path = "fraud_model.pkl"
        
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
            print("✅ Loaded existing fraud model")
        else:
            self.train_model()
    
    def train_model(self):
        """Train Isolation Forest for anomaly detection"""
        # Generate synthetic normal data (80% of samples)
        np.random.seed(42)
        normal_data = []
        
        # Normal patterns
        for _ in range(200):
            normal_data.append([
                np.random.uniform(1, 8),      # gps_speed_variance
                np.random.uniform(0, 2),      # location_jump_km
                np.random.uniform(4, 12),     # active_hours
                np.random.uniform(0.5, 2),    # motion_variance
                np.random.uniform(1, 5)       # claim_frequency
            ])
        
        # Anomalous patterns (fraud)
        fraud_data = []
        for _ in range(50):
            fraud_data.append([
                np.random.uniform(15, 30),    # high gps_speed_variance
                np.random.uniform(5, 15),     # large location_jump
                np.random.uniform(16, 20),    # excessive hours
                np.random.uniform(5, 10),     # high motion_variance
                np.random.uniform(10, 20)     # high claim_frequency
            ])
        
        X_train = np.array(normal_data + fraud_data)
        
        self.model = IsolationForest(contamination=0.2, random_state=42)
        self.model.fit(X_train)
        joblib.dump(self.model, "fraud_model.pkl")
        print("✅ Trained new fraud detection model")
    
    def predict_fraud(self, data):
        """
        Enhanced fraud detection with ML + sensor data
        Returns anomaly score (-1 to 1, lower = more anomalous)
        """
        # Extract features
        gps_speed_variance = data.get('gps_speed_variance', 0)
        location_jump = data.get('location_jump_km', 0)
        active_hours = data.get('active_hours', 0)
        motion_variance = data.get('motion_variance', 0)
        
        # Calculate claim frequency from historical data
        claim_frequency = data.get('claim_frequency', 0)
        
        features = [[
            min(gps_speed_variance, 30),
            min(location_jump, 15),
            min(active_hours, 20),
            min(motion_variance, 10),
            min(claim_frequency, 20)
        ]]
        
        # ML anomaly score
        ml_score = self.model.decision_function(features)[0]
        ml_anomaly = ml_score < -0.2
        
        # Sensor-based rules (still useful for specific cases)
        reasons = []
        rule_fraud = False
        
        if gps_speed_variance > 15:
            rule_fraud = True
            reasons.append("Unrealistic GPS speed variance")
        
        if location_jump > 5:
            rule_fraud = True
            reasons.append("Impossible location jump")
        
        if active_hours > 16:
            rule_fraud = True
            reasons.append("Excessive working hours")
        
        # Combine ML and rules
        is_fraud = ml_anomaly or rule_fraud
        
        # Calculate anomaly score (0-1, higher = more anomalous)
        anomaly_score = max(0, min(1, (1 - ml_score) / 2))
        if rule_fraud:
            anomaly_score = max(anomaly_score, 0.5)
        
        return {
            "is_fraud": is_fraud,
            "verdict": "Fraudulent" if is_fraud else "Normal",
            "anomaly_score": round(anomaly_score, 2),
            "ml_anomaly_score": round(float(ml_score), 2),
            "reasons": reasons,
            "confidence": anomaly_score if is_fraud else 1 - anomaly_score
        }

# Singleton instance
_fraud_detector = None

def get_fraud_detector():
    global _fraud_detector
    if _fraud_detector is None:
        _fraud_detector = FraudDetector()
    return _fraud_detector

# Legacy function for backward compatibility
def predict_fraud(model, data):
    """Legacy function - now uses ML"""
    detector = get_fraud_detector()
    return detector.predict_fraud(data)

def detect_sensor_fraud(sensor_data):
    """Multi-signal fraud detection with ML"""
    detector = get_fraud_detector()
    return detector.predict_fraud(sensor_data)

if __name__ == "__main__":
    # Test the fraud detector
    detector = get_fraud_detector()
    
    test_cases = [
        {"gps_speed_variance": 2, "location_jump_km": 0.5, "active_hours": 8, "motion_variance": 1, "claim_frequency": 2},
        {"gps_speed_variance": 20, "location_jump_km": 8, "active_hours": 18, "motion_variance": 6, "claim_frequency": 15},
    ]
    
    for test in test_cases:
        result = detector.predict_fraud(test)
        print(f"Input: {test}")
        print(f"Result: {result}\n")