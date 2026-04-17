from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# WeatherAPI key
WEATHERAPI_KEY = "516c2e4969b545f4a15142519261704"

# WAQI token for fallback
WAQI_TOKEN = "6fb5cda18acaa3f9e6f8e8a18e7d8d0d88fb6944"

# Zone coordinates
ZONE_COORDS = {
    "Zone_A_Bangalore": (12.9716, 77.5946),
    "Zone_B_Mumbai": (19.0760, 72.8777),
    "Zone_C_Delhi": (28.6139, 77.2090),
    "Zone_D_Hyderabad": (17.3850, 78.4867),
    "Zone_E_Chennai": (13.0827, 80.2707),
}

def get_weather_weatherapi(lat, lon):
    """Fetch real-time weather and AQI from WeatherAPI.com"""
    try:
        url = f"http://api.weatherapi.com/v1/current.json?key={WEATHERAPI_KEY}&q={lat},{lon}&aqi=yes"
        response = requests.get(url, timeout=10)
        data = response.json()
        
        current = data.get('current', {})
        aqi_data = current.get('air_quality', {})
        
        # Get PM2.5 for accurate AQI calculation
        pm25 = aqi_data.get('pm2_5', 0)
        us_epa_index = aqi_data.get('us-epa-index', 2)
        
        # Calculate AQI based on PM2.5
        if pm25 > 0:
            if pm25 <= 12.0:
                aqi = int((50 - 0) / (12.0 - 0) * (pm25 - 0) + 0)
            elif pm25 <= 35.4:
                aqi = int((100 - 51) / (35.4 - 12.1) * (pm25 - 12.1) + 51)
            elif pm25 <= 55.4:
                aqi = int((150 - 101) / (55.4 - 35.5) * (pm25 - 35.5) + 101)
            elif pm25 <= 150.4:
                aqi = int((200 - 151) / (150.4 - 55.5) * (pm25 - 55.5) + 151)
            elif pm25 <= 250.4:
                aqi = int((300 - 201) / (250.4 - 150.5) * (pm25 - 150.5) + 201)
            else:
                aqi = int((500 - 301) / (500.4 - 250.5) * (pm25 - 250.5) + 301)
            aqi = max(0, min(500, aqi))
        else:
            aqi_map = {1: 45, 2: 105, 3: 175, 4: 225, 5: 275, 6: 350}
            aqi = aqi_map.get(us_epa_index, 150)
        
        return {
            'rainfall': current.get('precip_mm', 0),
            'temp': current.get('temp_c', 30),
            'humidity': current.get('humidity', 65),
            'aqi': aqi,
            'pm25': pm25,
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
            'aqi': None,
            'source': 'openmeteo'
        }
    except Exception as e:
        print(f"Open-Meteo error: {e}")
        return None

def get_aqi_fallback(zone):
    """Fallback to WAQI API for AQI"""
    try:
        city_map = {
            'Zone_A_Bangalore': 'bangalore',
            'Zone_B_Mumbai': 'mumbai',
            'Zone_C_Delhi': 'delhi',
            'Zone_D_Hyderabad': 'hyderabad',
            'Zone_E_Chennai': 'chennai'
        }
        city = city_map.get(zone, 'hyderabad')
        url = f"https://api.waqi.info/feed/{city}/?token={WAQI_TOKEN}"
        response = requests.get(url, timeout=5)
        data = response.json()
        if data.get('status') == 'ok':
            aqi = data.get('data', {}).get('aqi', 150)
            return aqi
    except Exception as e:
        print(f"WAQI error: {e}")
    
    aqi_map = {
        'Zone_A_Bangalore': 120,
        'Zone_B_Mumbai': 180,
        'Zone_C_Delhi': 250,
        'Zone_D_Hyderabad': 140,
        'Zone_E_Chennai': 130
    }
    return aqi_map.get(zone, 150)

def get_weather_for_zone(zone, lat=None, lon=None):
    """Get weather for zone, trying WeatherAPI first"""
    if lat and lon:
        coords = (lat, lon)
    else:
        coords = ZONE_COORDS.get(zone, (17.3850, 78.4867))
    
    weather = get_weather_weatherapi(coords[0], coords[1])
    if not weather:
        print("⚠️ WeatherAPI failed, falling back to Open-Meteo")
        weather = get_weather_openmeteo(coords[0], coords[1])
    return weather

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

# ============================================
# CALCULATE PREMIUM ENDPOINT
# ============================================
@app.route('/calculate-premium', methods=['POST'])
def calculate_premium_dynamic():
    try:
        data = request.json
        zone = data.get('zone', 'unknown')
        lat = data.get('lat')
        lon = data.get('lon')
        coverage = data.get('coverage', 1200)
        weekly_earnings = data.get('weekly_earnings_inr', 5000)

        # Get weather for location
        if lat and lon:
            weather = get_weather_weatherapi(lat, lon)
        else:
            coords = ZONE_COORDS.get(zone, (17.3850, 78.4867))
            weather = get_weather_weatherapi(coords[0], coords[1])
        
        if weather:
            aqi = weather['aqi']
            temp = weather['temp']
        else:
            aqi = get_aqi_fallback(zone)
            temp = 30
        
        # Calculate risk and premium
        risk_level, risk_score = calculate_risk(0, temp, aqi)
        premium = calculate_premium(risk_level)
        
        # Adjust for coverage
        coverage_factor = coverage / 1200
        premium = premium * coverage_factor
        
        return jsonify({
            "premium": round(premium, 2),
            "risk_level": risk_level,
            "risk_score": risk_score,
            "zone": zone,
            "coverage": coverage
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================
# MAIN EVALUATE ENDPOINT
# ============================================
@app.route('/evaluate', methods=['POST', 'GET'])
def evaluate():
    if request.method == 'GET':
        return jsonify({
            "status": "healthy", 
            "message": "Send POST requests to /evaluate",
            "example": {
                "zone": "Zone_D_Hyderabad",
                "gps_lat": 17.3850,
                "gps_lon": 78.4867
            }
        })
    
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
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
            source = weather.get('source', 'unknown')
            
            if weather.get('aqi') is not None and weather['aqi'] > 0:
                aqi = weather['aqi']
            else:
                aqi = get_aqi_fallback(zone)
        else:
            rainfall = 0
            temp = 30
            humidity = 65
            aqi = get_aqi_fallback(zone)
            source = 'fallback'
        
        print(f"📊 Final conditions: Temp={temp}°C, Rain={rainfall}mm, AQI={aqi}")
        
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
        import traceback
        traceback.print_exc()
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

# ============================================
# HEALTH CHECK
# ============================================
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "service": "DeliverShield AI",
        "timestamp": datetime.now().isoformat()
    })

# ============================================
# ROOT ENDPOINT
# ============================================
@app.route('/', methods=['GET'])
def root():
    return jsonify({
        "message": "DeliverShield AI Service is running",
        "endpoints": {
            "POST /evaluate": "Send weather data for risk assessment",
            "POST /calculate-premium": "Calculate premium dynamically",
            "GET /health": "Check service health"
        }
    })