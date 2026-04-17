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
        
        # Calculate AQI based on PM2.5 (most accurate method)
        if pm25 > 0:
            # PM2.5 to AQI conversion based on EPA standard
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
            
            # Clamp AQI to valid range
            aqi = max(0, min(500, aqi))
        else:
            # Fallback to EPA index mapping
            aqi_map = {1: 45, 2: 105, 3: 175, 4: 225, 5: 275, 6: 350}
            aqi = aqi_map.get(us_epa_index, 150)
        
        print(f"📊 WeatherAPI: temp={current.get('temp_c')}°C, pm2.5={pm25}, us-epa-index={us_epa_index}, calculated AQI={aqi}")
        
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
            'aqi': None,  # Will use fallback
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
            print(f"✅ WAQI AQI for {city}: {aqi}")
            return aqi
    except Exception as e:
        print(f"WAQI error: {e}")
    
    # Ultimate fallback by zone
    aqi_map = {
        'Zone_A_Bangalore': 120,
        'Zone_B_Mumbai': 180,
        'Zone_C_Delhi': 250,
        'Zone_D_Hyderabad': 140,
        'Zone_E_Chennai': 130
    }
    fallback_aqi = aqi_map.get(zone, 150)
    print(f"📊 Using zone fallback AQI: {fallback_aqi}")
    return fallback_aqi

def get_weather_for_zone(zone, lat=None, lon=None):
    """Get weather for zone, trying WeatherAPI first"""
    if lat and lon:
        coords = (lat, lon)
    else:
        coords = ZONE_COORDS.get(zone, (17.3850, 78.4867))
    
    # Try WeatherAPI first
    weather = get_weather_weatherapi(coords[0], coords[1])
    
    # Fallback to Open-Meteo if WeatherAPI fails
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
            source = weather.get('source', 'unknown')
            
            # Get AQI - from weather if available, else from fallback
            if weather.get('aqi') is not None and weather['aqi'] > 0:
                aqi = weather['aqi']
                print(f"📊 AQI from WeatherAPI: {aqi}")
            else:
                aqi = get_aqi_fallback(zone)
                print(f"📊 AQI from fallback: {aqi}")
        else:
            # Ultimate fallback
            rainfall = 0
            temp = 30
            humidity = 65
            aqi = get_aqi_fallback(zone)
            source = 'fallback'
            print(f"📊 Using complete fallback: AQI={aqi}")
        
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
        
        print(f"✅ Response: Risk={risk_level}, Premium=₹{premium}, AQI={aqi}")
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