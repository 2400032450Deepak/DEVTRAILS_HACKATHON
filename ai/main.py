from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# ... (keep all your existing functions: get_weather_weatherapi, get_aqi_fallback, etc.)

# ============================================
# NEW ENDPOINT – MUST COME AFTER app = Flask(__name__)
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

        # Your logic here (weather, AQI, risk score, premium calculation)
        # ...

        return jsonify({"premium": 27.5, "message": "Dynamic premium calculated"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================
# YOUR ORIGINAL /evaluate ENDPOINT (keep it)
# ============================================
@app.route('/evaluate', methods=['POST', 'GET'])
def evaluate():
    # ... your existing code ...
    pass

# ============================================
# HEALTH CHECK (keep it)
# ============================================
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"})

# ============================================
# ROOT ENDPOINT (keep it)
# ============================================
@app.route('/', methods=['GET'])
def root():
    return jsonify({"message": "DeliverShield AI Service is running"})

# ============================================
# START THE SERVER (MUST BE LAST)
# ============================================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print("=" * 50)
    print("🚀 DeliverShield AI Service Starting...")
    print("=" * 50)
    print(f"📍 Server: http://0.0.0.0:{port}")
    app.run(host='0.0.0.0', port=port, debug=False)