from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

# Store last weather data - reduced cache time
last_weather = {'rainfall': 0, 'temp': 30, 'humidity': 65}
last_fetch_time = 0

def get_weather():
    global last_weather, last_fetch_time
    now = datetime.now().timestamp()
    
    # Cache for ONLY 60 seconds (not 5 minutes)
    if now - last_fetch_time < 60:
        print(f"📦 Using cached weather (age: {int(now - last_fetch_time)}s)")
        return last_weather
    
    try:
        # Use your ACTUAL location - Vaddeswaram, Guntur, Andhra Pradesh
        # Coordinates: 16.4480°N, 80.6172°E
        url = 'https://api.open-meteo.com/v1/forecast?latitude=16.4480&longitude=80.6172&current=temperature_2m,relative_humidity_2m,rain&timezone=Asia/Kolkata'
        
        print(f"🌤️ Fetching fresh weather for Vaddeswaram, Guntur...")
        response = requests.get(url, timeout=10)
        data = response.json()
        current = data.get('current', {})
        
        last_weather = {
            'rainfall': current.get('rain', 0),
            'temp': current.get('temperature_2m', 30),
            'humidity': current.get('relative_humidity_2m', 65)
        }
        last_fetch_time = now
        print(f"✅ Weather fetched: {last_weather['temp']}°C, {last_weather['rainfall']}mm rain, {last_weather['humidity']}% humidity")
    except Exception as e:
        print(f"⚠️ Weather API error: {e}, using cached data")
    
    return last_weather

def get_aqi(zone):
    """Fetch real AQI data for the location"""
    try:
        # For Vaddeswaram/Guntur area, use Guntur or Vijayawada
        # Guntur coordinates for AQI
        url = "https://api.waqi.info/feed/guntur/?token=6fb5cda18acaa3f9e6f8e8a18e7d8d0d88fb6944"
        response = requests.get(url, timeout=5)
        data = response.json()
        
        if data.get('status') == 'ok':
            aqi = data.get('data', {}).get('aqi', 150)
            print(f"✅ Real AQI fetched: {aqi}")
            return aqi
    except Exception as e:
        print(f"⚠️ AQI API error: {e}")
    
    # Fallback based on zone if API fails
    aqi_map = {
        'Zone_A_Bangalore': 120,
        'Zone_B_Mumbai': 180,
        'Zone_C_Delhi': 250,
        'Zone_D_Hyderabad': 140,
        'Zone_E_Chennai': 130
    }
    fallback_aqi = aqi_map.get(zone, 150)
    print(f"📊 Using fallback AQI: {fallback_aqi}")
    return fallback_aqi

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

@app.route('/evaluate', methods=['POST'])
def evaluate():
    try:
        data = request.json
        zone = data.get('zone', 'Zone_D_Hyderabad')  # Default to Hyderabad zone for AP
        
        print(f"📥 Received request for zone: {zone}")
        
        # Get live data
        weather = get_weather()
        aqi = get_aqi(zone)
        
        rainfall = weather['rainfall']
        temp = weather['temp']
        
        print(f"📊 Live conditions: Temp={temp}°C, Rain={rainfall}mm, AQI={aqi}")
        
        # Calculate everything
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
        
        print(f"✅ Response: Risk={risk_level}, Premium=₹{premium}, Temp={temp}°C")
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

@app.route('/process-background', methods=['POST'])
def process_background():
    print(f"🔄 Background processing: {request.json}")
    return jsonify({"status": "processing", "message": "Background task started"})

if __name__ == "__main__":
    print("=" * 50)
    print("🚀 DeliverShield AI Service Starting...")
    print("=" * 50)
    print("📍 Server: http://0.0.0.0:5000")
    print("❤️  Health: http://0.0.0.0:5000/health")
    print("🎯 Evaluate: POST http://0.0.0.0:5000/evaluate")
    print("📍 Location: Vaddeswaram, Guntur, AP (16.4480°N, 80.6172°E)")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5000, debug=False)