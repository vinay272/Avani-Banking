package com.avanibank.backend.repository;

import com.avanibank.backend.entity.FixedDeposit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface FixedDepositRepository
        extends JpaRepository<FixedDeposit, Long> {

    // Get all FDs of a customer
    List<FixedDeposit> findByCustomerIdOrderByCreatedAtDesc(
            Long customerId
    );

    // Get active FDs of a customer
    List<FixedDeposit> findByCustomerIdAndStatusOrderByCreatedAtDesc(
            Long customerId,
            String status
    );

    // Find specific FD belonging to customer
    Optional<FixedDeposit> findByIdAndCustomerId(
            Long id,
            Long customerId
    );

    List<FixedDeposit> findByStatusAndMaturityDateBetween(
        String status,
        LocalDateTime startDate,
        LocalDateTime endDate
);
}