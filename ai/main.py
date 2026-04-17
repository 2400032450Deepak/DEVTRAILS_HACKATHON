from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # Allow all origins

# Store last weather data - reduced cache time
last_weather = {'rainfall': 0, 'temp': 30, 'humidity': 65}
last_fetch_time = 0

def get_weather():
    global last_weather, last_fetch_time
    now = datetime.now().timestamp()
    
    # Cache for ONLY 60 seconds
    if now - last_fetch_time < 60:
        print(f"📦 Using cached weather (age: {int(now - last_fetch_time)}s)")
        return last_weather
    
    try:
        # Vaddeswaram, Guntur, Andhra Pradesh coordinates
        url = 'https://api.open-meteo.com/v1/forecast?latitude=16.4480&longitude=80.6172&current=temperature_2m,relative_humidity_2m,rain&timezone=Asia/Kolkata'
        
        print(f"🌤️ Fetching fresh weather...")
        response = requests.get(url, timeout=10)
        data = response.json()
        current = data.get('current', {})
        
        last_weather = {
            'rainfall': current.get('rain', 0),
            'temp': current.get('temperature_2m', 30),
            'humidity': current.get('relative_humidity_2m', 65)
        }
        last_fetch_time = now
        print(f"✅ Weather fetched: {last_weather['temp']}°C")
    except Exception as e:
        print(f"⚠️ Weather API error: {e}")
    
    return last_weather

def get_aqi(zone):
    aqi_map = {
        'Zone_A_Bangalore': 120,
        'Zone_B_Mumbai': 180,
        'Zone_C_Delhi': 250,
        'Zone_D_Hyderabad': 140,
        'Zone_E_Chennai': 130
    }
    return aqi_map.get(zone, 150)

def calculate_risk(rainfall, temp, aqi):
    score = 0
    if rainfall > 40: score += 3
    elif rainfall > 25: score += 2
    elif rainfall > 10: score += 1
    
    if aqi > 300: score += 3
    elif aqi > 200: score += 2
    elif aqi > 100: score += 1
    
    if temp > 42: score += 2
    elif temp > 38: score += 1
    
    if score >= 5:
        return "High", 85
    elif score >= 2:
        return "Medium", 55
    return "Low", 25

def calculate_premium(risk_level):
    premiums = {"Low": 22.5, "Medium": 27.5, "High": 32.5}
    return premiums.get(risk_level, 27.5)

def check_triggers(rainfall, temp, aqi):
    if rainfall > 40:
        amount = min(500, 300 + (rainfall - 40) * 10)
        return True, round(amount, 2), f"Heavy Rainfall: {rainfall}mm/hr"
    elif temp > 42:
        amount = min(400, 200 + (temp - 42) * 15)
        return True, round(amount, 2), f"Extreme Heat: {temp}°C"
    elif aqi > 300:
        amount = min(450, 250 + (aqi - 300) * 2)
        return True, round(amount, 2), f"High Pollution: AQI {aqi}"
    return False, 0, ""

def detect_fraud(data):
    gps_speed = data.get('gps_speed_variance', 0)
    location_jump = data.get('location_jump_km', 0)
    active_hours = data.get('active_hours', 0)
    
    if gps_speed > 15 or location_jump > 5:
        return "Suspicious", 0.7
    elif active_hours > 16:
        return "Unusual", 0.4
    return "Normal", 0.0

# ============= CRITICAL: Ensure this route exists =============
@app.route('/evaluate', methods=['POST', 'GET'])
def evaluate():
    # Handle GET request for testing
    if request.method == 'GET':
        return jsonify({"status": "healthy", "message": "AI service is running. Send POST requests to /evaluate"})
    
    try:
        data = request.json
        zone = data.get('zone', 'Zone_D_Hyderabad')
        
        print(f"📥 Received POST request for zone: {zone}")
        
        weather = get_weather()
        aqi = get_aqi(zone)
        
        rainfall = weather['rainfall']
        temp = weather['temp']
        
        risk_level, risk_score = calculate_risk(rainfall, temp, aqi)
        premium = calculate_premium(risk_level)
        triggered, payout_amount, reason = check_triggers(rainfall, temp, aqi)
        fraud_check, anomaly_score = detect_fraud(data)
        
        response = {
            "status": "PROCESSED",
            "risk_level": risk_level,
            "risk_score": risk_score,
            "weekly_premium_inr": premium,
            "fraud_check": fraud_check,
            "anomaly_score": anomaly_score,
            "payout": {
                "triggered": triggered,
                "amount": payout_amount,
                "reason": reason
            },
            "live_conditions": {
                "rainfall_mm_hr": rainfall,
                "aqi": aqi,
                "temperature_c": temp,
                "humidity_pct": weather['humidity'],
                "timestamp": datetime.now().isoformat()
            }
        }
        
        print(f"✅ Response: Risk={risk_level}, Temp={temp}°C")
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({
            "status": "PROCESSED",
            "risk_level": "Medium",
            "risk_score": 50,
            "weekly_premium_inr": 27.5,
            "fraud_check": "Normal",
            "anomaly_score": 0,
            "payout": {"triggered": False, "amount": 0, "reason": ""},
            "live_conditions": {
                "rainfall_mm_hr": 0,
                "aqi": 150,
                "temperature_c": 30,
                "humidity_pct": 65
            }
        })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "service": "DeliverShield AI",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        "message": "DeliverShield AI Service is running",
        "endpoints": {
            "POST /evaluate": "Send weather data for risk assessment",
            "GET /health": "Check service health"
        }
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print("=" * 50)
    print("🚀 DeliverShield AI Service Starting...")
    print("=" * 50)
    print(f"📍 Server: http://0.0.0.0:{port}")
    print(f"❤️  Health: http://0.0.0.0:{port}/health")
    print(f"🎯 Evaluate: POST http://0.0.0.0:{port}/evaluate")
    print("=" * 50)
    app.run(host='0.0.0.0', port=port, debug=False)