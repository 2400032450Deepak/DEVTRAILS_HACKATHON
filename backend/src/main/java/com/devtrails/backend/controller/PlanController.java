package com.devtrails.backend.controller;

import com.devtrails.backend.dto.CreatePlanRequest;
import com.devtrails.backend.model.Plan;
import com.devtrails.backend.model.UserPlan;
import com.devtrails.backend.service.PlanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PlanController {

    private final PlanService planService;

    public PlanController(PlanService planService) {
        this.planService = planService;
    }

    // Get all plans - matches frontend: /api/plans
    @GetMapping("/plans")
    public List<Plan> getPlans() {
        return planService.getAllPlans();
    }

    // Get active plan for a user - matches frontend: /api/plans/active/{workerId}
    @GetMapping("/plans/active/{userId}")
    public ResponseEntity<?> getActivePlan(@PathVariable Long userId) {
        UserPlan userPlan = planService.getUserPlan(userId);
        
        if (userPlan != null && userPlan.isActive()) {
            Plan plan = planService.getPlanById(userPlan.getPlanId());
            Map<String, Object> response = new HashMap<>();
            response.put("id", userPlan.getId());
            response.put("planId", plan.getId());
            response.put("name", plan.getName());
            response.put("premium", plan.getPremium());
            response.put("coverage", plan.getCoverage());
            response.put("startDate", LocalDate.now());
            response.put("endDate", LocalDate.now().plusDays(7));
            response.put("isActive", userPlan.isActive());
            return ResponseEntity.ok(response);
        }
        
        return ResponseEntity.noContent().build();
    }

    // Activate a plan - matches frontend: /api/plans/activate
    @PostMapping("/plans/activate")
    public Map<String, String> activatePlan(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        Long planId = Long.valueOf(request.get("planId").toString());

        String message = planService.activatePlan(userId, planId);
        return Map.of("message", message);
    }

    // Keep existing endpoints for backward compatibility
    @PostMapping("/activate-plan")
    public Map<String, String> activatePlanOld(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        Long planId = Long.valueOf(request.get("planId").toString());

        String message = planService.activatePlan(userId, planId);
        return Map.of("message", message);
    }

    @GetMapping("/my-plan")
    public UserPlan getMyPlan(@RequestParam String userId) {
        return planService.getUserPlan(Long.valueOf(userId));
    }

    @PostMapping("/create-plan")
    public Map<String, String> createPlan(@RequestBody CreatePlanRequest request) {
        String message = planService.createPlan(
                request.name,
                request.premium,
                request.coverage,
                request.email
        );
        return Map.of("message", message);
    }
}