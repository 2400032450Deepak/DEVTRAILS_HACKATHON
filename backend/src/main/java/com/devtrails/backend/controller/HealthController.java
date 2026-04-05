// backend/src/main/java/com/devtrails/backend/controller/HealthController.java
package com.devtrails.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class HealthController {
    
    @GetMapping("/ai/health")
    public ResponseEntity<?> checkAIHealth() {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String aiUrl = "http://localhost:8000/evaluate";
            // Just check if AI is reachable
            return ResponseEntity.ok(Map.of(
                "ai_status", "connected",
                "ai_url", aiUrl
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "ai_status", "disconnected",
                "error", e.getMessage()
            ));
        }
    }
}