package com.devtrails.backend.service;

import com.devtrails.backend.model.User;
import com.devtrails.backend.repository.UserRepository;
import com.devtrails.backend.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ✅ REGISTER
    public String register(User user) {
        String normalizedPhone = normalizePhone(user.getPhone());
        user.setPhone(normalizedPhone);

        System.out.println("📝 Registering user with phone: " + normalizedPhone);

        // Check phone
        Optional<User> existingUser = userRepository.findByPhone(normalizedPhone);
        if (existingUser.isPresent()) {
            return "User already exists with this phone number";
        }

        // Check email
        if (user.getEmail() != null && !user.getEmail().isEmpty()) {
            Optional<User> existingEmail = userRepository.findByEmail(user.getEmail());
            if (existingEmail.isPresent()) {
                return "Email already registered";
            }
        }

        // 🔐 HASH PASSWORD
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        userRepository.save(user);

        System.out.println("✅ User registered successfully: " + user.getName());
        return "User registered successfully";
    }

    // ✅ LOGIN
    public Map<String, Object> login(String identifier, String password) {
        Map<String, Object> response = new HashMap<>();

        System.out.println("========================================");
        System.out.println("🔍 LOGIN ATTEMPT");
        System.out.println("📱 Identifier: " + identifier);

        try {
            User user = findUser(identifier);

            // ❌ USER NOT FOUND
            if (user == null) {
                response.put("error", "User not found. Please register first.");
                return response;
            }

            // ❌ PASSWORD CHECK (SECURE)
            if (!passwordEncoder.matches(password, user.getPassword())) {
                response.put("error", "Invalid credentials");
                return response;
            }

            // ✅ SUCCESS
            String token = JwtUtil.generateToken(user.getPhone());

            response.put("token", token);
            response.put("user", Map.of(
                    "id", user.getId(),
                    "name", user.getName(),
                    "email", user.getEmail() != null ? user.getEmail() : "",
                    "contact", user.getPhone()
            ));

            System.out.println("✅ LOGIN SUCCESSFUL: " + user.getName());
            return response;

        } catch (Exception e) {
            System.err.println("❌ Login error: " + e.getMessage());
            response.put("error", "Login failed");
            return response;
        }
    }

    // ✅ CLEAN USER FINDER (NO SECURITY BUG)
    private User findUser(String identifier) {

        // Try phone exact
        Optional<User> userOpt = userRepository.findByPhone(identifier);
        if (userOpt.isPresent()) return userOpt.get();

        // Try email
        if (identifier.contains("@")) {
            userOpt = userRepository.findByEmail(identifier);
            if (userOpt.isPresent()) return userOpt.get();
        }

        // Normalize phone
        String digitsOnly = identifier.replaceAll("\\D", "");

        if (digitsOnly.length() == 10) {
            userOpt = userRepository.findByPhone("+91" + digitsOnly);
            if (userOpt.isPresent()) return userOpt.get();
        }

        return null;
    }

    // ✅ PHONE NORMALIZER
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
