package com.devtrails.backend.repository;

import com.devtrails.backend.model.UserPlan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPlanRepository extends JpaRepository<UserPlan, Long> {
}