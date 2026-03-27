package com.devtrails.backend.controller;

import com.devtrails.backend.dto.LoginRequest;
import com.devtrails.backend.dto.RegisterRequest;
import com.devtrails.backend.model.User;
import com.devtrails.backend.service.AuthService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        User user = new User(request.name, request.email, request.password);
        return authService.register(user);
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest request) {
        return authService.login(request.email, request.password);
    }

    @GetMapping("/health")
    public String health() {
        return "OK";
    }
}