package com.avanibank.backend.repository;

import com.avanibank.backend.entity.UpiAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UpiAccountRepository
        extends JpaRepository<UpiAccount, Long> {

    // Find UPI account by UPI ID
    Optional<UpiAccount> findByUpiId(String upiId);

    // Check whether UPI ID already exists
    boolean existsByUpiId(String upiId);

    // Get all UPI IDs of a customer
    List<UpiAccount> findByCustomerId(Long customerId);

    // Find UPI account belonging to a specific customer
    Optional<UpiAccount> findByIdAndCustomerId(
            Long id,
            Long customerId
    );
}