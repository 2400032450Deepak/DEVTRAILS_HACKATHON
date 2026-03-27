import pandas as pd
import numpy as np

np.random.seed(42)
N = 500

ZONES = ["Zone_A_Bangalore", "Zone_B_Mumbai", "Zone_C_Delhi",
         "Zone_D_Hyderabad", "Zone_E_Chennai"]

def generate_data(n=N):
    data = {
        "worker_id": [f"W{str(i).zfill(4)}" for i in range(n)],
        "zone": np.random.choice(ZONES, n),
        "rainfall_mm_hr": np.random.exponential(scale=10, size=n).clip(0, 100),
        "temperature_c": np.random.normal(loc=30, scale=8, size=n).clip(15, 48),
        "aqi": np.random.randint(50, 450, size=n),
        "humidity_pct": np.random.uniform(30, 95, size=n),
        "gps_lat": np.random.uniform(12.9, 28.7, size=n),
        "gps_lon": np.random.uniform(77.5, 88.3, size=n),
        "daily_earnings_inr": np.random.normal(850, 150, size=n).clip(200, 1800),
        "weekly_earnings_inr": np.random.normal(5500, 800, size=n).clip(1500, 10000),
        "num_deliveries": np.random.randint(5, 40, size=n),
        "active_hours": np.random.uniform(2, 12, size=n),
        # GPS speed variance — high value = possible spoofing
        "gps_speed_variance": np.random.exponential(scale=5, size=n),
        # Location jump (km) between consecutive pings
        "location_jump_km": np.random.exponential(scale=2, size=n),
    }
    return pd.DataFrame(data)

if __name__ == "__main__":
    df = generate_data()
    df.to_csv("worker_data.csv", index=False)
    print(df.head())
