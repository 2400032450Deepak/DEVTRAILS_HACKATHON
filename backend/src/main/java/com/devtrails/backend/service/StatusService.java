package com.devtrails.backend.service;

import com.devtrails.backend.model.Payout;
import com.devtrails.backend.repository.PayoutRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Service
@SuppressWarnings({"unused", "FieldCanBeLocal"})
public class StatusService {

    private final PayoutRepository payoutRepository;

    public StatusService(PayoutRepository payoutRepository) {
        this.payoutRepository = payoutRepository;
    }

    public Map<String, Object> getStatus(Long userId) {

        Random random = new Random();

        int rain = random.nextInt(60);
        int temp = 25 + random.nextInt(20);
        int aqi = 50 + random.nextInt(400);

        String label = "Safe";
        String risk = "Low";

        if (rain > 40 || temp > 42 || aqi > 300) {
            label = "Risk";
            risk = "High";
        }

        Map<String, Object> response = new HashMap<>();
        response.put("rain", rain);
        response.put("temp", temp);
        response.put("aqi", aqi);
        response.put("traffic", "Moderate");
        response.put("platform", "Active");
        response.put("risk", risk);
        response.put("label", label);

        return response;
    }
}