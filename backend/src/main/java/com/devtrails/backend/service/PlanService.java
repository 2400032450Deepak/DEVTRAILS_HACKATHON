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
        // First, deactivate any existing active plan for this user
        UserPlan existingActivePlan = null;
        List<UserPlan> allPlans = userPlanRepository.findAll();
        
        for (UserPlan up : allPlans) {
            if (up.getUserId().equals(userId) && up.isActive()) {
                existingActivePlan = up;
                break;
            }
        }
        
        if (existingActivePlan != null) {
            existingActivePlan.setActive(false);
            userPlanRepository.save(existingActivePlan);
            System.out.println("📝 Deactivated previous plan for user: " + userId);
        }
        
        // Create or update with new plan
        UserPlan userPlan = new UserPlan(userId, planId, true);
        userPlan.setStartDate(LocalDate.now());
        userPlan.setEndDate(LocalDate.now().plusDays(7));
        userPlanRepository.save(userPlan);
        
        System.out.println("✅ Activated plan " + planId + " for user " + userId);
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

    public Plan getPlanById(Long planId) {
        return planRepository.findById(planId).orElse(null);
    }

    public UserPlan getUserPlan(Long userId) {
        List<UserPlan> plans = userPlanRepository.findAll();
        System.out.println("🔍 Looking for active plan for user: " + userId);
        
        for (UserPlan up : plans) {
            System.out.println("   Checking UserPlan: userId=" + up.getUserId() + ", active=" + up.isActive() + ", planId=" + up.getPlanId());
            
            if (up.getUserId().equals(userId) && up.isActive()) {
                // Check if plan is expired
                if (up.getEndDate() != null && up.getEndDate().isBefore(LocalDate.now())) {
                    System.out.println("⚠️ Plan expired for user: " + userId);
                    up.setActive(false);
                    userPlanRepository.save(up);
                    return null;
                }
                
                Plan plan = getPlanById(up.getPlanId());
                if (plan != null) {
                    up.setPlan(plan);
                    System.out.println("✅ Found active plan: " + plan.getName() + " (ID: " + plan.getId() + ")");
                    return up;
                }
            }
        }
        
        System.out.println("❌ No active plan found for user: " + userId);
        return null;
    }
}