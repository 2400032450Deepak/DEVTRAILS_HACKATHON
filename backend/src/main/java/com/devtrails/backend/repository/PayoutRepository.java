package com.devtrails.backend.repository;

import com.devtrails.backend.model.Payout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PayoutRepository extends JpaRepository<Payout, Long> {
    
    // Existing method - keep this
    List<Payout> findByUserId(Long userId);
    
    // ========== ADD THESE NEW METHODS ==========
    
    // Get payouts ordered by newest first (for history page)
    List<Payout> findByUserIdOrderByTimestampDesc(Long userId);
    
    // Get total protected earnings for a user
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payout p WHERE p.userId = :userId")
    Double getTotalPayoutByUserId(@Param("userId") Long userId);
    
    // Get weekly total payouts (for admin dashboard)
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payout p WHERE p.timestamp > CURRENT_TIMESTAMP - 7")
    Double getWeeklyTotalPayouts();
    
    // Get weekly payout count (for admin dashboard)
    @Query("SELECT COUNT(p) FROM Payout p WHERE p.timestamp > CURRENT_TIMESTAMP - 7")
    Long getWeeklyPayoutCount();
    
    // Get payouts by status (for monitoring)
    List<Payout> findByStatus(String status);
    
    // Get recent payouts for a user (limited)
    @Query(value = "SELECT * FROM payouts p WHERE p.user_id = :userId ORDER BY p.timestamp DESC LIMIT :limit", nativeQuery = true)
    List<Payout> findRecentPayoutsByUserId(@Param("userId") Long userId, @Param("limit") int limit);
}