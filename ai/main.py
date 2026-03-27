import pandas as pd
from data_generator import generate_data
from risk_model import train_risk_model, predict_risk
from premium_calculator import calculate_premium
from payout_engine import calculate_payout
from fraud_detector import train_fraud_detector, predict_fraud
import joblib

# --- STEP 1: Generate data ---
df = generate_data(n=500)
df.to_csv("worker_data.csv", index=False)

# --- STEP 2: Train models ---
risk_model, le, df = train_risk_model(df)
fraud_model, df = train_fraud_detector(df)

# --- STEP 3: Simulate a real-time worker event ---
live_worker = {
    "worker_id": "W9999",
    "zone": "Zone_B_Mumbai",
    "rainfall_mm_hr": 52.0,
    "temperature_c": 32.0,
    "aqi": 375.0,
    "humidity_pct": 88.0,
    "active_hours": 9.0,
    "num_deliveries": 12,
    "daily_earnings_inr": 870.0,
    "weekly_earnings_inr": 5600.0,
    "gps_speed_variance": 3.2,
    "location_jump_km": 1.8,
}

# --- STEP 4: Risk Assessment ---
risk = predict_risk(risk_model, le, live_worker)
print(f"\n🔍 Risk Level: {risk}")

# --- STEP 5: Premium ---
premium = calculate_premium(
    risk, live_worker["weekly_earnings_inr"],
    live_worker["num_deliveries"], live_worker["zone"])
print(f"💰 Weekly Premium: ₹{premium}")

# --- STEP 6: Payout ---
env_data = {k: live_worker[k] for k in
            ["rainfall_mm_hr", "aqi", "temperature_c", "humidity_pct"]}
payout_result = calculate_payout(live_worker, env_data, risk)
print(f"\n📋 Payout Result:")
for k, v in payout_result.items():
    print(f"   {k}: {v}")

# --- STEP 7: Fraud Check ---
fraud_result = predict_fraud(fraud_model, live_worker)
print(f"\n🛡️ Fraud Check: {fraud_result['verdict']}")
print(f"   Anomaly Score: {fraud_result['anomaly_score']}")
