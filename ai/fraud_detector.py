import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib

FRAUD_FEATURES = [
    "gps_speed_variance",
    "location_jump_km",
    "num_deliveries",
    "active_hours",
    "daily_earnings_inr",
]

def train_fraud_detector(df):
    X = df[FRAUD_FEATURES].copy()
    
    # Isolation Forest: contamination = expected fraction of fraud (~5%)
    model = IsolationForest(
        n_estimators=200,
        contamination=0.05,
        random_state=42,
        max_samples="auto"
    )
    model.fit(X)
    
    # -1 = anomaly (fraud), 1 = normal
    df["fraud_flag"] = model.predict(X)
    df["fraud_score"] = model.decision_function(X)  # More negative = more suspicious
    df["is_fraud"] = df["fraud_flag"].apply(lambda x: True if x == -1 else False)

    fraud_count = df["is_fraud"].sum()
    print(f"Detected {fraud_count} suspicious workers out of {len(df)}")
    
    joblib.dump(model, "fraud_model.pkl")
    return model, df

def predict_fraud(model, worker_dict):
    X = pd.DataFrame([worker_dict])[FRAUD_FEATURES]
    pred = model.predict(X)[0]
    score = model.decision_function(X)[0]
    return {
        "is_fraud": pred == -1,
        "anomaly_score": round(score, 4),
        "verdict": "🚨 SUSPICIOUS - Flag for review" if pred == -1 else "✅ Normal activity"
    }

if __name__ == "__main__":
    df = pd.read_csv("worker_data.csv")
    model, df_flagged = train_fraud_detector(df)
    df_flagged.to_csv("worker_data_fraud_flagged.csv", index=False)

    # Test a suspicious worker (impossibly high speed variance + huge location jump)
    suspicious_worker = {
        "gps_speed_variance": 95.0,    # Abnormally high
        "location_jump_km": 50.0,      # Teleportation jump
        "num_deliveries": 38,
        "active_hours": 2.0,           # Too many deliveries in too little time
        "daily_earnings_inr": 1800,
    }
    result = predict_fraud(model, suspicious_worker)
    print(result)
