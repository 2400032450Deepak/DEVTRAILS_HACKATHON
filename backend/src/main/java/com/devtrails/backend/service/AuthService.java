package com.devtrails.backend.service;

import com.devtrails.backend.model.User;
import com.devtrails.backend.repository.UserRepository;
import com.devtrails.backend.util.JwtUtil;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String register(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return "User already exists";
        }
        userRepository.save(user);
        return "User registered";
    }

    public Map<String, Object> login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .filter(u -> u.getPassword().equals(password))
                .orElse(null);

        if (user == null) {
            return Map.of("error", "Invalid credentials");
        }

        String token = JwtUtil.generateToken(user.getEmail());

        return Map.of(
                "token", token,
                "user", Map.of(
                        "id", user.getId(),
                        "name", user.getName(),
                        "contact", user.getEmail()
                )
        );
    }
}