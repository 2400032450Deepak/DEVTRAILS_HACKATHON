# Parametric trigger thresholds
TRIGGERS = {
    "rainfall_mm_hr": 40,
    "aqi": 350,
    "temperature_c": 44,    # extreme heat
    "humidity_pct": 92,     # extreme humidity
}

SEVERITY_MULTIPLIER = {
    "Low": 0.3,
    "Medium": 0.6,
    "High": 1.0,
}

def check_triggers(env_data: dict) -> dict:
    """Returns which triggers are breached and their severity"""
    breached = {}
    for param, threshold in TRIGGERS.items():
        if param in env_data and env_data[param] > threshold:
            excess_ratio = env_data[param] / threshold
            breached[param] = round(excess_ratio, 2)
    return breached

def calculate_payout(worker_data: dict, env_data: dict, risk_label: str) -> dict:
    """
    worker_data: dict with daily_earnings_inr, active_hours
    env_data: dict with rainfall_mm_hr, aqi, temperature_c, humidity_pct
    risk_label: "Low" | "Medium" | "High"
    """
    triggered = check_triggers(env_data)

    if not triggered:
        return {"triggered": False, "payout_inr": 0,
                "message": "No parametric threshold breached. No payout."}

    avg_earnings_per_hour = worker_data["daily_earnings_inr"] / worker_data["active_hours"]

    # Estimate disruption duration based on most-breached trigger
    max_excess = max(triggered.values())
    # Disruption hours: more excess = longer estimated disruption (capped at active hours)
    disruption_hours = min(worker_data["active_hours"], max_excess * 2)

    severity_mult = SEVERITY_MULTIPLIER.get(risk_label, 0.6)

    payout = round(avg_earnings_per_hour * disruption_hours * severity_mult, 2)

    return {
        "triggered": True,
        "triggers_breached": triggered,
        "avg_earnings_per_hour": round(avg_earnings_per_hour, 2),
        "disruption_hours_estimated": round(disruption_hours, 2),
        "severity_multiplier": severity_mult,
        "payout_inr": payout,
        "message": f"Auto-payout initiated: ₹{payout}"
    }

if __name__ == "__main__":
    worker = {"daily_earnings_inr": 900, "active_hours": 10}
    env = {"rainfall_mm_hr": 55, "aqi": 180, "temperature_c": 35, "humidity_pct": 70}
    result = calculate_payout(worker, env, "High")
    for k, v in result.items():
        print(f"  {k}: {v}")
