package com.devtrails.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "user_plans")
public class UserPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long planId;
    private boolean active;

    public UserPlan() {}

    public UserPlan(Long userId, Long planId, boolean active) {
        this.userId = userId;
        this.planId = planId;
        this.active = active;
    }

    // ✅ GETTERS & SETTERS

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getPlanId() {
        return planId;
    }

    public void setPlanId(Long planId) {
        this.planId = planId;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}