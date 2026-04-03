package com.devtrails.backend.controller;

import com.devtrails.backend.model.User;
import com.devtrails.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/workers")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class WorkerController {

    private final UserRepository userRepository;

    public WorkerController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Get worker profile by ID
    @GetMapping("/{workerId}")
    public ResponseEntity<?> getWorkerProfile(@PathVariable String workerId) {
        Long id;
        try {
            id = Long.parseLong(workerId);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid user ID format"));
        }
        
        Optional<User> userOpt = userRepository.findById(id);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("zone", user.getZone() != null ? user.getZone() : "Zone_B_Mumbai");
        profile.put("totalEarnings", user.getTotalEarnings() != null ? user.getTotalEarnings() : 0);
        profile.put("phone", user.getPhone());
        
        return ResponseEntity.ok(profile);
    }

    // Get worker profile by email
    @GetMapping("/by-email/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email) {
        System.out.println("🔍 Looking for user by email: " + email);
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            System.out.println("❌ User not found with email: " + email);
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        System.out.println("✅ User found: ID=" + user.getId() + ", Name=" + user.getName());
        
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("zone", user.getZone() != null ? user.getZone() : "Zone_B_Mumbai");
        profile.put("totalEarnings", user.getTotalEarnings() != null ? user.getTotalEarnings() : 0);
        profile.put("phone", user.getPhone());
        
        return ResponseEntity.ok(profile);
    }

    // Get all workers (admin only - for testing)
    @GetMapping
    public ResponseEntity<?> getAllWorkers() {
        Iterable<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    // Update worker profile
    @PutMapping("/{workerId}")
    public ResponseEntity<?> updateWorkerProfile(@PathVariable Long workerId, @RequestBody Map<String, Object> updates) {
        Optional<User> userOpt = userRepository.findById(workerId);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User user = userOpt.get();
        
        if (updates.containsKey("name")) {
            user.setName((String) updates.get("name"));
        }
        if (updates.containsKey("zone")) {
            user.setZone((String) updates.get("zone"));
        }
        if (updates.containsKey("phone")) {
            user.setPhone((String) updates.get("phone"));
        }
        if (updates.containsKey("totalEarnings")) {
            user.setTotalEarnings(((Number) updates.get("totalEarnings")).doubleValue());
        }
        
        userRepository.save(user);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Profile updated successfully");
        response.put("id", user.getId());
        
        return ResponseEntity.ok(response);
    }
}