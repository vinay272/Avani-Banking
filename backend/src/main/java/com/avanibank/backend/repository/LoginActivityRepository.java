package com.avanibank.backend.repository;

import com.avanibank.backend.entity.LoginActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LoginActivityRepository
        extends JpaRepository<LoginActivity, Long> {

    // =====================================================
    // CUSTOMER LOGIN HISTORY
    // =====================================================

    List<LoginActivity> findByCustomerIdOrderByLoginAtDesc(
            Long customerId
    );

    // =====================================================
    // LAST LOGIN
    // =====================================================

    Optional<LoginActivity> findFirstByCustomerIdOrderByLoginAtDesc(
            Long customerId
    );

    // =====================================================
    // CHECK PREVIOUS IP
    // =====================================================

    boolean existsByCustomerIdAndIpAddress(
            Long customerId,
            String ipAddress
    );

    // =====================================================
    // CHECK PREVIOUS DEVICE
    // =====================================================

    boolean existsByCustomerIdAndUserAgent(
            Long customerId,
            String userAgent
    );
}