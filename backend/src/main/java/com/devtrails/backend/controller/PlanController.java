package com.devtrails.backend.controller;

import com.devtrails.backend.dto.CreatePlanRequest;
import com.devtrails.backend.model.Plan;
import com.devtrails.backend.service.PlanService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")  // ← ADDED /api prefix
public class PlanController {

    private final PlanService planService;

    public PlanController(PlanService planService) {
        this.planService = planService;
    }

    @GetMapping("/plans")
    public List<Plan> getPlans() {
        return planService.getAllPlans();
    }

    @PostMapping("/activate-plan")
    public Map<String, String> activatePlan(@RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        Long planId = request.get("planId");

        String message = planService.activatePlan(userId, planId);
        return Map.of("message", message);
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