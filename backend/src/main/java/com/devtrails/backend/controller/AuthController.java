package com.devtrails.backend.controller;

import com.devtrails.backend.dto.LoginRequest;
import com.devtrails.backend.dto.RegisterRequest;
import com.devtrails.backend.model.User;
import com.devtrails.backend.service.AuthService;
import com.devtrails.backend.repository.UserRepository;  // ✅ ADD THIS IMPORT
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;  // ✅ ADD THIS IMPORT

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;  // ✅ ADD THIS FIELD

    // ✅ UPDATE CONSTRUCTOR
    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        System.out.println("📝 Registration request for: " + request.getPhone());
        
        try {
            // Normalize phone
            String phone = request.getPhone();
            if (phone != null && !phone.startsWith("+") && phone.matches("\\d{10}")) {
                phone = "+91" + phone;
            }
            
            User user = new User(
                request.getName(),
                request.getEmail(),
                request.getPassword(),
                phone
            );
            
            // This returns a String (e.g., "User registered successfully with ID: 2")
            String result = authService.register(user);
            
            // Return JSON response instead of plain text
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", result);
            response.put("email", request.getEmail());
            response.put("name", request.getName());
            response.put("phone", phone);
            
            System.out.println("✅ Registration successful: " + result);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Registration error: " + e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Registration failed: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        System.out.println("🔐 Login request received");
        System.out.println("   Phone: " + request.getPhone());
        
        try {
            Map<String, Object> loginResponse = authService.login(request.getPhone(), request.getPassword());
            
            if (loginResponse.containsKey("error")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(loginResponse);
            }
            
            return ResponseEntity.ok(loginResponse);
            
        } catch (Exception e) {
            System.err.println("❌ Login error: " + e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Login failed: " + e.getMessage());
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    // ✅ ADD THIS NEW ENDPOINT
    @GetMapping("/check-email/{email}")
    public ResponseEntity<?> checkEmailExists(@PathVariable String email) {
        System.out.println("🔍 Checking if email exists: " + email);
        
        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                System.out.println("✅ Email found! User ID: " + user.getId());
                
                Map<String, Object> response = new HashMap<>();
                response.put("exists", true);
                response.put("userId", user.getId());
                response.put("email", user.getEmail());
                response.put("name", user.getName());
                
                return ResponseEntity.ok(response);
            } else {
                System.out.println("❌ Email not found: " + email);
                
                Map<String, Object> response = new HashMap<>();
                response.put("exists", false);
                
                return ResponseEntity.ok(response);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error checking email: " + e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("exists", false);
            errorResponse.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("service", "auth-controller");
        return ResponseEntity.ok(response);
    }
}