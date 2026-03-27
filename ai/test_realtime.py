import requests

BASE = "http://127.0.0.1:8000"

def test(name, payload):
    r = requests.post(f"{BASE}/evaluate", json=payload)
    result = r.json()
    status = result.get("status")
    risk = result.get("risk_level", "N/A")
    premium = result.get("weekly_premium_inr", "N/A")
    payout_triggered = result.get("payout", {}).get("triggered", False)
    payout_amt = result.get("payout", {}).get("payout_inr", 0)
    fraud = result.get("fraud_check", result.get("reason", "N/A"))
    live = result.get("live_conditions", {})

    print(f"\n🧪 {name}")
    print(f"   Status   : {status}")
    print(f"   Live Env : {live}")
    print(f"   Risk     : {risk}  |  Premium: ₹{premium}")
    print(f"   Payout   : {'✅ ₹' + str(payout_amt) if payout_triggered else '❌ No payout'}")
    print(f"   Fraud    : {fraud}")

def test_override(name, payload):
    r = requests.post(f"{BASE}/evaluate/test", json=payload)
    result = r.json()
    status = result.get("status")
    risk = result.get("risk_level", "N/A")
    premium = result.get("weekly_premium_inr", "N/A")
    payout_triggered = result.get("payout", {}).get("triggered", False)
    payout_amt = result.get("payout", {}).get("payout_inr", 0)
    fraud = result.get("fraud_check", result.get("reason", "N/A"))
    live = result.get("live_conditions", {})
    note = result.get("note", "")

    print(f"\n🧪 {name}")
    print(f"   {note}")
    print(f"   Status   : {status}")
    print(f"   Live Env : {live}")
    print(f"   Risk     : {risk}  |  Premium: ₹{premium}")
    print(f"   Payout   : {'✅ ₹' + str(payout_amt) if payout_triggered else '❌ No payout'}")
    print(f"   Fraud    : {fraud}")

# --- OVERRIDE TESTS ---

# Test: Extreme Rainfall (Mumbai flood simulation)
test_override("🌧️ Extreme Rainfall — Mumbai (55 mm/hr)", {
    "worker_id": "W010",
    "zone": "Zone_B_Mumbai",
    "gps_lat": 19.076, "gps_lon": 72.877,
    "daily_earnings_inr": 900,
    "weekly_earnings_inr": 5500,
    "num_deliveries": 15,
    "active_hours": 9,
    "gps_speed_variance": 2.1,
    "location_jump_km": 1.5,
    "override_rainfall": 55.0,   # way above 40mm/hr trigger
})

# Test: Hazardous AQI (Delhi smog simulation)
test_override("😷 Hazardous AQI — Delhi (AQI 380)", {
    "worker_id": "W011",
    "zone": "Zone_C_Delhi",
    "gps_lat": 28.613, "gps_lon": 77.209,
    "daily_earnings_inr": 750,
    "weekly_earnings_inr": 4800,
    "num_deliveries": 10,
    "active_hours": 8,
    "gps_speed_variance": 1.8,
    "location_jump_km": 2.0,
    "override_aqi": 380.0,       # above 350 trigger
})

# Test: Extreme Heat (Ahmedabad summer simulation)
test_override("🥵 Extreme Heat — Hyderabad (46°C)", {
    "worker_id": "W012",
    "zone": "Zone_D_Hyderabad",
    "gps_lat": 17.385, "gps_lon": 78.486,
    "daily_earnings_inr": 820,
    "weekly_earnings_inr": 5100,
    "num_deliveries": 12,
    "active_hours": 10,
    "gps_speed_variance": 2.0,
    "location_jump_km": 1.3,
    "override_temperature": 46.0,  # above 44°C trigger
})

# Test: ALL triggers at once (worst case)
test_override("💀 All Triggers — Worst Case Scenario", {
    "worker_id": "W013",
    "zone": "Zone_B_Mumbai",
    "gps_lat": 19.076, "gps_lon": 72.877,
    "daily_earnings_inr": 900,
    "weekly_earnings_inr": 5500,
    "num_deliveries": 15,
    "active_hours": 9,
    "gps_speed_variance": 2.1,
    "location_jump_km": 1.5,
    "override_rainfall": 70.0,
    "override_aqi": 400.0,
    "override_temperature": 47.0,
    "override_humidity": 94.0,
})


# Test 1 — Normal worker, Mumbai zone (live weather fetched)
test("Normal Worker — Mumbai", {
    "worker_id": "W001",
    "zone": "Zone_B_Mumbai",
    "gps_lat": 19.076, "gps_lon": 72.877,
    "daily_earnings_inr": 900,
    "weekly_earnings_inr": 5500,
    "num_deliveries": 15,
    "active_hours": 9,
    "gps_speed_variance": 2.1,
    "location_jump_km": 1.5,
})

# Test 2 — Delhi worker (AQI-prone zone)
test("Delhi Worker — High AQI Zone", {
    "worker_id": "W002",
    "zone": "Zone_C_Delhi",
    "gps_lat": 28.613, "gps_lon": 77.209,
    "daily_earnings_inr": 750,
    "weekly_earnings_inr": 4800,
    "num_deliveries": 10,
    "active_hours": 8,
    "gps_speed_variance": 1.8,
    "location_jump_km": 2.0,
})

# Test 3 — Fraud simulation (GPS teleportation)
test("Fraud — GPS Teleportation", {
    "worker_id": "W003",
    "zone": "Zone_A_Bangalore",
    "gps_lat": 12.97, "gps_lon": 77.59,
    "daily_earnings_inr": 1800,
    "weekly_earnings_inr": 9500,
    "num_deliveries": 39,
    "active_hours": 2,
    "gps_speed_variance": 98.0,   # abnormally high
    "location_jump_km": 55.0,     # teleportation
})

# Test 4 — Chennai worker
test("Normal Worker — Chennai", {
    "worker_id": "W004",
    "zone": "Zone_E_Chennai",
    "gps_lat": 13.082, "gps_lon": 80.270,
    "daily_earnings_inr": 820,
    "weekly_earnings_inr": 5100,
    "num_deliveries": 18,
    "active_hours": 10,
    "gps_speed_variance": 2.5,
    "location_jump_km": 1.2,
})
