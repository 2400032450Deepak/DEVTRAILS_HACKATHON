package com.devtrails.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payouts")
public class Payout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private int amount;
    private String reason;
    private LocalDateTime timestamp;
    private String status;
    private String triggerType;
    private String transactionId;

    public Payout() {}

    public Payout(Long userId, int amount, String reason, LocalDateTime timestamp) {
        this.userId = userId;
        this.amount = amount;
        this.reason = reason;
        this.timestamp = timestamp;
        this.status = "COMPLETED";
        this.transactionId = "TXN_" + System.currentTimeMillis();
    }

    // Getters
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public int getAmount() { return amount; }
    public String getReason() { return reason; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public String getStatus() { return status; }
    public String getTriggerType() { return triggerType; }
    public String getTransactionId() { return transactionId; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setAmount(int amount) { this.amount = amount; }
    public void setReason(String reason) { this.reason = reason; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public void setStatus(String status) { this.status = status; }
    public void setTriggerType(String triggerType) { this.triggerType = triggerType; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
}