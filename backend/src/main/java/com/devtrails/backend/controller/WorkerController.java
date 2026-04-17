package com.devtrails.backend.controller;

import com.devtrails.backend.model.User;
import com.devtrails.backend.repository.UserRepository;
import com.devtrails.backend.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/workers")
@CrossOrigin(origins = {"http://localhost:5173", "https://devtrails-frontend-main.vercel.app"}, allowCredentials = "true")
public class WorkerController {

    private final UserRepository userRepository;
    
    @Autowired
    private AIService aiService;  // Add AI Service

    public WorkerController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Get worker profile by ID (existing)
    @GetMapping("/{workerId}")
    public ResponseEntity<?> getWorkerProfile(@PathVariable String workerId) {
        Long id;
        try {
            id = Long.parseLong(workerId);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID format"));
        }
        
        Optional<User> userOpt = userRepository.findById(id);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("zone", user.getZone() != null ? user.getZone() : "Zone_B_Mumbai");
        profile.put("totalEarnings", user.getTotalEarnings() != null ? user.getTotalEarnings() : 0);
        profile.put("phone", user.getPhone());
        
        return ResponseEntity.ok(profile);
    }

    // Get worker profile by email (existing)
    @GetMapping("/by-email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        System.out.println("🔍 Looking for user by email: " + email);
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            System.out.println("❌ User not found with email: " + email);
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        System.out.println("✅ User found: ID=" + user.getId() + ", Name=" + user.getName());
        
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("zone", user.getZone() != null ? user.getZone() : "Zone_B_Mumbai");
        profile.put("totalEarnings", user.getTotalEarnings() != null ? user.getTotalEarnings() : 0);
        profile.put("phone", user.getPhone());
        
        return ResponseEntity.ok(profile);
    }

    // Get all workers (existing)
    @GetMapping
    public ResponseEntity<?> getAllWorkers() {
        Iterable<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    // Update worker profile (existing)
    @PutMapping("/{workerId}")
    public ResponseEntity<?> updateWorkerProfile(@PathVariable Long workerId, @RequestBody Map<String, Object> updates) {
        Optional<User> userOpt = userRepository.findById(workerId);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        
        if (updates.containsKey("name")) {
            user.setName((String) updates.get("name"));
        }
        if (updates.containsKey("zone")) {
            user.setZone((String) updates.get("zone"));
        }
        if (updates.containsKey("phone")) {
            user.setPhone((String) updates.get("phone"));
        }
        if (updates.containsKey("totalEarnings")) {
            user.setTotalEarnings(((Number) updates.get("totalEarnings")).doubleValue());
        }
        
        userRepository.save(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Profile updated successfully");
        response.put("id", user.getId());
        
        return ResponseEntity.ok(response);
    }

    // ============= NEW AI INTEGRATION ENDPOINTS =============

    // Evaluate worker risk using AI
    @PostMapping("/{workerId}/evaluate-risk")
    public ResponseEntity<?> evaluateWorkerRisk(@PathVariable String workerId, @RequestBody(required = false) Map<String, Object> additionalData) {
        try {
            Long id;
            try {
                id = Long.parseLong(workerId);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID format"));
            }
            
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            
            // Prepare data for AI
            Map<String, Object> aiRequest = new HashMap<>();
            aiRequest.put("worker_id", workerId);
            aiRequest.put("zone", user.getZone() != null ? user.getZone() : "Zone_B_Mumbai");
            aiRequest.put("gps_lat", 19.0760); // Default Mumbai
            aiRequest.put("gps_lon", 72.8777);
            aiRequest.put("daily_earnings_inr", user.getTotalEarnings() != null ? user.getTotalEarnings() / 7 : 800);
            aiRequest.put("weekly_earnings_inr", user.getTotalEarnings() != null ? user.getTotalEarnings() : 4500);
            aiRequest.put("num_deliveries", 15);
            aiRequest.put("active_hours", 6.0);
            aiRequest.put("gps_speed_variance", 1.2);
            aiRequest.put("location_jump_km", 0.0);
            
            // Override with additional data if provided
            if (additionalData != null) {
                aiRequest.putAll(additionalData);
            }
            
            // Call AI service
            Map<String, Object> aiResponse = aiService.evaluateWorkerRisk(aiRequest);
            
            // Return combined response
            Map<String, Object> response = new HashMap<>();
            response.put("worker_id", workerId);
            response.put("worker_name", user.getName());
            response.put("risk_level", aiResponse.getOrDefault("risk_level", "Moderate"));
            response.put("weekly_premium", aiResponse.getOrDefault("weekly_premium_inr", 25.0));
            response.put("fraud_check", aiResponse.getOrDefault("fraud_check", "Normal"));
            response.put("status", aiResponse.getOrDefault("status", "PROCESSED"));
            response.put("live_conditions", aiResponse.get("live_conditions"));
            response.put("payout_info", aiResponse.get("payout"));
            response.put("timestamp", java.time.Instant.now().toString());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Risk evaluation error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Risk evaluation failed: " + e.getMessage(),
                "worker_id", workerId
            ));
        }
    }

    // Get live status for a worker
    @GetMapping("/{workerId}/live-status")
    public ResponseEntity<?> getLiveStatus(@PathVariable String workerId, @RequestParam(required = false) String zone) {
        try {
            Long id;
            try {
                id = Long.parseLong(workerId);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID format"));
            }
            
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            String userZone = zone != null ? zone : (user.getZone() != null ? user.getZone() : "Zone_B_Mumbai");
            
            // Prepare AI request for live monitoring
            Map<String, Object> aiRequest = new HashMap<>();
            aiRequest.put("worker_id", workerId);
            aiRequest.put("zone", userZone);
            aiRequest.put("gps_lat", 19.0760);
            aiRequest.put("gps_lon", 72.8777);
            aiRequest.put("daily_earnings_inr", user.getTotalEarnings() != null ? user.getTotalEarnings() / 7 : 800);
            aiRequest.put("weekly_earnings_inr", user.getTotalEarnings() != null ? user.getTotalEarnings() : 4500);
            aiRequest.put("num_deliveries", 15);
            aiRequest.put("active_hours", 6.0);
            aiRequest.put("gps_speed_variance", 1.2);
            aiRequest.put("location_jump_km", 0.0);
            
            // Call AI service
            Map<String, Object> aiResponse = aiService.evaluateWorkerRisk(aiRequest);
            
            Map<String, Object> response = new HashMap<>();
            response.put("worker_id", workerId);
            response.put("status", aiResponse.getOrDefault("status", "MONITORING"));
            response.put("risk_level", aiResponse.getOrDefault("risk_level", "Moderate"));
            response.put("live_conditions", aiResponse.get("live_conditions"));
            response.put("payout_eligible", ((Map) aiResponse.getOrDefault("payout", Map.of())).get("triggered"));
            response.put("fraud_check", aiResponse.getOrDefault("fraud_check", "Normal"));
            response.put("timestamp", java.time.Instant.now().toString());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Live status error: " + e.getMessage());
            // Return default status instead of error
            return ResponseEntity.ok(Map.of(
                "worker_id", workerId,
                "status", "MONITORING",
                "risk_level", "Moderate",
                "message", "Using default values (AI service unavailable)",
                "timestamp", java.time.Instant.now().toString()
            ));
        }
    }

    // Get AI-powered dashboard summary for worker
    @GetMapping("/{workerId}/dashboard")
    public ResponseEntity<?> getDashboardSummary(@PathVariable String workerId) {
        try {
            Long id;
            try {
                id = Long.parseLong(workerId);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID format"));
            }
            
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            
            // Get risk evaluation
            Map<String, Object> aiRequest = new HashMap<>();
            aiRequest.put("worker_id", workerId);
            aiRequest.put("zone", user.getZone() != null ? user.getZone() : "Zone_B_Mumbai");
            aiRequest.put("gps_lat", 19.0760);
            aiRequest.put("gps_lon", 72.8777);
            aiRequest.put("daily_earnings_inr", user.getTotalEarnings() != null ? user.getTotalEarnings() / 7 : 800);
            aiRequest.put("weekly_earnings_inr", user.getTotalEarnings() != null ? user.getTotalEarnings() : 4500);
            aiRequest.put("num_deliveries", 15);
            aiRequest.put("active_hours", 6.0);
            aiRequest.put("gps_speed_variance", 1.2);
            aiRequest.put("location_jump_km", 0.0);
            
            Map<String, Object> aiResponse = aiService.evaluateWorkerRisk(aiRequest);
            
            Map<String, Object> dashboard = new HashMap<>();
            dashboard.put("worker", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "zone", user.getZone(),
                "totalEarnings", user.getTotalEarnings()
            ));
            dashboard.put("risk_assessment", Map.of(
                "level", aiResponse.getOrDefault("risk_level", "Moderate"),
                "score", aiResponse.getOrDefault("risk_score", 50),
                "fraud_check", aiResponse.getOrDefault("fraud_check", "Normal")
            ));
            dashboard.put("insurance", Map.of(
                "weekly_premium", aiResponse.getOrDefault("weekly_premium_inr", 25.0),
                "payout_info", aiResponse.get("payout")
            ));
            dashboard.put("live_environment", aiResponse.get("live_conditions"));
            dashboard.put("timestamp", java.time.Instant.now().toString());
            
             return ResponseEntity.ok(dashboard);
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}