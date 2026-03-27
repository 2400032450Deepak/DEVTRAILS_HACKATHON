import requests

WAQI_TOKEN = "6fb5cda18acaa3f9e6f8e8a18e7d8d0d88fb6944"  # from aqicn.org

# City → (latitude, longitude) map for your zones
ZONE_COORDS = {
    "Zone_A_Bangalore": (12.9716, 77.5946),
    "Zone_B_Mumbai":    (19.0760, 72.8777),
    "Zone_C_Delhi":     (28.6139, 77.2090),
    "Zone_D_Hyderabad": (17.3850, 78.4867),
    "Zone_E_Chennai":   (13.0827, 80.2707),
}

# City slug for AQI lookup
ZONE_CITY = {
    "Zone_A_Bangalore": "bangalore",
    "Zone_B_Mumbai":    "mumbai",
    "Zone_C_Delhi":     "delhi",
    "Zone_D_Hyderabad": "hyderabad",
    "Zone_E_Chennai":   "chennai",
}

def fetch_weather(lat: float, lon: float) -> dict:
    """Fetch real-time weather from Open-Meteo (no API key needed)"""
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": [
            "temperature_2m",
            "relative_humidity_2m",
            "precipitation",
            "rain",
        ],
        "timezone": "Asia/Kolkata",
    }
    try:
        r = requests.get(url, params=params, timeout=5).json()
        c = r["current"]
        return {
            "temperature_c": round(c["temperature_2m"], 1),
            "humidity_pct": round(c["relative_humidity_2m"], 1),
            # Open-Meteo gives mm per hour in 'precipitation'
            "rainfall_mm_hr": round(c.get("rain", c.get("precipitation", 0)), 2),
        }
    except Exception as e:
        print(f"[WeatherAPI Error] {e} — using fallback values")
        return {"temperature_c": 30.0, "humidity_pct": 65.0, "rainfall_mm_hr": 0.0}


def fetch_aqi(city_slug: str) -> dict:
    """Fetch real-time AQI from WAQI"""
    url = f"https://api.waqi.info/feed/{city_slug}/?token={WAQI_TOKEN}"
    try:
        r = requests.get(url, timeout=5).json()
        if r["status"] == "ok":
            return {"aqi": float(r["data"]["aqi"])}
        else:
            return {"aqi": 80.0}
    except Exception as e:
        print(f"[AQIApi Error] {e} — using fallback value")
        return {"aqi": 80.0}


def get_live_env_data(zone: str, lat: float = None, lon: float = None) -> dict:
    """
    Master function — call this with zone name.
    Optionally pass worker's actual GPS lat/lon for precise weather.
    """
    coords = (lat, lon) if lat and lon else ZONE_COORDS.get(zone, (17.38, 78.48))
    city = ZONE_CITY.get(zone, "hyderabad")

    weather = fetch_weather(coords[0], coords[1])
    aqi_data = fetch_aqi(city)

    return {**weather, **aqi_data}


if __name__ == "__main__":
    # Test it live
    data = get_live_env_data("Zone_B_Mumbai")
    print("Live Environmental Data:", data)
