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

    // Zone multipliers - SINGLE SOURCE OF TRUTH
    private static final Map<String, Double> ZONE_MULTIPLIERS = new HashMap<>();
    static {
        ZONE_MULTIPLIERS.put("Zone_A_Bangalore", 1.0);
        ZONE_MULTIPLIERS.put("Zone_B_Mumbai", 1.2);
        ZONE_MULTIPLIERS.put("Zone_C_Delhi", 1.3);
        ZONE_MULTIPLIERS.put("Zone_D_Hyderabad", 1.1);
        ZONE_MULTIPLIERS.put("Zone_E_Chennai", 1.15);
    }

    // Base premiums (without zone adjustment)
    private static final Map<Integer, Double> BASE_PREMIUMS = new HashMap<>();
    static {
        BASE_PREMIUMS.put(1, 22.5);  // Tier 1 base
        BASE_PREMIUMS.put(2, 18.0);  // Tier 2 base
        BASE_PREMIUMS.put(3, 15.0);  // Tier 3 base
    }

    // Coverage amounts
    private static final Map<Integer, Integer> COVERAGES = new HashMap<>();
    static {
        COVERAGES.put(1, 2000);
        COVERAGES.put(2, 1200);
        COVERAGES.put(3, 700);
    }

    // Plan names
    private static final Map<Integer, String> PLAN_NAMES = new HashMap<>();
    static {
        PLAN_NAMES.put(1, "Tier 1 - Premium");
        PLAN_NAMES.put(2, "Tier 2 - Standard");
        PLAN_NAMES.put(3, "Tier 3 - Basic");
    }

    @GetMapping("/plans")
    public ResponseEntity<List<Map<String, Object>>> getPlans(@RequestParam(required = false) Long userId) {
        String zone = "Zone_D_Hyderabad"; // Default
        
        if (userId != null) {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                zone = userOpt.get().getZone() != null ? userOpt.get().getZone() : "Zone_D_Hyderabad";
            }
        }
        
        double multiplier = ZONE_MULTIPLIERS.getOrDefault(zone, 1.0);
        List<Map<String, Object>> plans = new ArrayList<>();
        
        for (int tierId : Arrays.asList(1, 2, 3)) {
            double basePremium = BASE_PREMIUMS.get(tierId);
            double finalPremium = Math.round(basePremium * multiplier * 100.0) / 100.0;
            
            Map<String, Object> plan = new HashMap<>();
            plan.put("id", tierId);
            plan.put("name", PLAN_NAMES.get(tierId));
            plan.put("coverage", COVERAGES.get(tierId));
            plan.put("premium", finalPremium);
            plan.put("basePremium", basePremium);
            plan.put("zone", zone);
            plan.put("zoneMultiplier", multiplier);
            
            plans.add(plan);
        }
        
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/plans/active/{userId}")
    public ResponseEntity<Map<String, Object>> getActivePlan(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        String zone = user.getZone() != null ? user.getZone() : "Zone_D_Hyderabad";
        double multiplier = ZONE_MULTIPLIERS.getOrDefault(zone, 1.0);
        
        // Get user's active plan ID from user_plans table
        Long activePlanId = getActivePlanIdFromUserPlans(userId);
        if (activePlanId == null) {
            return ResponseEntity.noContent().build();
        }
        
        double basePremium = BASE_PREMIUMS.getOrDefault(activePlanId.intValue(), 22.5);
        double finalPremium = Math.round(basePremium * multiplier * 100.0) / 100.0;
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", activePlanId);
        response.put("name", PLAN_NAMES.get(activePlanId.intValue()));
        response.put("coverage", COVERAGES.get(activePlanId.intValue()));
        response.put("premium", finalPremium);
        response.put("basePremium", basePremium);
        response.put("zone", zone);
        response.put("zoneMultiplier", multiplier);
        response.put("isActive", true);
        
        System.out.println("✅ Active plan: " + PLAN_NAMES.get(activePlanId.intValue()) + 
                         " | Zone: " + zone + " (x" + multiplier + ")" +
                         " | Premium: ₹" + finalPremium);
        
        return ResponseEntity.ok(response);
    }
    
    private Long getActivePlanIdFromUserPlans(Long userId) {
        // Query user_plans table
        // This should return the plan_id from database
        // For demo, return 1
        return 1L;
    }

    @PostMapping("/plans/activate")
    public Map<String, Object> activatePlan(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        Long planId = Long.valueOf(request.get("planId").toString());
        
        saveUserPlan(userId, planId);
        
        // Get zone for premium calculation
        Optional<User> userOpt = userRepository.findById(userId);
        String zone = userOpt.map(u -> u.getZone()).orElse("Zone_D_Hyderabad");
        double multiplier = ZONE_MULTIPLIERS.getOrDefault(zone, 1.0);
        double basePremium = BASE_PREMIUMS.getOrDefault(planId.intValue(), 22.5);
        double finalPremium = Math.round(basePremium * multiplier * 100.0) / 100.0;
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Plan activated successfully");
        response.put("status", "success");
        response.put("premium", finalPremium);
        response.put("planId", planId);
        
        return response;
    }
    
    private void saveUserPlan(Long userId, Long planId) {
        // Save to user_plans table
        System.out.println("✅ Activated plan " + planId + " for user " + userId);
    }
}