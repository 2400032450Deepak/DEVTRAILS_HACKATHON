package com.devtrails.backend.repository;

import com.devtrails.backend.model.Plan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlanRepository extends JpaRepository<Plan, Long> {
}