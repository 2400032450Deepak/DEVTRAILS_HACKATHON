from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import joblib
import datetime
from risk_model import predict_risk
from premium_calculator import calculate_premium
from payout_engine import calculate_payout
from fraud_detector import predict_fraud
from live_data_fetcher import get_live_env_data

app = FastAPI(title="Parametric Insurance Real-Time API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models once at startup
risk_model = joblib.load("risk_model.pkl")
le = joblib.load("risk_label_encoder.pkl")
fraud_model = joblib.load("fraud_model.pkl")


# ── Model 1: Normal payload ──────────────────────────────────────────
class WorkerPayload(BaseModel):
    worker_id: str
    zone: str
    gps_lat: float
    gps_lon: float
    daily_earnings_inr: float
    weekly_earnings_inr: float
    num_deliveries: int
    active_hours: float
    gps_speed_variance: float
    location_jump_km: float


# ── Model 2: Test payload with optional overrides ────────────────────
class WorkerPayloadWithEnvOverride(BaseModel):
    worker_id: str
    zone: str
    gps_lat: float
    gps_lon: float
    daily_earnings_inr: float
    weekly_earnings_inr: float
    num_deliveries: int
    active_hours: float
    gps_speed_variance: float
    location_jump_km: float
    override_rainfall: Optional[float] = None
    override_aqi: Optional[float] = None
    override_temperature: Optional[float] = None
    override_humidity: Optional[float] = None


# ── Route 1: Live evaluate ───────────────────────────────────────────
@app.post("/evaluate")
def evaluate(worker: WorkerPayload):
    data = worker.dict()

    live_env = get_live_env_data(
        zone=data["zone"],
        lat=data["gps_lat"],
        lon=data["gps_lon"]
    )
    data.update(live_env)

    fraud = predict_fraud(fraud_model, data)
    if fraud["is_fraud"]:
        return {
            "status": "BLOCKED",
            "worker_id": data["worker_id"],
            "reason": "Suspicious GPS/activity detected",
            "anomaly_score": fraud["anomaly_score"],
            "live_env": live_env,
        }

    risk = predict_risk(risk_model, le, data)
    premium = calculate_premium(
        risk, data["weekly_earnings_inr"],
        data["num_deliveries"], data["zone"]
    )
    payout = calculate_payout(data, live_env, risk)

    return {
        "status": "PROCESSED",
        "worker_id": data["worker_id"],
        "live_conditions": live_env,
        "risk_level": risk,
        "weekly_premium_inr": premium,
        "payout": payout,
        "fraud_check": fraud["verdict"],
        "timestamp": datetime.datetime.now().isoformat(),
    }


# ── Route 2: Test evaluate with manual overrides ─────────────────────
@app.post("/evaluate/test")
def evaluate_test(worker: WorkerPayloadWithEnvOverride):
    data = worker.dict()

    live_env = get_live_env_data(
        zone=data["zone"],
        lat=data["gps_lat"],
        lon=data["gps_lon"]
    )

    # Apply overrides if provided
    if data["override_rainfall"] is not None:
        live_env["rainfall_mm_hr"] = data["override_rainfall"]
    if data["override_aqi"] is not None:
        live_env["aqi"] = data["override_aqi"]
    if data["override_temperature"] is not None:
        live_env["temperature_c"] = data["override_temperature"]
    if data["override_humidity"] is not None:
        live_env["humidity_pct"] = data["override_humidity"]

    data.update(live_env)

    fraud = predict_fraud(fraud_model, data)
    if fraud["is_fraud"]:
        return {"status": "BLOCKED", "reason": "Suspicious activity", "live_env": live_env}

    risk = predict_risk(risk_model, le, data)
    premium = calculate_premium(
        risk, data["weekly_earnings_inr"],
        data["num_deliveries"], data["zone"]
    )
    payout = calculate_payout(data, live_env, risk)

    return {
        "status": "PROCESSED",
        "worker_id": data["worker_id"],
        "live_conditions": live_env,
        "note": "⚠️ Test mode — some values manually overridden",
        "risk_level": risk,
        "weekly_premium_inr": premium,
        "payout": payout,
        "fraud_check": fraud["verdict"],
        "timestamp": datetime.datetime.now().isoformat(),
    }


# ── Route 3: Health check ────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "live", "models": "loaded"}
