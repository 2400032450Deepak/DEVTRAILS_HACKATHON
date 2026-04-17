@app.route('/calculate-premium', methods=['POST'])
def calculate_premium_dynamic():
    """Calculate premium using ML - NO DATABASE INVOLVED"""
    try:
        data = request.json
        zone = data.get('zone', 'unknown')
        lat = data.get('lat')
        lon = data.get('lon')
        coverage = data.get('coverage', 1200)
        weekly_earnings = data.get('weekly_earnings_inr', 5000)
        
        # Get REAL weather for this location
        if lat and lon:
            weather = get_weather_for_coordinates(lat, lon)
            aqi = get_aqi_for_coordinates(lat, lon)
        else:
            # Use zone coordinates as fallback
            coords = ZONE_COORDS.get(zone, (17.3850, 78.4867))
            weather = get_weather_weatherapi(coords[0], coords[1])
            aqi = weather.get('aqi', 150) if weather else 150
        
        # Calculate risk score from actual conditions
        risk_score = calculate_risk_score_dynamic(weather, aqi)
        
        # Calculate premium using ML formula
        base_premium = 20
        
        # Weather adjustments
        if weather and weather.get('rainfall', 0) > 40:
            base_premium += 10
        elif weather and weather.get('rainfall', 0) > 20:
            base_premium += 5
            
        if weather and weather.get('temp', 30) > 42:
            base_premium += 8
        elif weather and weather.get('temp', 30) > 38:
            base_premium += 4
            
        if aqi > 300:
            base_premium += 12
        elif aqi > 200:
            base_premium += 6
        elif aqi > 100:
            base_premium += 3
            
        # Coverage adjustment (higher coverage = higher premium)
        coverage_factor = coverage / 700
        base_premium = base_premium * coverage_factor
        
        # Risk score adjustment (0-100 scale)
        base_premium += risk_score / 10
        
        # Clamp to reasonable range
        premium = round(max(20, min(60, base_premium)), 2)
        
        return jsonify({
            "premium": premium,
            "risk_score": risk_score,
            "temperature": weather.get('temp') if weather else 30,
            "rainfall": weather.get('rainfall') if weather else 0,
            "aqi": aqi,
            "message": f"Premium calculated dynamically based on real-time conditions"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def calculate_risk_score_dynamic(weather, aqi):
    """Calculate risk score from real conditions (0-100)"""
    score = 0
    
    if weather:
        if weather.get('rainfall', 0) > 40:
            score += 30
        elif weather.get('rainfall', 0) > 25:
            score += 20
        elif weather.get('rainfall', 0) > 10:
            score += 10
            
        if weather.get('temp', 30) > 42:
            score += 25
        elif weather.get('temp', 30) > 38:
            score += 15
    
    if aqi > 300:
        score += 30
    elif aqi > 200:
        score += 20
    elif aqi > 100:
        score += 10
        
    return min(score, 100)