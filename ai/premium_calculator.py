import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import os

class PremiumCalculator:
    def __init__(self):
        self.model = None
        self.load_or_train_model()
    
    def load_or_train_model(self):
        """Load trained model or train new one"""
        model_path = "premium_model.pkl"
        
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
            print("✅ Loaded existing premium model")
        else:
            self.train_model()
    
    def train_model(self):
        """Train Random Forest model for premium prediction"""
        # Sample training data (in production, use real historical data)
        # Features: risk_score, weekly_earnings, num_deliveries, zone_risk, historical_claims
        X_train = np.array([
            [20, 3000, 10, 1.0, 0.1],   # Low risk, low earnings → ₹22
            [40, 4500, 15, 1.0, 0.2],   # Medium risk → ₹27
            [60, 6000, 20, 1.2, 0.3],   # High risk, Mumbai → ₹32
            [80, 8000, 25, 1.3, 0.4],   # Very high risk, Delhi → ₹38
            [30, 3500, 12, 1.1, 0.15],  # Hyderabad → ₹25
            [50, 5000, 18, 1.15, 0.25], # Chennai → ₹30
            [25, 2800, 8, 1.0, 0.08],   # Low risk, low earnings → ₹20
            [70, 7000, 22, 1.2, 0.35],  # High risk → ₹35
        ])
        
        y_train = np.array([22, 27, 32, 38, 25, 30, 20, 35])  # Premiums
        
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.model.fit(X_train, y_train)
        joblib.dump(self.model, "premium_model.pkl")
        print("✅ Trained new premium model")
    
    def calculate_premium(self, risk_score, weekly_earnings, num_deliveries, zone):
        """
        Calculate premium using ML model
        risk_score: 0-100 (from risk model)
        weekly_earnings: ₹
        num_deliveries: count per week
        zone: Zone code
        """
        # Zone risk multiplier
        zone_multipliers = {
            "Zone_A_Bangalore": 1.0,
            "Zone_B_Mumbai": 1.2,
            "Zone_C_Delhi": 1.3,
            "Zone_D_Hyderabad": 1.1,
            "Zone_E_Chennai": 1.15,
        }
        zone_risk = zone_multipliers.get(zone, 1.0)
        
        # Historical claims rate (simulated)
        historical_claims = 0.1 + (risk_score / 500)  # 0.1 to 0.3
        
        features = [[
            risk_score,
            min(weekly_earnings, 10000),
            min(num_deliveries, 50),
            zone_risk,
            historical_claims
        ]]
        
        predicted_premium = self.model.predict(features)[0]
        
        # Clamp within ₹20-₹45 range
        premium = round(max(20, min(45, predicted_premium)), 2)
        return premium

# Singleton instance
_premium_calculator = None

def get_premium_calculator():
    global _premium_calculator
    if _premium_calculator is None:
        _premium_calculator = PremiumCalculator()
    return _premium_calculator

# Legacy function for backward compatibility
def calculate_premium(risk_label, weekly_earnings, num_deliveries, zone):
    """Legacy function - now uses ML"""
    # Convert risk label to score
    risk_score_map = {"Low": 25, "Medium": 55, "High": 85}
    risk_score = risk_score_map.get(risk_label, 50)
    
    calculator = get_premium_calculator()
    return calculator.calculate_premium(risk_score, weekly_earnings, num_deliveries, zone)

if __name__ == "__main__":
    test_cases = [
        ("Low", 4500, 15, "Zone_A_Bangalore"),
        ("Medium", 6000, 22, "Zone_B_Mumbai"),
        ("High", 8000, 30, "Zone_C_Delhi"),
        ("Medium", 5000, 18, "Zone_D_Hyderabad"),
    ]
    for risk, earn, deliv, zone in test_cases:
        p = calculate_premium(risk, earn, deliv, zone)
        print(f"Risk={risk}, Earnings=₹{earn}, Zone={zone} → Premium=₹{p}/week")