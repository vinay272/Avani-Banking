package com.avanibank.backend.repository;

import com.avanibank.backend.entity.ScheduledPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ScheduledPaymentRepository
        extends JpaRepository<ScheduledPayment, Long> {

    // =====================================================
    // GET ALL SCHEDULED PAYMENTS OF CUSTOMER
    // =====================================================

    List<ScheduledPayment>
    findByCustomerIdOrderByCreatedAtDesc(
            Long customerId
    );

    // =====================================================
    // GET PAYMENTS BY CUSTOMER + STATUS
    // =====================================================

    List<ScheduledPayment>
    findByCustomerIdAndStatusOrderByScheduledDateAsc(
            Long customerId,
            String status
    );

    // =====================================================
    // GET SINGLE PAYMENT OF LOGGED-IN CUSTOMER
    // =====================================================

    Optional<ScheduledPayment>
    findByIdAndCustomerId(
            Long id,
            Long customerId
    );

    // =====================================================
    // FIND DUE SCHEDULED PAYMENTS
    // =====================================================

    List<ScheduledPayment>
    findByStatusAndScheduledDateLessThanEqual(
            String status,
            LocalDate date
    );
}