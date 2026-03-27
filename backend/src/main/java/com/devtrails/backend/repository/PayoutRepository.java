package com.devtrails.backend.repository;

import com.devtrails.backend.model.Payout;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PayoutRepository extends JpaRepository<Payout, Long> {
}