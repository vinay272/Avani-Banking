package com.avanibank.backend.repository;

import com.avanibank.backend.entity.GoldInvestment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GoldInvestmentRepository
        extends JpaRepository<GoldInvestment, Long> {

    // =====================================================
    // GET CUSTOMER GOLD INVESTMENTS
    // =====================================================

    List<GoldInvestment> findByCustomerIdOrderByCreatedAtDesc(
            Long customerId
    );

    // =====================================================
    // GET ACTIVE GOLD INVESTMENTS
    // =====================================================

    List<GoldInvestment> findByCustomerIdAndStatusOrderByCreatedAtDesc(
            Long customerId,
            String status
    );

    // =====================================================
    // GET ACCOUNT GOLD INVESTMENTS
    // =====================================================

    List<GoldInvestment> findByAccountIdOrderByCreatedAtDesc(
            Long accountId
    );
}