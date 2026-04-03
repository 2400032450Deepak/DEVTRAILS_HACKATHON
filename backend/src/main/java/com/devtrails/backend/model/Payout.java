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
    private String status;
    private String triggerType;

    public Payout() {}

    public Payout(Long userId, int amount, String reason, LocalDate date) {
        this.userId = userId;
        this.amount = amount;
        this.reason = reason;
        this.date = date;
        this.status = "COMPLETED";
    }

    // Getters
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public int getAmount() { return amount; }
    public String getReason() { return reason; }
    public LocalDate getDate() { return date; }
    public String getStatus() { return status; }
    public String getTriggerType() { return triggerType; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setAmount(int amount) { this.amount = amount; }
    public void setReason(String reason) { this.reason = reason; }
    public void setDate(LocalDate date) { this.date = date; }
    public void setStatus(String status) { this.status = status; }
    public void setTriggerType(String triggerType) { this.triggerType = triggerType; }
}