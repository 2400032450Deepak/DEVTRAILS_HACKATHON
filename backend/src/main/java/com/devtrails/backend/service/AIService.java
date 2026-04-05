package com.devtrails.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.HashMap;
import java.util.Map;

@Service
public class AIService {
    
    private final RestTemplate restTemplate;
    private final String AI_URL = "http://localhost:8000/evaluate";
    
    public AIService() {
        this.restTemplate = new RestTemplate();
    }
    
    public Map<String, Object> evaluateWorkerRisk(Map<String, Object> workerData) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(workerData, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(AI_URL, request, Map.class);
            
            if (response.getBody() != null) {
                return response.getBody();
            }
            return getDefaultResponse();
            
        } catch (Exception e) {
            System.err.println("⚠️ AI Service error: " + e.getMessage());
            return getDefaultResponse();
        }
    }
    
    public Map<String, Object> checkPaymentFraud(String userId, Double amount, String zone) {
        Map<String, Object> request = new HashMap<>();
        request.put("worker_id", userId);
        request.put("zone", zone != null ? zone : "Zone_B_Mumbai");
        request.put("gps_lat", 19.0760);
        request.put("gps_lon", 72.8777);
        request.put("daily_earnings_inr", 800.0);
        request.put("weekly_earnings_inr", 4500.0);
        request.put("num_deliveries", 15);
        request.put("active_hours", 6.0);
        request.put("gps_speed_variance", 1.2);
        request.put("location_jump_km", 0.0);
        
        return evaluateWorkerRisk(request);
    }
    
    private Map<String, Object> getDefaultResponse() {
        Map<String, Object> defaultResponse = new HashMap<>();
        defaultResponse.put("status", "PROCESSED");
        defaultResponse.put("risk_level", "Moderate");
        defaultResponse.put("weekly_premium_inr", 25.0);
        defaultResponse.put("fraud_check", "Normal");
        defaultResponse.put("risk_score", 50);
        defaultResponse.put("payout", Map.of("amount", 0, "triggered", false));
        defaultResponse.put("live_conditions", Map.of(
            "rainfall_mm_hr", 25.0,
            "aqi", 200,
            "temperature_c", 30.0,
            "humidity_pct", 65
        ));
        return defaultResponse;
    }
}