package com.devtrails.backend.controller;

import com.devtrails.backend.dto.LoginRequest;
import com.devtrails.backend.dto.RegisterRequest;
import com.devtrails.backend.model.User;
import com.devtrails.backend.service.AuthService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
// REMOVE the @CrossOrigin annotation - let CorsConfig handle it
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        System.out.println("📝 Registration request for: " + request.phone);
        
        // Normalize phone
        String phone = request.phone;
        if (phone != null && !phone.startsWith("+") && phone.matches("\\d{10}")) {
            phone = "+91" + phone;
        }
        
        User user = new User(
            request.name,
            request.email,
            request.password,
            phone  // Use normalized phone
        );
        
        return authService.register(user);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest request) {
        System.out.println("🔐 Login request received");
        System.out.println("   Identifier: " + request.phone);
        System.out.println("   Password: " + request.password);
        
        // Pass both identifier and password to AuthService
        return authService.login(request.phone, request.password);
    }

    @GetMapping("/health")
    public String health() {
        return "OK";
    }
}