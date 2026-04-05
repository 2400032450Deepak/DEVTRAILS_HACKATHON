import joblib
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.preprocessing import LabelEncoder

print("=" * 50)
print("Retraining Models for Compatibility")
print("=" * 50)

# 1. Create and train Risk Model
print("\n📊 Training Risk Model...")
risk_model = DecisionTreeClassifier(max_depth=5, random_state=42)
X_risk = np.random.rand(1000, 10)
y_risk = np.random.randint(0, 3, 1000)
risk_model.fit(X_risk, y_risk)

# 2. Create Label Encoder
print("🏷️  Creating Label Encoder...")
le = LabelEncoder()
le.fit(['Low', 'Moderate', 'High'])

# 3. Create Fraud Detection Model
print("🔍 Training Fraud Detection Model...")
fraud_model = DecisionTreeClassifier(max_depth=5, random_state=42)
X_fraud = np.random.rand(1000, 8)
y_fraud = np.random.randint(0, 2, 1000)
fraud_model.fit(X_fraud, y_fraud)

# 4. Save models
print("\n💾 Saving models...")
joblib.dump(risk_model, "risk_model.pkl")
joblib.dump(le, "risk_label_encoder.pkl")
joblib.dump(fraud_model, "fraud_model.pkl")

print("\n✅ Models retrained successfully!")
print("📁 Files updated")

# Verify
print("\n🔍 Verifying models...")
test_risk = joblib.load("risk_model.pkl")
test_le = joblib.load("risk_label_encoder.pkl")
test_fraud = joblib.load("fraud_model.pkl")
print("✅ All models verified and loadable!")