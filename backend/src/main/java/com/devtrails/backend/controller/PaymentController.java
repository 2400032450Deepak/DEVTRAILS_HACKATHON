// backend/src/main/java/com/devtrails/backend/controller/PaymentController.java
package com.devtrails.backend.controller;

import com.devtrails.backend.dto.PaymentRequest;
import com.devtrails.backend.dto.PaymentResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PaymentController {

    @PostMapping("/payment")
    public ResponseEntity<?> createPayment(@RequestBody PaymentRequest request) {
        try {
            System.out.println("📝 Payment request received:");
            System.out.println("   Amount: " + request.getAmount());
            System.out.println("   Plan ID: " + request.getPlanId());
            System.out.println("   Gateway: " + request.getGateway());
            
            // Validate amount
            if (request.getAmount() == null || request.getAmount() <= 0) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid amount",
                    "success", false
                ));
            }
            
            // Generate unique payment ID
            String paymentId = "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            
            // Create response
            PaymentResponse response = new PaymentResponse();
            response.setSuccess(true);
            response.setStatus("SUCCESS");
            response.setPaymentId(paymentId);
            response.setGateway(request.getGateway() != null ? request.getGateway() : "SIMULATED");
            response.setAmount(request.getAmount());
            response.setMessage("Payment processed successfully");
            
            System.out.println("✅ Payment successful: " + paymentId);
            
            return ResponseEntity.ok(response);
            
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
}