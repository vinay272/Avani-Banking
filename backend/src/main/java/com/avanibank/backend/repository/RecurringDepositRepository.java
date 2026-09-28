package com.avanibank.backend.repository;

import com.avanibank.backend.entity.RecurringDeposit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RecurringDepositRepository
        extends JpaRepository<RecurringDeposit, Long> {

    // Get all RDs of a customer
    List<RecurringDeposit> findByCustomerIdOrderByCreatedAtDesc(
            Long customerId
    );

    // Get active RDs of a customer
    List<RecurringDeposit> findByCustomerIdAndStatusOrderByCreatedAtDesc(
            Long customerId,
            String status
    );

    // Find specific RD belonging to customer
    Optional<RecurringDeposit> findByIdAndCustomerId(
            Long id,
            Long customerId
    );

    // Find RDs whose installment is due
    List<RecurringDeposit> findByStatusAndNextInstallmentDateLessThanEqual(
            String status,
            LocalDateTime dateTime
    );
}