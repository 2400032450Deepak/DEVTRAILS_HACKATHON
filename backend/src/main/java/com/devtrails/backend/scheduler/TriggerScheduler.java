package com.devtrails.backend.scheduler;

import com.devtrails.backend.model.User;
import com.devtrails.backend.model.UserPlan;
import com.devtrails.backend.repository.UserPlanRepository;
import com.devtrails.backend.repository.UserRepository;
import com.devtrails.backend.service.PayoutService;
import com.devtrails.backend.service.StatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component
@EnableScheduling
public class TriggerScheduler {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserPlanRepository userPlanRepository;
    
    @Autowired
    private StatusService statusService;
    
    @Autowired(required = false)  // Add this to avoid error if PayoutService not found
    private PayoutService payoutService;

    // Runs every 5 minutes to check triggers for all active users
    @Scheduled(fixedDelay = 300000) // 5 minutes
    public void checkTriggersForAllActiveUsers() {
        System.out.println("🔍 [" + LocalDateTime.now() + "] Running automated trigger check...");
        
        try {
            // Get all users with active plans
            List<UserPlan> activePlans = userPlanRepository.findByIsActiveTrue();
            
            if (activePlans.isEmpty()) {
                System.out.println("📭 No active plans found.");
                return;
            }
            
            System.out.println("📊 Checking triggers for " + activePlans.size() + " active users...");
            
            for (UserPlan userPlan : activePlans) {
                User user = userRepository.findById(userPlan.getUserId()).orElse(null);
                if (user == null) continue;
                
                try {
                    // Get current status (includes weather, AQI, triggers)
                    Map<String, Object> status = statusService.getStatus(user.getId());
                    
                    boolean isTriggered = (boolean) status.getOrDefault("is_triggered", false);
                    double payoutAmount = ((Number) status.getOrDefault("payout_amount", 0)).doubleValue();
                    String payoutReason = (String) status.getOrDefault("payout_reason", "");
                    
                    if (isTriggered && payoutAmount > 0) {
                        System.out.println("⚡ TRIGGER DETECTED for user " + user.getId() + ": " + payoutReason);
                        
                        // Process auto payout (check if service exists)
                        if (payoutService != null) {
                            payoutService.processAutoPayout(user, payoutAmount, payoutReason);
                            System.out.println("💰 Auto payout of ₹" + payoutAmount + " processed for user " + user.getId());
                        } else {
                            System.out.println("⚠️ PayoutService not available, but trigger detected for user " + user.getId());
                        }
                    }
                    
                } catch (Exception e) {
                    System.err.println("❌ Trigger check failed for user " + user.getId() + ": " + e.getMessage());
                }
            }
            
            System.out.println("✅ Trigger check completed at " + LocalDateTime.now());
            
        } catch (Exception e) {
            System.err.println("❌ Trigger scheduler error: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // Runs every hour to log summary
    @Scheduled(fixedDelay = 3600000) // 1 hour
    public void logSummary() {
        long activeUsers = userPlanRepository.countByIsActiveTrue();
        System.out.println("📊 SUMMARY - Active users: " + activeUsers + " | Time: " + LocalDateTime.now());
    }
}