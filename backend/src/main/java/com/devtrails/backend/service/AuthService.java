package com.devtrails.backend.service;

import com.devtrails.backend.model.User;
import com.devtrails.backend.repository.UserRepository;
import com.devtrails.backend.util.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String register(User user) {
        String normalizedPhone = normalizePhone(user.getPhone());
        user.setPhone(normalizedPhone);
        
        // ✅ ENCODE the password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        System.out.println("📝 Registering user with phone: " + normalizedPhone);
        
        Optional<User> existingUser = userRepository.findByPhone(normalizedPhone);
        if (existingUser.isPresent()) {
            return "User already exists with this phone number";
        }
        
        if (user.getEmail() != null && !user.getEmail().isEmpty()) {
            Optional<User> existingEmail = userRepository.findByEmail(user.getEmail());
            if (existingEmail.isPresent()) {
                return "Email already registered";
            }
        }

        userRepository.save(user);
        System.out.println("✅ User registered successfully: " + user.getName());
        return "User registered successfully";
    }

    public Map<String, Object> login(String identifier, String password) {
        Map<String, Object> response = new HashMap<>();
        
        System.out.println("========================================");
        System.out.println("🔍 LOGIN ATTEMPT");
        System.out.println("📱 Identifier: " + identifier);
        
        try {
            // Try multiple formats to find the user
            User user = findUserByMultipleFormats(identifier);
            
            if (user == null) {
                System.out.println("❌ USER NOT FOUND for: " + identifier);
                response.put("error", "User not found. Please register first.");
                return response;
            }
            
            System.out.println("✅ User found in database:");
            System.out.println("   ID: " + user.getId());
            System.out.println("   Name: " + user.getName());
            System.out.println("   Phone: " + user.getPhone());
            System.out.println("   Email: " + user.getEmail());
            
            // Check password
            if (user.getPassword() == null) {
                System.out.println("❌ User has no password set!");
                response.put("error", "Account error. Please contact support.");
                return response;
            }
            
            // ✅ Use password encoder to check
            if (!passwordEncoder.matches(password, user.getPassword())) {
                System.out.println("❌ PASSWORD MISMATCH!");
                response.put("error", "Invalid password. Please try again.");
                return response;
            }
            
            // Password matches - successful login
            System.out.println("✅ LOGIN SUCCESSFUL for: " + user.getName());
            
            String token = JwtUtil.generateToken(user.getPhone());
            
            response.put("success", true);
            response.put("token", token);
            response.put("user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail() != null ? user.getEmail() : "",
                "contact", user.getPhone()
            ));
            
            return response;
            
        } catch (Exception e) {
            System.err.println("❌ Login error: " + e.getMessage());
            e.printStackTrace();
            response.put("error", "Login failed: " + e.getMessage());
            return response;
        }
    }
    
    // Helper method to find user by multiple phone formats
    private User findUserByMultipleFormats(String identifier) {
        System.out.println("🔍 Searching for user with identifier: " + identifier);
        
        // Try 1: Exact match as provided
        Optional<User> userOpt = userRepository.findByPhone(identifier);
        if (userOpt.isPresent()) {
            System.out.println("✅ Found by exact phone match: " + identifier);
            return userOpt.get();
        }
        
        // Try 2: Check if it's email
        if (identifier.contains("@")) {
            userOpt = userRepository.findByEmail(identifier);
            if (userOpt.isPresent()) {
                System.out.println("✅ Found by email: " + identifier);
                return userOpt.get();
            }
        }
        
        // Try 3: Remove all non-digits and try different formats
        String digitsOnly = identifier.replaceAll("\\D", "");
        System.out.println("📞 Digits only: " + digitsOnly);
        
        if (digitsOnly.length() == 10) {
            // Try with +91 prefix
            String withPlus91 = "+91" + digitsOnly;
            System.out.println("   Trying with +91: " + withPlus91);
            userOpt = userRepository.findByPhone(withPlus91);
            if (userOpt.isPresent()) {
                System.out.println("✅ Found with +91 prefix");
                return userOpt.get();
            }
            
            // Try with 91 prefix (no +)
            String with91 = "91" + digitsOnly;
            System.out.println("   Trying with 91: " + with91);
            userOpt = userRepository.findByPhone(with91);
            if (userOpt.isPresent()) {
                System.out.println("✅ Found with 91 prefix");
                return userOpt.get();
            }
        }
        
        if (digitsOnly.length() == 12 && digitsOnly.startsWith("91")) {
            // Try with + prefix
            String withPlus = "+" + digitsOnly;
            System.out.println("   Trying with +: " + withPlus);
            userOpt = userRepository.findByPhone(withPlus);
            if (userOpt.isPresent()) {
                System.out.println("✅ Found with + prefix");
                return userOpt.get();
            }
        }
        
        // Try all users in database and match by digits only (fallback)
        System.out.println("🔍 Trying to find by digits-only match...");
        Iterable<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            String userDigits = user.getPhone().replaceAll("\\D", "");
            if (userDigits.equals(digitsOnly)) {
                System.out.println("✅ Found by digits-only match: " + user.getPhone());
                return user;
            }
        }
        
        System.out.println("❌ No user found for identifier: " + identifier);
        return null;
    }
    
    private String normalizePhone(String phone) {
        if (phone == null) return null;
        String digits = phone.replaceAll("\\D", "");
        if (digits.length() == 10) {
            return "+91" + digits;
        }
        if (digits.length() == 12 && digits.startsWith("91")) {
            return "+" + digits;
        }
        return phone;
    }
}