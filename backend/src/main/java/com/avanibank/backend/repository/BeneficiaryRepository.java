package com.avanibank.backend.repository;

import com.avanibank.backend.entity.Beneficiary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BeneficiaryRepository
        extends JpaRepository<Beneficiary, Long> {

    // Get all beneficiaries of a customer
    List<Beneficiary> findByCustomerIdOrderByCreatedAtDesc(
            Long customerId
    );

    // Check duplicate beneficiary account for same customer
    Optional<Beneficiary> findByCustomerIdAndAccountNumber(
            Long customerId,
            String accountNumber
    );

    // Find beneficiary belonging to a specific customer
    Optional<Beneficiary> findByIdAndCustomerId(
            Long id,
            Long customerId
    );
}