package com.devtrails.backend.service;

import com.devtrails.backend.model.Plan;
import com.devtrails.backend.model.UserPlan;
import com.devtrails.backend.repository.PlanRepository;
import com.devtrails.backend.repository.UserPlanRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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
        List<UserPlan> plans = userPlanRepository.findAll();
        UserPlan existingPlan = null;
        for (UserPlan up : plans) {
            if (up.getUserId().equals(userId)) {
                existingPlan = up;
                break;
            }
        }
        
        if (existingPlan != null) {
            existingPlan.setPlanId(planId);
            existingPlan.setActive(true);
            existingPlan.setStartDate(LocalDate.now());
            existingPlan.setEndDate(LocalDate.now().plusDays(7));
            userPlanRepository.save(existingPlan);
        } else {
            UserPlan userPlan = new UserPlan(userId, planId, true);
            userPlanRepository.save(userPlan);
        }
        return "Plan activated successfully";
    }

    public String createPlan(String name, int premium, int coverage, String email) {

        if (!email.equals("admin@devtrails.com")) {
            return "Access denied";
        }

        Plan plan = new Plan(name, premium, coverage);
        planRepository.save(plan);

        return "Plan created successfully";
    }

    // Add this method to PlanService.java
    public Plan getPlanById(Long planId) {
        return planRepository.findById(planId).orElse(null);
    }

    public UserPlan getUserPlan(Long userId) {
        List<UserPlan> plans = userPlanRepository.findAll();
        for (UserPlan up : plans) {
            if (up.getUserId().equals(userId) && up.isActive()) {
                // Fetch and set the plan
                Plan plan = getPlanById(up.getPlanId());
                up.setPlan(plan);
                return up;
            }
        }
        return null;
    }
}