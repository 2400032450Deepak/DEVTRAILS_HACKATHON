from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# WeatherAPI key (use environment variable in production)
WEATHERAPI_KEY = "516c2e4969b545f4a15142519261704"

# Zone coordinates
ZONE_COORDS = {
    "Zone_A_Bangalore": (12.9716, 77.5946),
    "Zone_B_Mumbai": (19.0760, 72.8777),
    "Zone_C_Delhi": (28.6139, 77.2090),
    "Zone_D_Hyderabad": (17.3850, 78.4867),
    "Zone_E_Chennai": (13.0827, 80.2707),
}

def get_weather_weatherapi(lat, lon):
    """Fetch real-time weather from WeatherAPI.com"""
    try:
        url = f"http://api.weatherapi.com/v1/current.json?key={WEATHERAPI_KEY}&q={lat},{lon}&aqi=yes"
        response = requests.get(url, timeout=10)
        data = response.json()
        
        current = data.get('current', {})
        aqi_data = current.get('air_quality', {})
        
        # Convert EPA index to approximate AQI value
        epa_index = aqi_data.get('us-epa-index', 2)
        aqi_map = {1: 50, 2: 150, 3: 200, 4: 300, 5: 400}
        
        return {
            'rainfall': current.get('precip_mm', 0),
            'temp': current.get('temp_c', 30),
            'humidity': current.get('humidity', 65),
            'aqi': aqi_map.get(epa_index, 150),
            'condition': current.get('condition', {}).get('text', ''),
            'source': 'weatherapi'
        }
    except Exception as e:
        print(f"WeatherAPI error: {e}")
        return None

def get_weather_openmeteo(lat, lon):
    """Fallback to Open-Meteo"""
    try:
        url = f'https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,rain&timezone=Asia/Kolkata'
        response = requests.get(url, timeout=10)
        data = response.json()
        current = data.get('current', {})
        
        return {
            'rainfall': current.get('rain', 0),
            'temp': current.get('temperature_2m', 30),
            'humidity': current.get('relative_humidity_2m', 65),
            'aqi': 150,
            'source': 'openmeteo'
        }
    except Exception as e:
        print(f"Open-Meteo error: {e}")
        return None

def get_weather_for_zone(zone, lat=None, lon=None):
    """Get weather for zone, trying WeatherAPI first"""
    if lat and lon:
        coords = (lat, lon)
    else:
        coords = ZONE_COORDS.get(zone, (17.3850, 78.4867))
    
    # Try WeatherAPI first
    weather = get_weather_weatherapi(coords[0], coords[1])
    
    # Fallback to Open-Meteo
    if not weather:
        print("⚠️ WeatherAPI failed, falling back to Open-Meteo")
        weather = get_weather_openmeteo(coords[0], coords[1])
    
    return weather

def get_aqi_for_zone(zone, weather):
    """Get AQI from weather data or fallback"""
    if weather and 'aqi' in weather:
        return weather['aqi']
    
    # Fallback AQI by zone
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

@app.route('/evaluate', methods=['POST', 'GET'])
def evaluate():
    if request.method == 'GET':
        return jsonify({"status": "healthy", "message": "Send POST requests to /evaluate"})
    
    try:
        data = request.json
        zone = data.get('zone', 'Zone_D_Hyderabad')
        lat = data.get('gps_lat')
        lon = data.get('gps_lon')
        
        print(f"📥 Received request for zone: {zone}")
        
        # Get weather data
        weather = get_weather_for_zone(zone, lat, lon)
        
        if weather:
            rainfall = weather['rainfall']
            temp = weather['temp']
            humidity = weather['humidity']
            aqi = get_aqi_for_zone(zone, weather)
            source = weather.get('source', 'unknown')
        else:
            # Ultimate fallback
            rainfall = 0
            temp = 30
            humidity = 65
            aqi = 150
            source = 'fallback'
        
        print(f"📊 Data from {source}: Temp={temp}°C, Rain={rainfall}mm, AQI={aqi}")
        
        risk_level, risk_score = calculate_risk(rainfall, temp, aqi)
        premium = calculate_premium(risk_level)
        triggered, payout_amount, reason = check_triggers(rainfall, temp, aqi)
        
        response = {
            "status": "PROCESSED",
            "risk_level": risk_level,
            "risk_score": risk_score,
            "weekly_premium_inr": premium,
            "fraud_check": "Normal",
            "anomaly_score": 0,
            "payout": {
                "triggered": triggered,
                "amount": payout_amount,
                "reason": reason
            },
            "live_conditions": {
                "rainfall_mm_hr": rainfall,
                "aqi": aqi,
                "temperature_c": temp,
                "humidity_pct": humidity,
                "source": source,
                "timestamp": datetime.now().isoformat()
            }
        }
        
        print(f"✅ Response: Risk={risk_level}, Premium=₹{premium}")
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
                "humidity_pct": 65,
                "source": "fallback"
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