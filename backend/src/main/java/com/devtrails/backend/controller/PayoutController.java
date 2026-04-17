package com.devtrails.backend.controller;

import com.devtrails.backend.model.Payout;
import com.devtrails.backend.repository.PayoutRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PayoutController {

    private final PayoutRepository payoutRepository;

    public PayoutController(PayoutRepository payoutRepository) {
        this.payoutRepository = payoutRepository;
    }

    @GetMapping("/payouts")
    public List<Payout> getPayouts() {
        return payoutRepository.findAll();
    }

    @GetMapping("/payouts/user/{userId}")
    public List<Payout> getUserPayouts(@PathVariable Long userId) {
        return payoutRepository.findByUserId(userId);
    }

    // ============================================
    // GET TOTAL PROTECTED EARNINGS (REAL DATA)
    // ============================================
    @GetMapping("/payouts/total/{userId}")
    public ResponseEntity<Map<String, Object>> getTotalProtected(@PathVariable Long userId) {
        List<Payout> userPayouts = payoutRepository.findByUserId(userId);
        double total = userPayouts.stream().mapToDouble(Payout::getAmount).sum();
        
        Map<String, Object> response = new HashMap<>();
        response.put("total_protected", total);
        response.put("currency", "INR");
        response.put("user_id", userId);
        response.put("payout_count", userPayouts.size());
        return ResponseEntity.ok(response);
    }

    // ============================================
    // SIMULATE TRIGGER (For Demo)
    // ============================================
    @PostMapping("/payout/simulate")
    public ResponseEntity<Map<String, Object>> simulateTrigger(@RequestBody Map<String, String> request) {
        String triggerType = request.get("type");
        Double value = Double.parseDouble(request.get("value"));
        Long userId = Long.parseLong(request.get("userId"));
        
        Map<String, Object> response = new HashMap<>();
        
        double payoutAmount = 0;
        String reason = "";
        
        switch(triggerType) {
            case "HEAVY_RAIN":
                payoutAmount = 300 + (value - 40) * 10;
                reason = "Heavy Rainfall: " + value + "mm/hr";
                break;
            case "EXTREME_HEAT":
                payoutAmount = 200 + (value - 42) * 15;
                reason = "Extreme Heat: " + value + "°C";
                break;
            case "HIGH_POLLUTION":
                payoutAmount = 250 + (value - 300) * 2;
                reason = "High Pollution: AQI " + value;
                break;
            default:
                payoutAmount = 300;
                reason = "Trigger activated";
        }
        
        payoutAmount = Math.min(payoutAmount, 1000);
        payoutAmount = Math.round(payoutAmount);
        
        Payout payout = new Payout();
        payout.setUserId(userId);
        payout.setAmount((int) payoutAmount);
        payout.setReason(reason);
        payout.setStatus("COMPLETED");
        payout.setTransactionId("TXN_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payout.setTimestamp(LocalDateTime.now());
        payoutRepository.save(payout);
        
        response.put("success", true);
        response.put("payout_amount", payoutAmount);
        response.put("reason", reason);
        response.put("transaction_id", payout.getTransactionId());
        response.put("message", "✅ ₹" + payoutAmount + " credited to your UPI instantly!");
        
        System.out.println("💰 Demo payout: ₹" + payoutAmount + " to user " + userId + " for " + reason);
        
        return ResponseEntity.ok(response);
    }
}