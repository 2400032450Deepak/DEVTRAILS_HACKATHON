package com.devtrails.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class GoogleAuthController {

    @GetMapping("/auth/user")
    public ResponseEntity<?> getAuthenticatedUser(@AuthenticationPrincipal OAuth2User principal) {
        System.out.println("🔐 /api/auth/user endpoint called");
        
        if (principal == null) {
            System.out.println("❌ No authenticated user");
            return ResponseEntity.ok(Map.of("authenticated", false));
        }
        
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("email", principal.getAttribute("email"));
        userInfo.put("name", principal.getAttribute("name"));
        userInfo.put("picture", principal.getAttribute("picture"));
        userInfo.put("authenticated", true);
        
        System.out.println("✅ Returning user info for: " + principal.getAttribute("email"));
        return ResponseEntity.ok(userInfo);
    }
    
    @GetMapping("/user")
    public ResponseEntity<?> getUser(@AuthenticationPrincipal OAuth2User principal) {
        return getAuthenticatedUser(principal);
    }
}