package com.devtrails.backend.service;

import com.devtrails.backend.model.Payout;
import com.devtrails.backend.model.User;
import com.devtrails.backend.repository.PayoutRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PayoutService {

    @Autowired
    private PayoutRepository payoutRepository;

    /**
     * Process automatic payout when a trigger is detected
     */
    public void processAutoPayout(User user, double amount, String reason) {
        try {
            Payout payout = new Payout();
            payout.setUserId(user.getId());
            payout.setAmount((int) Math.round(amount));
            payout.setReason(reason);
            payout.setStatus("COMPLETED");
            payout.setTransactionId("AUTO_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            payout.setTimestamp(LocalDateTime.now());
            payout.setTriggerType(reason.contains("Rain") ? "HEAVY_RAIN" : 
                                 reason.contains("Heat") ? "EXTREME_HEAT" : 
                                 reason.contains("Pollution") ? "HIGH_POLLUTION" : "OTHER");
            
            payoutRepository.save(payout);
            
            System.out.println("💰 Auto payout processed: ₹" + amount + " to user " + user.getId() + " for: " + reason);
            
            // TODO: Send notification to user (WhatsApp/SMS)
            
        } catch (Exception e) {
            System.err.println("❌ Failed to process auto payout: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * Process manual/instant payout (for demo simulation)
     */
    public Payout processInstantPayout(Long userId, double amount, String reason, String triggerType) {
        Payout payout = new Payout();
        payout.setUserId(userId);
        payout.setAmount((int) Math.round(amount));
        payout.setReason(reason);
        payout.setStatus("COMPLETED");
        payout.setTransactionId("TXN_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payout.setTimestamp(LocalDateTime.now());
        payout.setTriggerType(triggerType);
        
        return payoutRepository.save(payout);
    }
    
    /**
     * Get total payouts for a user
     */
    public double getTotalPayoutsForUser(Long userId) {
        return payoutRepository.findByUserId(userId)
                .stream()
                .mapToDouble(Payout::getAmount)
                .sum();
    }
}