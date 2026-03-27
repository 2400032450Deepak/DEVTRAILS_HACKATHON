import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report
import joblib

def assign_risk_label(row):
    score = 0
    if row["rainfall_mm_hr"] > 40: score += 3
    elif row["rainfall_mm_hr"] > 20: score += 2
    elif row["rainfall_mm_hr"] > 10: score += 1

    if row["aqi"] > 350: score += 3
    elif row["aqi"] > 200: score += 2
    elif row["aqi"] > 100: score += 1

    if row["temperature_c"] > 42 or row["temperature_c"] < 18: score += 2
    elif row["temperature_c"] > 38: score += 1

    if row["humidity_pct"] > 85: score += 1

    if score >= 5: return "High"
    elif score >= 2: return "Medium"
    else: return "Low"

def train_risk_model(df):
    df["risk_label"] = df.apply(assign_risk_label, axis=1)

    features = ["rainfall_mm_hr", "temperature_c", "aqi",
                "humidity_pct", "active_hours", "num_deliveries"]
    X = df[features]
    
    le = LabelEncoder()
    y = le.fit_transform(df["risk_label"])  # 0=High, 1=Low, 2=Medium

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    print(classification_report(y_test, model.predict(X_test),
                                 target_names=le.classes_))
    joblib.dump(model, "risk_model.pkl")
    joblib.dump(le, "risk_label_encoder.pkl")
    return model, le, df

def predict_risk(model, le, input_dict):
    features = ["rainfall_mm_hr", "temperature_c", "aqi",
                "humidity_pct", "active_hours", "num_deliveries"]
    X = pd.DataFrame([input_dict])[features]
    pred = model.predict(X)
    return le.inverse_transform(pred)[0]  # Returns "Low", "Medium", "High"

if __name__ == "__main__":
    df = pd.read_csv("worker_data.csv")
    model, le, df_labeled = train_risk_model(df)
    df_labeled.to_csv("worker_data_labeled.csv", index=False)
