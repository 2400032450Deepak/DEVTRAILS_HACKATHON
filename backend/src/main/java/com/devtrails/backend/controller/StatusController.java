package com.devtrails.backend.controller;

import com.devtrails.backend.service.StatusService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class StatusController {

    private final StatusService statusService;

    public StatusController(StatusService statusService) {
        this.statusService = statusService;
    }

    @GetMapping("/status")
    public Map<String, Object> getStatus(@RequestParam Long userId) {
        return statusService.getStatus(userId);
    }
}