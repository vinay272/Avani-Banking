package com.avanibank.backend.repository;

import com.avanibank.backend.entity.Bond;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BondRepository extends JpaRepository<Bond, Long> {

    // All bonds of a customer
    List<Bond> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    // Active bonds of a customer
    List<Bond> findByCustomerIdAndStatusOrderByCreatedAtDesc(
            Long customerId,
            String status
    );

    // Bonds linked to an account
    List<Bond> findByAccountIdOrderByCreatedAtDesc(Long accountId);

    // Check active bond by customer and bond name
    boolean existsByCustomerIdAndBondNameAndStatus(
            Long customerId,
            String bondName,
            String status
    );
}