package com.devtrails.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "user_plans")
public class UserPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long planId;
    private boolean active;
    private LocalDate startDate;
    private LocalDate endDate;

    @Transient
    private Plan plan;

    // Default constructor
    public UserPlan() {}

    // Constructor with userId, planId, active
    public UserPlan(Long userId, Long planId, boolean active) {
        this.userId = userId;
        this.planId = planId;
        this.active = active;
        this.startDate = LocalDate.now();
        this.endDate = LocalDate.now().plusDays(7);
    }

    // Full constructor
    public UserPlan(Long userId, Long planId, boolean active, LocalDate startDate, LocalDate endDate) {
        this.userId = userId;
        this.planId = planId;
        this.active = active;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getPlanId() {
        return planId;
    }

    public boolean isActive() {
        return active;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public Plan getPlan() {
        return plan;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setPlanId(Long planId) {
        this.planId = planId;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public void setPlan(Plan plan) {
        this.plan = plan;
    }
}