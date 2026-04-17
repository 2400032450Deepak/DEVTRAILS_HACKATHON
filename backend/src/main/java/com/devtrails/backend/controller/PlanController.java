package com.devtrails.backend.controller;

import com.devtrails.backend.model.User;
import com.devtrails.backend.repository.UserRepository;
import com.devtrails.backend.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PlanController {

    @Autowired
    private AIService aiService;
    
    @Autowired
    private UserRepository userRepository;

    // ============================================
    // GET PLANS WITH AI-CALCULATED PREMIUMS (NOT FROM DATABASE!)
    // ============================================
    @GetMapping("/plans")
    public ResponseEntity<List<Map<String, Object>>> getPlans(@RequestParam(required = false) Long userId) {
        List<Map<String, Object>> dynamicPlans = new ArrayList<>();
        
        // Get user's location and earnings (if logged in)
        String zone = "Zone_D_Hyderabad";
        double weeklyEarnings = 5000;
        int numDeliveries = 15;
        
        if (userId != null) {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                zone = user.getZone() != null ? user.getZone() : "Zone_D_Hyderabad";
                weeklyEarnings = user.getTotalEarnings() != null ? user.getTotalEarnings() : 5000;
                numDeliveries = 15; // You can fetch from user stats
            }
        }
        
        // Define plan tiers (without premium - AI will calculate)
        int[][] tiers = {
            {1, 2000},   // Tier 1: ₹2000 coverage
            {2, 1200},   // Tier 2: ₹1200 coverage  
            {3, 700}     // Tier 3: ₹700 coverage
        };
        
        for (int[] tier : tiers) {
            int planId = tier[0];
            int coverage = tier[1];
            String planName = planId == 1 ? "Tier 1 - Premium" : 
                             (planId == 2 ? "Tier 2 - Standard" : "Tier 3 - Basic");
            
            // Call AI to calculate premium dynamically
            Map<String, Object> aiRequest = new HashMap<>();
            aiRequest.put("zone", zone);
            aiRequest.put("weekly_earnings_inr", weeklyEarnings);
            aiRequest.put("num_deliveries", numDeliveries);
            aiRequest.put("coverage", coverage);
            aiRequest.put("calculate_premium", true);
            
            Map<String, Object> aiResponse = aiService.evaluateWorkerRisk(aiRequest);
            
            // Get premium from AI (not from database!)
            double premium = ((Number) aiResponse.getOrDefault("weekly_premium_inr", 25.0)).doubleValue();
            
            Map<String, Object> plan = new HashMap<>();
            plan.put("id", planId);
            plan.put("name", planName);
            plan.put("coverage", coverage);
            plan.put("premium", Math.round(premium * 100.0) / 100.0);  // AI-calculated premium
            plan.put("zone", zone);
            
            dynamicPlans.add(plan);
            
            System.out.println("🤖 AI Calculated Premium for " + planName + " in " + zone + ": ₹" + premium);
        }
        
        return ResponseEntity.ok(dynamicPlans);
    }

    // Get active plan for user with AI-calculated premium
    @GetMapping("/plans/active/{userId}")
    public ResponseEntity<Map<String, Object>> getActivePlan(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        String zone = user.getZone() != null ? user.getZone() : "Zone_D_Hyderabad";
        
        // Get user's selected plan from user_plans table
        Long activePlanId = getActivePlanIdFromUserPlans(userId);
        if (activePlanId == null) {
            return ResponseEntity.noContent().build();
        }
        
        // Get base info for this plan
        int coverage = getCoverageForPlanId(activePlanId);
        String planName = getPlanNameForId(activePlanId);
        
        // Call AI to calculate current premium
        Map<String, Object> aiRequest = new HashMap<>();
        aiRequest.put("zone", zone);
        aiRequest.put("weekly_earnings_inr", user.getTotalEarnings() != null ? user.getTotalEarnings() : 5000);
        aiRequest.put("num_deliveries", 15);
        aiRequest.put("coverage", coverage);
        
        Map<String, Object> aiResponse = aiService.evaluateWorkerRisk(aiRequest);
        double premium = ((Number) aiResponse.getOrDefault("weekly_premium_inr", 25.0)).doubleValue();
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", activePlanId);
        response.put("name", planName);
        response.put("coverage", coverage);
        response.put("premium", Math.round(premium * 100.0) / 100.0);  // AI-calculated!
        response.put("isActive", true);
        response.put("zone", zone);
        
        return ResponseEntity.ok(response);
    }
    
    private Long getActivePlanIdFromUserPlans(Long userId) {
        // Query your user_plans table
        // Return plan_id if active plan exists, else null
        // For now, return 1 for demo
        return 1L;
    }
    
    private int getCoverageForPlanId(Long planId) {
        if (planId == 1) return 2000;
        if (planId == 2) return 1200;
        return 700;
    }
    
    private String getPlanNameForId(Long planId) {
        if (planId == 1) return "Tier 1 - Premium";
        if (planId == 2) return "Tier 2 - Standard";
        return "Tier 3 - Basic";
    }

    @PostMapping("/plans/activate")
    public Map<String, String> activatePlan(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        Long planId = Long.valueOf(request.get("planId").toString());
        
        // Save to user_plans table (only which plan, not the premium!)
        saveUserPlan(userId, planId);
        
        return Map.of("message", "Plan activated successfully", "status", "success");
    }
    
    private void saveUserPlan(Long userId, Long planId) {
        // Save to database - only store which plan, NOT the premium amount
        // Premium should always be calculated dynamically by AI
    }
}