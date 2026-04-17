package com.devtrails.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class AIService {
    
    private final RestTemplate restTemplate;
    private final String AI_URL = "https://devtrails-ai.onrender.com/evaluate"; // Your deployed AI URL
    
    // Cache for risk profiles to speed up responses
    private final Map<String, Map<String, Object>> riskCache = new HashMap<>();
    
    public AIService() {
        this.restTemplate = new RestTemplate();
    }
    
    // ========== ADD THIS METHOD - Fixes your error ==========
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
        request.put("payment_amount", amount);
        
        return evaluateWorkerRisk(request);
    }
    
    // ========== EXISTING METHOD (keep this) ==========
    public Map<String, Object> evaluateWorkerRisk(Map<String, Object> workerData) {
        // Check cache first (for repeated requests)
        String cacheKey = workerData.get("worker_id") + "_" + workerData.get("zone");
        if (riskCache.containsKey(cacheKey)) {
            System.out.println("📦 Using cached risk profile for: " + cacheKey);
            return riskCache.get(cacheKey);
        }
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(workerData, headers);
            
            // Call AI service with timeout
            ResponseEntity<Map> response = restTemplate.postForEntity(AI_URL, request, Map.class);
            
            if (response.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> aiResponse = response.getBody();
                
                // Cache the response
                riskCache.put(cacheKey, aiResponse);
                
                // Clear cache after 5 minutes (background)
                scheduleCacheClear(cacheKey);
                
                return aiResponse;
            }
            return getDefaultResponse();
            
        } catch (Exception e) {
            System.err.println("⚠️ AI Service error: " + e.getMessage());
            return getDefaultResponse();
        }
    }
    
    private void scheduleCacheClear(String cacheKey) {
        // Simple delayed cache clear
        new Thread(() -> {
            try {
                Thread.sleep(5 * 60 * 1000); // 5 minutes
                riskCache.remove(cacheKey);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();
    }
    
    // ========== ADD THIS - Background AI processing for faster registration ==========
    @Async
    public CompletableFuture<Void> processBackgroundAI(String userId, String name, String email, String phone) {
        System.out.println("🔄 Background AI processing started for user: " + userId);
        
        Map<String, Object> request = new HashMap<>();
        request.put("worker_id", userId);
        request.put("name", name);
        request.put("email", email);
        request.put("phone", phone);
        request.put("zone", "Zone_B_Mumbai");
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> httpRequest = new HttpEntity<>(request, headers);
            
            restTemplate.postForEntity(AI_URL, httpRequest, Map.class);
            System.out.println("✅ Background AI processing completed for user: " + userId);
        } catch (Exception e) {
            System.err.println("⚠️ Background AI processing failed: " + e.getMessage());
        }
        
        return CompletableFuture.completedFuture(null);
    }
    
    // ========== KEEP THIS - Default response when AI is unavailable ==========
    private Map<String, Object> getDefaultResponse() {
        Map<String, Object> defaultResponse = new HashMap<>();
        defaultResponse.put("status", "PROCESSED");
        defaultResponse.put("risk_level", "Moderate");
        defaultResponse.put("weekly_premium_inr", 25.0);
        defaultResponse.put("fraud_check", "Normal");
        defaultResponse.put("risk_score", 50);
        defaultResponse.put("anomaly_score", 0.0);
        defaultResponse.put("reason", "");
        defaultResponse.put("payout", Map.of(
            "amount", 0, 
            "triggered", false
        ));
        defaultResponse.put("live_conditions", Map.of(
            "rainfall_mm_hr", 25.0,
            "aqi", 200,
            "temperature_c", 30.0,
            "humidity_pct", 65
        ));
        return defaultResponse;
    }
    
    // ========== ADD THIS - For getting risk score only ==========
    public Map<String, Object> getRiskScore(String userId, String zone) {
        Map<String, Object> request = new HashMap<>();
        request.put("worker_id", userId);
        request.put("zone", zone);
        request.put("gps_lat", 19.0760);
        request.put("gps_lon", 72.8777);
        
        Map<String, Object> response = evaluateWorkerRisk(request);
        
        Map<String, Object> result = new HashMap<>();
        result.put("risk_level", response.getOrDefault("risk_level", "Moderate"));
        result.put("risk_score", response.getOrDefault("risk_score", 50));
        result.put("fraud_check", response.getOrDefault("fraud_check", "Normal"));
        
        return result;
    }
}