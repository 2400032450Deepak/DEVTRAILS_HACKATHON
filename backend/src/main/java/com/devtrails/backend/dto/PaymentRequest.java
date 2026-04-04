package com.devtrails.backend.dto;

public class PaymentRequest {
    private Double amount;
    private Integer planId;
    private String gateway;
    private String userId;
    private String zone;  // Add zone field
    
    public PaymentRequest() {}
    
    // Getters
    public Double getAmount() { return amount; }
    public Integer getPlanId() { return planId; }
    public String getGateway() { return gateway; }
    public String getUserId() { return userId; }
    public String getZone() { return zone; }
    
    // Setters
    public void setAmount(Double amount) { this.amount = amount; }
    public void setPlanId(Integer planId) { this.planId = planId; }
    public void setGateway(String gateway) { this.gateway = gateway; }
    public void setUserId(String userId) { this.userId = userId; }
    public void setZone(String zone) { this.zone = zone; }
}