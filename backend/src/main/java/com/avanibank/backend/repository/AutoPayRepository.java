package com.avanibank.backend.repository;

import com.avanibank.backend.entity.AutoPay;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AutoPayRepository
        extends JpaRepository<AutoPay, Long> {

    // Get all Auto-Pays of a customer
    List<AutoPay> findByCustomerIdOrderByCreatedAtDesc(
            Long customerId
    );

    // Get Auto-Pays by customer and status
    List<AutoPay> findByCustomerIdAndStatusOrderByCreatedAtDesc(
            Long customerId,
            String status
    );

    // Get a specific Auto-Pay belonging to a customer
    Optional<AutoPay> findByIdAndCustomerId(
            Long autoPayId,
            Long customerId
    );

    // Check whether a customer already has the same biller reference
    boolean existsByCustomerIdAndBillerReference(
            Long customerId,
            String billerReference
    );

     // =====================================================
    // GET DUE ACTIVE AUTO-PAYS
    // =====================================================
    //
    // Used by automatic Auto-Pay scheduler.
    //
    // ACTIVE Auto-Pays whose nextDueDate is today
    // or any date before today will be processed.
    //

    List<AutoPay> findByStatusAndNextDueDateLessThanEqual(
            String status,
            LocalDate date
    );
}
