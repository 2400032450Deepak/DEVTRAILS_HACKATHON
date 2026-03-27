def calculate_premium(risk_label, weekly_earnings, num_deliveries, zone):
    base_premium = 27.5  # Midpoint of ₹20–₹35

    # Risk multiplier
    risk_map = {"Low": -5, "Medium": 0, "High": 7.5}
    risk_adjustment = risk_map.get(risk_label, 0)

    # Zone hazard factor (historically riskier zones cost more)
    zone_map = {
        "Zone_A_Bangalore": 0,
        "Zone_B_Mumbai": 2.0,    # monsoon-prone
        "Zone_C_Delhi": 1.5,     # AQI-prone
        "Zone_D_Hyderabad": 0.5,
        "Zone_E_Chennai": 1.0,
    }
    zone_adjustment = zone_map.get(zone, 0)

    # High earning workers pay slightly more (capacity to pay)
    earning_adjustment = 0
    if weekly_earnings > 7000: earning_adjustment = 1.5
    elif weekly_earnings < 3000: earning_adjustment = -2.0

    raw_premium = base_premium + risk_adjustment + zone_adjustment + earning_adjustment

    # Clamp strictly within ₹20–₹35
    premium = round(max(20, min(35, raw_premium)), 2)
    return premium

if __name__ == "__main__":
    test_cases = [
        ("Low", 4500, 15, "Zone_A_Bangalore"),
        ("Medium", 6000, 22, "Zone_B_Mumbai"),
        ("High", 3000, 10, "Zone_C_Delhi"),
    ]
    for risk, earn, deliv, zone in test_cases:
        p = calculate_premium(risk, earn, deliv, zone)
        print(f"Risk={risk}, Earnings=₹{earn}, Zone={zone} → Premium=₹{p}/week")
