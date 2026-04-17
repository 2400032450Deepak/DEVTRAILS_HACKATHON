package com.devtrails.backend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.*;

@RestController
@RequestMapping("/api/risk")
@CrossOrigin(origins = "*")
public class RiskController {

    // Hyper-local risk data by pincode/area
    private static final Map<String, Map<String, Double>> HYPER_LOCAL_RISK = new HashMap<>();
    
    static {
        // Bangalore zones
        HYPER_LOCAL_RISK.put("560001", Map.of("floodRisk", 0.2, "trafficRisk", 0.8, "aqiRisk", 0.3, "premiumMultiplier", 1.0));
        HYPER_LOCAL_RISK.put("560002", Map.of("floodRisk", 0.1, "trafficRisk", 0.6, "aqiRisk", 0.2, "premiumMultiplier", 0.9));
        HYPER_LOCAL_RISK.put("560003", Map.of("floodRisk", 0.3, "trafficRisk", 0.7, "aqiRisk", 0.4, "premiumMultiplier", 1.1));
        
        // Hyderabad zones
        HYPER_LOCAL_RISK.put("500001", Map.of("floodRisk", 0.4, "trafficRisk", 0.7, "aqiRisk", 0.4, "premiumMultiplier", 1.2));
        HYPER_LOCAL_RISK.put("500002", Map.of("floodRisk", 0.3, "trafficRisk", 0.5, "aqiRisk", 0.3, "premiumMultiplier", 1.0));
        HYPER_LOCAL_RISK.put("500003", Map.of("floodRisk", 0.5, "trafficRisk", 0.8, "aqiRisk", 0.5, "premiumMultiplier", 1.3));
        
        // Mumbai zones (high risk)
        HYPER_LOCAL_RISK.put("400001", Map.of("floodRisk", 0.9, "trafficRisk", 0.9, "aqiRisk", 0.6, "premiumMultiplier", 1.5));
        HYPER_LOCAL_RISK.put("400002", Map.of("floodRisk", 0.7, "trafficRisk", 0.8, "aqiRisk", 0.5, "premiumMultiplier", 1.3));
        HYPER_LOCAL_RISK.put("400003", Map.of("floodRisk", 0.8, "trafficRisk", 0.7, "aqiRisk", 0.6, "premiumMultiplier", 1.4));
        
        // Delhi zones
        HYPER_LOCAL_RISK.put("110001", Map.of("floodRisk", 0.3, "trafficRisk", 0.8, "aqiRisk", 0.9, "premiumMultiplier", 1.4));
        HYPER_LOCAL_RISK.put("110002", Map.of("floodRisk", 0.2, "trafficRisk", 0.7, "aqiRisk", 0.8, "premiumMultiplier", 1.2));
        HYPER_LOCAL_RISK.put("110003", Map.of("floodRisk", 0.4, "trafficRisk", 0.9, "aqiRisk", 0.9, "premiumMultiplier", 1.5));
        
        // Chennai zones
        HYPER_LOCAL_RISK.put("600001", Map.of("floodRisk", 0.6, "trafficRisk", 0.7, "aqiRisk", 0.4, "premiumMultiplier", 1.2));
        HYPER_LOCAL_RISK.put("600002", Map.of("floodRisk", 0.5, "trafficRisk", 0.6, "aqiRisk", 0.3, "premiumMultiplier", 1.0));
    }
    
    @GetMapping("/hyperlocal/{pincode}")
    public ResponseEntity<Map<String, Object>> getHyperLocalRisk(@PathVariable String pincode) {
        Map<String, Double> riskFactors = HYPER_LOCAL_RISK.getOrDefault(pincode, 
            Map.of("floodRisk", 0.5, "trafficRisk", 0.5, "aqiRisk", 0.5, "premiumMultiplier", 1.0));
        
        double totalRisk = (riskFactors.get("floodRisk") + 
                           riskFactors.get("trafficRisk") + 
                           riskFactors.get("aqiRisk")) / 3;
        
        Map<String, Object> response = new HashMap<>();
        response.put("pincode", pincode);
        response.put("floodRisk", riskFactors.get("floodRisk"));
        response.put("trafficRisk", riskFactors.get("trafficRisk"));
        response.put("aqiRisk", riskFactors.get("aqiRisk"));
        response.put("totalRisk", totalRisk);
        response.put("riskLevel", totalRisk > 0.7 ? "HIGH" : totalRisk > 0.4 ? "MEDIUM" : "LOW");
        response.put("recommendedPremium", Math.round(20 + (totalRisk * 30)));
        response.put("premiumMultiplier", riskFactors.get("premiumMultiplier"));
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/zone/{zoneId}/areas")
    public ResponseEntity<List<Map<String, Object>>> getZoneAreas(@PathVariable String zoneId) {
        List<Map<String, Object>> areas = new ArrayList<>();
        
        switch(zoneId) {
            case "Zone_B_Mumbai":
                areas.add(Map.of("name", "Dharavi", "pincode", "400001", "riskLevel", "HIGH", "premiumMultiplier", 1.5));
                areas.add(Map.of("name", "Bandra", "pincode", "400002", "riskLevel", "MEDIUM", "premiumMultiplier", 1.3));
                areas.add(Map.of("name", "Andheri", "pincode", "400003", "riskLevel", "MEDIUM", "premiumMultiplier", 1.2));
                break;
            case "Zone_C_Delhi":
                areas.add(Map.of("name", "Connaught Place", "pincode", "110001", "riskLevel", "HIGH", "premiumMultiplier", 1.5));
                areas.add(Map.of("name", "Karol Bagh", "pincode", "110002", "riskLevel", "MEDIUM", "premiumMultiplier", 1.2));
                break;
            case "Zone_D_Hyderabad":
                areas.add(Map.of("name", "Gachibowli", "pincode", "500001", "riskLevel", "MEDIUM", "premiumMultiplier", 1.2));
                areas.add(Map.of("name", "Hitech City", "pincode", "500002", "riskLevel", "HIGH", "premiumMultiplier", 1.3));
                areas.add(Map.of("name", "Madhapur", "pincode", "500003", "riskLevel", "MEDIUM", "premiumMultiplier", 1.1));
                break;
            default:
                areas.add(Map.of("name", "City Center", "pincode", "000000", "riskLevel", "MEDIUM", "premiumMultiplier", 1.0));
        }
        
        return ResponseEntity.ok(areas);
    }
    
    @PostMapping("/calculate-premium")
    public ResponseEntity<Map<String, Object>> calculatePremium(@RequestBody Map<String, String> request) {
        String zone = request.get("zone");
        String pincode = request.getOrDefault("pincode", "");
        Double basePremium = Double.parseDouble(request.getOrDefault("basePremium", "25"));
        
        Map<String, Double> riskFactors = HYPER_LOCAL_RISK.getOrDefault(pincode, 
            Map.of("premiumMultiplier", 1.0));
        
        double multiplier = riskFactors.get("premiumMultiplier");
        double finalPremium = Math.round(basePremium * multiplier * 100.0) / 100.0;
        
        Map<String, Object> response = new HashMap<>();
        response.put("zone", zone);
        response.put("pincode", pincode);
        response.put("basePremium", basePremium);
        response.put("multiplier", multiplier);
        response.put("finalPremium", finalPremium);
        response.put("message", multiplier > 1.2 ? "High risk area - premium adjusted" : 
                                 multiplier < 0.9 ? "Low risk area - you save on premium" : 
                                 "Standard premium for this area");
        
        return ResponseEntity.ok(response);
    }
}