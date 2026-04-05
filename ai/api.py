from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import datetime
from fraud_detector import predict_fraud
from live_data_fetcher import get_live_env_data

app = FastAPI(title="Parametric Insurance Real-Time API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/evaluate")
def evaluate(worker: WorkerPayload):
    data = worker.dict()

    # Get live environment data
    live_env = get_live_env_data(
        zone=data["zone"],
        lat=data["gps_lat"],
        lon=data["gps_lon"]
    )
    data.update(live_env)
    
    # Fraud detection (now rule-based)
    fraud = predict_fraud(None, data)  # Pass None since we're using rules
    
    if fraud["is_fraud"]:
        return {
            "status": "BLOCKED",
            "worker_id": data["worker_id"],
            "reason": "Suspicious activity detected: " + ", ".join(fraud.get("reasons", [])),
            "anomaly_score": fraud["anomaly_score"],
            "live_env": live_env,
            "timestamp": datetime.datetime.now().isoformat()
        }

    # Simple risk calculation
    risk_score = 50
    
    if data["weekly_earnings_inr"] > 5000:
        risk_score += 10
    if data["num_deliveries"] > 20:
        risk_score += 10
    if data["active_hours"] > 8:
        risk_score += 10
    if live_env.get("rainfall_mm_hr", 0) > 40:
        risk_score += 20
    if live_env.get("aqi", 0) > 300:
        risk_score += 15
    
    if risk_score > 70:
        risk_level = "High"
    elif risk_score > 40:
        risk_level = "Moderate"
    else:
        risk_level = "Low"
    
    # Premium calculation
    base_premium = 20
    premium = base_premium + (risk_score / 100) * 20
    
    # Payout calculation
    payout_triggered = risk_level == "High"
    payout_amount = 300 if payout_triggered else 0
    
    return {
        "status": "PROCESSED",
        "worker_id": data["worker_id"],
        "live_conditions": live_env,
        "risk_level": risk_level,
        "risk_score": risk_score,
        "weekly_premium_inr": round(premium, 2),
        "payout": {
            "triggered": payout_triggered,
            "amount": payout_amount
        },
        "fraud_check": fraud["verdict"],
        "timestamp": datetime.datetime.now().isoformat(),
    }

@app.get("/health")
def health():
    return {"status": "live", "models": "rule-based", "version": "2.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)