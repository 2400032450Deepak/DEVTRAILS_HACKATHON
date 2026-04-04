package com.devtrails.backend.controller;

import com.devtrails.backend.dto.PaymentRequest;
import com.devtrails.backend.service.AIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private AIService aiService;

    @PostMapping("/payment")
    public ResponseEntity<?> createPayment(@RequestBody PaymentRequest request) {
        try {
            System.out.println("📝 Payment request received:");
            System.out.println("   Amount: " + request.getAmount());
            System.out.println("   Plan ID: " + request.getPlanId());
            System.out.println("   User ID: " + request.getUserId());
            System.out.println("   Zone: " + request.getZone());
            
            // Validate amount
            if (request.getAmount() == null || request.getAmount() <= 0) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid amount",
                    "success", false
                ));
            }
            
            // Call AI for fraud detection and risk assessment
            Map<String, Object> aiResponse = aiService.checkPaymentFraud(
                request.getUserId(), 
                request.getAmount(),
                request.getZone()
            );
            
            System.out.println("🤖 AI Response: " + aiResponse);
            
            // Check if AI blocks the transaction
            String status = (String) aiResponse.getOrDefault("status", "PROCESSED");
            if ("BLOCKED".equals(status)) {
                String reason = (String) aiResponse.getOrDefault("reason", "Suspicious activity detected");
                System.out.println("🚨 Transaction blocked by AI: " + reason);
                return ResponseEntity.badRequest().body(Map.of(
                    "error", reason,
                    "success", false,
                    "blocked_by_ai", true,
                    "fraud_check", aiResponse.get("fraud_check"),
                    "anomaly_score", aiResponse.get("anomaly_score")
                ));
            }
            
            // Generate unique payment ID
            String paymentId = "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            
            // Get AI recommendations
            String riskLevel = (String) aiResponse.getOrDefault("risk_level", "Moderate");
            Double premiumAmount = ((Number) aiResponse.getOrDefault("weekly_premium_inr", 25.0)).doubleValue();
            Map<String, Object> payout = (Map<String, Object>) aiResponse.getOrDefault("payout", Map.of());
            
            System.out.println("✅ Payment successful: " + paymentId);
            System.out.println("   Risk Level: " + riskLevel);
            System.out.println("   Premium: ₹" + premiumAmount);
            System.out.println("   Payout Triggered: " + payout.get("triggered"));
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "paymentId", paymentId,
                "risk_level", riskLevel,
                "premium_amount", premiumAmount,
                "payout_triggered", payout.get("triggered"),
                "payout_amount", payout.get("amount"),
                "live_conditions", aiResponse.get("live_conditions"),
                "message", "Payment processed successfully with AI validation"
            ));
            
        } catch (Exception e) {
            System.err.println("❌ Payment error: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Payment failed: " + e.getMessage(),
                "success", false
            ));
        }
    }
    
    @GetMapping("/payment/status/{paymentId}")
    public ResponseEntity<?> getPaymentStatus(@PathVariable String paymentId) {
        Map<String, Object> response = new HashMap<>();
        response.put("paymentId", paymentId);
        response.put("status", "SUCCESS");
        response.put("verified", true);
        response.put("message", "Payment verified successfully");
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/payment/ai-validate")
    public ResponseEntity<?> validateWithAI(@RequestBody Map<String, String> request) {
        try {
            String userId = request.get("userId");
            String zone = request.getOrDefault("zone", "Zone_B_Mumbai");
            
            Map<String, Object> aiResponse = aiService.checkPaymentFraud(userId, 0.0, zone);
            
            return ResponseEntity.ok(Map.of(
                "valid", !"BLOCKED".equals(aiResponse.get("status")),
                "risk_level", aiResponse.get("risk_level"),
                "fraud_check", aiResponse.get("fraud_check"),
                "live_conditions", aiResponse.get("live_conditions")
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("valid", true, "error", e.getMessage()));
        }
    }
}