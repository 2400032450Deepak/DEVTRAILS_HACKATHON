package com.devtrails.backend.repository;

import com.devtrails.backend.model.UserPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserPlanRepository extends JpaRepository<UserPlan, Long> {
    
    // Find by user ID
    List<UserPlan> findByUserId(Long userId);
    
    // Find active plan for a user - FIXED: use 'active' not 'isActive'
    @Query("SELECT up FROM UserPlan up WHERE up.userId = :userId AND up.active = true")
    UserPlan findActivePlanByUserId(@Param("userId") Long userId);
    
    // Get all active plans - FIXED: use 'active' not 'isActive'
    @Query("SELECT up FROM UserPlan up WHERE up.active = true")
    List<UserPlan> findByIsActiveTrue();
    
    // Count active plans - FIXED: use 'active' not 'isActive'
    @Query("SELECT COUNT(up) FROM UserPlan up WHERE up.active = true")
    long countByIsActiveTrue();
    
    // Check if user has active plan
    boolean existsByUserIdAndActiveTrue(Long userId);
    
    // Optional: Find by user ID and active status
    Optional<UserPlan> findByUserIdAndActiveTrue(Long userId);
}