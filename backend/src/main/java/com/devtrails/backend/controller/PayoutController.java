package com.devtrails.backend.controller;

import com.devtrails.backend.model.Payout;
import com.devtrails.backend.repository.PayoutRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PayoutController {

    private final PayoutRepository payoutRepository;

    public PayoutController(PayoutRepository payoutRepository) {
        this.payoutRepository = payoutRepository;
    }

    @GetMapping("/payouts")
    public List<Payout> getPayouts() {
        return payoutRepository.findAll();
    }

    // Add this endpoint for user-specific payouts
    @GetMapping("/payouts/user/{userId}")
    public List<Payout> getUserPayouts(@PathVariable Long userId) {
        return payoutRepository.findByUserId(userId);
    }
}