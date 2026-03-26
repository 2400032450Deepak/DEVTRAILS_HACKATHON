package com.devtrails.backend.service;

import com.devtrails.backend.model.Plan;
import com.devtrails.backend.model.UserPlan;
import com.devtrails.backend.repository.PlanRepository;
import com.devtrails.backend.repository.UserPlanRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlanService {

    private final PlanRepository planRepository;
    private final UserPlanRepository userPlanRepository;

    public PlanService(PlanRepository planRepository, UserPlanRepository userPlanRepository) {
        this.planRepository = planRepository;
        this.userPlanRepository = userPlanRepository;
    }

    public List<Plan> getAllPlans() {
        return planRepository.findAll();
    }

    public String activatePlan(Long userId, Long planId) {
        UserPlan userPlan = new UserPlan(userId, planId, true);
        userPlanRepository.save(userPlan);
        return "Plan activated successfully";
    }
}