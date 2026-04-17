import requests
import os

# WeatherAPI key (use environment variable in production)
WEATHERAPI_KEY = "516c2e4969b545f4a15142519261704"

# City → (latitude, longitude) map for your zones
ZONE_COORDS = {
    "Zone_A_Bangalore": (12.9716, 77.5946),
    "Zone_B_Mumbai":    (19.0760, 72.8777),
    "Zone_C_Delhi":     (28.6139, 77.2090),
    "Zone_D_Hyderabad": (17.3850, 78.4867),
    "Zone_E_Chennai":   (13.0827, 80.2707),
}

def fetch_weather_weatherapi(lat: float, lon: float) -> dict:
    """Fetch real-time weather from WeatherAPI.com (includes AQI)"""
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
            "temperature_c": current.get('temp_c', 30),
            "humidity_pct": current.get('humidity', 65),
            "rainfall_mm_hr": current.get('precip_mm', 0),
            "aqi": aqi_map.get(epa_index, 150),
            "wind_kph": current.get('wind_kph', 0),
            "condition": current.get('condition', {}).get('text', ''),
            "source": "weatherapi"
        }
    except Exception as e:
        print(f"WeatherAPI error: {e}")
        return None

def fetch_weather_openmeteo(lat: float, lon: float) -> dict:
    """Fallback to Open-Meteo if WeatherAPI fails"""
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": ["temperature_2m", "relative_humidity_2m", "rain"],
        "timezone": "Asia/Kolkata",
    }
    try:
        r = requests.get(url, params=params, timeout=5).json()
        c = r["current"]
        return {
            "temperature_c": round(c["temperature_2m"], 1),
            "humidity_pct": round(c["relative_humidity_2m"], 1),
            "rainfall_mm_hr": round(c.get("rain", 0), 2),
            "aqi": 150,  # Open-Meteo doesn't provide AQI
            "source": "openmeteo"
        }
    except Exception as e:
        print(f"Open-Meteo error: {e}")
        return None

def get_live_env_data(zone: str, lat: float = None, lon: float = None) -> dict:
    """
    Master function - tries WeatherAPI first, then falls back to Open-Meteo
    """
    coords = (lat, lon) if lat and lon else ZONE_COORDS.get(zone, (17.3850, 78.4867))
    
    # Try WeatherAPI first (more accurate, includes AQI)
    weather_data = fetch_weather_weatherapi(coords[0], coords[1])
    
    # Fallback to Open-Meteo if WeatherAPI fails
    if not weather_data:
        print("⚠️ WeatherAPI failed, falling back to Open-Meteo")
        weather_data = fetch_weather_openmeteo(coords[0], coords[1])
    
    if not weather_data:
        # Ultimate fallback
        return {
            "temperature_c": 30.0,
            "humidity_pct": 65.0,
            "rainfall_mm_hr": 0.0,
            "aqi": 150
        }
    
    return weather_data

if __name__ == "__main__":
    # Test it live
    data = get_live_env_data("Zone_D_Hyderabad")
    print("Live Environmental Data:", data)