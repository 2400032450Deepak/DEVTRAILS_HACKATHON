package com.devtrails.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "payouts")
public class Payout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private int amount;
    private String reason;
    private LocalDate date;

    public Payout() {}

    public Payout(Long userId, int amount, String reason, LocalDate date) {
        this.userId = userId;
        this.amount = amount;
        this.reason = reason;
        this.date = date;
    }

    // ✅ ADD THESE GETTERS

    public Long getId() { return id; }

    public Long getUserId() { return userId; }

    public int getAmount() { return amount; }

    public String getReason() { return reason; }

    public LocalDate getDate() { return date; }
}