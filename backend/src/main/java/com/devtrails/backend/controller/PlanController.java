package com.devtrails.backend.controller;

import com.devtrails.backend.model.Plan;
import com.devtrails.backend.model.User;
import com.devtrails.backend.repository.PlanRepository;
import com.devtrails.backend.repository.UserRepository;
import com.devtrails.backend.service.PlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PlanController {

    @Autowired
    private PlanService planService;
    
    @Autowired
    private PlanRepository planRepository;
    
    @Autowired
    private UserRepository userRepository;

    // Zone multipliers based on cost of living + risk
    private static final Map<String, Double> ZONE_MULTIPLIERS = new HashMap<>();
    static {
        ZONE_MULTIPLIERS.put("Zone_A_Bangalore", 1.0);
        ZONE_MULTIPLIERS.put("Zone_B_Mumbai", 1.3);
        ZONE_MULTIPLIERS.put("Zone_C_Delhi", 1.25);
        ZONE_MULTIPLIERS.put("Zone_D_Hyderabad", 1.1);
        ZONE_MULTIPLIERS.put("Zone_E_Chennai", 1.15);
    }

    // Base rate per ₹1000 coverage
    private static final double BASE_RATE_PER_1000 = 12.5;

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
        List<Plan> allPlans = planRepository.findAll();
        List<Map<String, Object>> dynamicPlans = new ArrayList<>();
        
        for (Plan plan : allPlans) {
            // DYNAMIC PREMIUM CALCULATION - NOT FROM DATABASE!
            double calculatedPremium = (plan.getCoverage() / 1000.0) * BASE_RATE_PER_1000 * multiplier;
            calculatedPremium = Math.round(calculatedPremium * 100.0) / 100.0;
            
            Map<String, Object> planResponse = new HashMap<>();
            planResponse.put("id", plan.getId());
            planResponse.put("name", plan.getName());
            planResponse.put("coverage", plan.getCoverage());
            planResponse.put("premium", calculatedPremium);
            planResponse.put("zone", zone);
            planResponse.put("zoneMultiplier", multiplier);
            
            dynamicPlans.add(planResponse);
            
            System.out.println("📊 " + plan.getName() + " in " + zone + ": ₹" + calculatedPremium + "/week");
        }
        
        return ResponseEntity.ok(dynamicPlans);
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
        
        // Get user's active plan from user_plans table
        com.devtrails.backend.model.UserPlan userPlan = planService.getUserPlan(userId);
        if (userPlan == null || !userPlan.isActive()) {
            return ResponseEntity.noContent().build();
        }
        
        Plan plan = userPlan.getPlan();
        if (plan == null) {
            return ResponseEntity.notFound().build();
        }
        
        // DYNAMIC PREMIUM CALCULATION
        double calculatedPremium = (plan.getCoverage() / 1000.0) * BASE_RATE_PER_1000 * multiplier;
        calculatedPremium = Math.round(calculatedPremium * 100.0) / 100.0;
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", plan.getId());
        response.put("name", plan.getName());
        response.put("coverage", plan.getCoverage());
        response.put("premium", calculatedPremium);
        response.put("zone", zone);
        response.put("zoneMultiplier", multiplier);
        response.put("isActive", true);
        response.put("startDate", userPlan.getStartDate());
        response.put("endDate", userPlan.getEndDate());
        
        System.out.println("✅ Active plan: " + plan.getName() + " in " + zone + 
                         " (x" + multiplier + "): ₹" + calculatedPremium + "/week");
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/plans/activate")
    public Map<String, Object> activatePlan(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        Long planId = Long.valueOf(request.get("planId").toString());
        
        // Activate plan (stores only planId, NOT premium)
        String message = planService.activatePlan(userId, planId);
        
        // Get zone for premium calculation
        Optional<User> userOpt = userRepository.findById(userId);
        String zone = userOpt.map(u -> u.getZone()).orElse("Zone_D_Hyderabad");
        double multiplier = ZONE_MULTIPLIERS.getOrDefault(zone, 1.0);
        
        Optional<Plan> planOpt = planRepository.findById(planId);
        double calculatedPremium = 0;
        if (planOpt.isPresent()) {
            calculatedPremium = (planOpt.get().getCoverage() / 1000.0) * BASE_RATE_PER_1000 * multiplier;
            calculatedPremium = Math.round(calculatedPremium * 100.0) / 100.0;
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        response.put("status", "success");
        response.put("premium", calculatedPremium);
        response.put("planId", planId);
        response.put("zone", zone);
        response.put("zoneMultiplier", multiplier);
        
        System.out.println("✅ Plan activated: ₹" + calculatedPremium + "/week for user " + userId);
        
        return response;
    }
    
    @GetMapping("/zone-multiplier/{zone}")
    public ResponseEntity<Map<String, Object>> getZoneMultiplier(@PathVariable String zone) {
        double multiplier = ZONE_MULTIPLIERS.getOrDefault(zone, 1.0);
        Map<String, Object> response = new HashMap<>();
        response.put("zone", zone);
        response.put("multiplier", multiplier);
        response.put("baseRatePer1000", BASE_RATE_PER_1000);
        return ResponseEntity.ok(response);
    }
}