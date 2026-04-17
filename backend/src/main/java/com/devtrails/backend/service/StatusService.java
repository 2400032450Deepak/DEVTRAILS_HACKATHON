package com.devtrails.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class StatusService {

    private final RestTemplate restTemplate;
    
    // Cache to avoid too many API calls
    private Map<String, Object> cachedData = null;
    private LocalDateTime lastFetch = null;
    private static final long CACHE_DURATION_SECONDS = 300; // 5 minutes
    
    public StatusService() {
        this.restTemplate = new RestTemplate();
    }
    
    public Map<String, Object> getStatus(Long userId) {
        // Return cached data if fresh
        if (cachedData != null && lastFetch != null && 
            java.time.Duration.between(lastFetch, LocalDateTime.now()).getSeconds() < CACHE_DURATION_SECONDS) {
            return cachedData;
        }
        
        // Fetch REAL weather data
        Map<String, Object> response = fetchRealTimeData();
        cachedData = response;
        lastFetch = LocalDateTime.now();
        
        return response;
    }
    
    private Map<String, Object> fetchRealTimeData() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Hyderabad coordinates (default zone)
            double lat = 17.3850;
            double lon = 78.4867;
            
            // Fetch from Open-Meteo (FREE, no API key needed!)
            String weatherUrl = String.format(
                "https://api.open-meteo.com/v1/forecast?latitude=%f&longitude=%f&current=temperature_2m,relative_humidity_2m,precipitation,rain&timezone=Asia/Kolkata",
                lat, lon
            );
            
            Map<String, Object> weatherResponse = restTemplate.getForObject(weatherUrl, Map.class);
            
            // Parse weather data
            Map<String, Object> current = (Map<String, Object>) weatherResponse.get("current");
            
            double temp = 30.0;
            double rainfall = 0.0;
            int aqi = 150;
            
            if (current != null) {
                temp = ((Number) current.getOrDefault("temperature_2m", 30.0)).doubleValue();
                rainfall = ((Number) current.getOrDefault("rain", 0.0)).doubleValue();
                if (rainfall == 0) {
                    rainfall = ((Number) current.getOrDefault("precipitation", 0.0)).doubleValue();
                }
            }
            
            // Fetch AQI from WAQI (use your token)
            try {
                String aqiUrl = "https://api.waqi.info/feed/hyderabad/?token=6fb5cda18acaa3f9e6f8e8a18e7d8d0d88fb6944";
                Map<String, Object> aqiResponse = restTemplate.getForObject(aqiUrl, Map.class);
                Map<String, Object> aqiData = (Map<String, Object>) aqiResponse.get("data");
                if (aqiData != null) {
                    aqi = ((Number) aqiData.get("aqi")).intValue();
                }
            } catch (Exception e) {
                System.err.println("AQI fetch failed, using default: " + e.getMessage());
            }
            
            // Determine risk level
            String riskLevel = "Low";
            String label = "Safe";
            
            if (rainfall > 40) {
                riskLevel = "High";
                label = "DANGER - Heavy Rain";
            } else if (rainfall > 25) {
                riskLevel = "Moderate";
                label = "Warning - Rain Expected";
            } else if (temp > 42) {
                riskLevel = "High";
                label = "DANGER - Extreme Heat";
            } else if (temp > 38) {
                riskLevel = "Moderate";
                label = "Warning - Hot";
            } else if (aqi > 300) {
                riskLevel = "High";
                label = "DANGER - Severe Pollution";
            } else if (aqi > 200) {
                riskLevel = "Moderate";
                label = "Warning - Unhealthy Air";
            }
            
            response.put("rain", rainfall);
            response.put("temp", temp);
            response.put("aqi", aqi);
            response.put("traffic", "Moderate");
            response.put("platform", "Active");
            response.put("risk", riskLevel);
            response.put("label", label);
            response.put("is_triggered", rainfall > 40 || temp > 42 || aqi > 300);
            
            // Calculate payout if triggered
            if (rainfall > 40) {
                response.put("payout_amount", 300 + (int)((rainfall - 40) * 5));
                response.put("payout_reason", "Heavy Rainfall: " + rainfall + "mm/hr");
            } else if (temp > 42) {
                response.put("payout_amount", 200 + (int)((temp - 42) * 10));
                response.put("payout_reason", "Extreme Heat: " + temp + "°C");
            } else if (aqi > 300) {
                response.put("payout_amount", 250 + (int)((aqi - 300) * 0.5));
                response.put("payout_reason", "Severe Pollution: AQI " + aqi);
            } else {
                response.put("payout_amount", 0);
                response.put("payout_reason", "No active triggers");
            }
            
            System.out.println("✅ Real-time data fetched: Rain=" + rainfall + "mm, Temp=" + temp + "°C, AQI=" + aqi);
            
        } catch (Exception e) {
            System.err.println("❌ Weather API error: " + e.getMessage());
            // Fallback to reasonable defaults
            response.put("rain", 0.0);
            response.put("temp", 30.0);
            response.put("aqi", 150);
            response.put("traffic", "Moderate");
            response.put("platform", "Active");
            response.put("risk", "Low");
            response.put("label", "Safe");
            response.put("is_triggered", false);
            response.put("payout_amount", 0);
            response.put("payout_reason", "No active triggers");
        }
        
        return response;
    }
}