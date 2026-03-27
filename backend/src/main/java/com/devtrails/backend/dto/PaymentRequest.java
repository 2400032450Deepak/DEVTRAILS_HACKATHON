package com.devtrails.backend.dto;

public class PaymentRequest {
    private Long amount;
    private Long planId;
    private String gateway;
    private boolean simulateFailure;
    
    public PaymentRequest() {}
    
    public PaymentRequest(Long amount, Long planId, String gateway, boolean simulateFailure) {
        this.amount = amount;
        this.planId = planId;
        this.gateway = gateway;
        this.simulateFailure = simulateFailure;
    }
    
    // Getters and Setters
    public Long getAmount() {
        return amount;
    }
    
    public void setAmount(Long amount) {
        this.amount = amount;
    }
    
    public Long getPlanId() {
        return planId;
    }
    
    public void setPlanId(Long planId) {
        this.planId = planId;
    }
    
    public String getGateway() {
        return gateway;
    }
    
    public void setGateway(String gateway) {
        this.gateway = gateway;
    }
    
    public boolean isSimulateFailure() {
        return simulateFailure;
    }
    
    public void setSimulateFailure(boolean simulateFailure) {
        this.simulateFailure = simulateFailure;
    }
}