package com.devtrails.backend.dto;

public class PaymentResponse {
    private boolean success;
    private String status;
    private String paymentId;
    private String gateway;
    private Long amount;
    private String message;
    
    public PaymentResponse() {}
    
    public PaymentResponse(boolean success, String status, String paymentId, 
                          String gateway, Long amount, String message) {
        this.success = success;
        this.status = status;
        this.paymentId = paymentId;
        this.gateway = gateway;
        this.amount = amount;
        this.message = message;
    }
    
    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getPaymentId() {
        return paymentId;
    }
    
    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }
    
    public String getGateway() {
        return gateway;
    }
    
    public void setGateway(String gateway) {
        this.gateway = gateway;
    }
    
    public Long getAmount() {
        return amount;
    }
    
    public void setAmount(Long amount) {
        this.amount = amount;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
}