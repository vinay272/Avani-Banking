package com.avanibank.backend.repository;

import com.avanibank.backend.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByEmail(String email);

    Optional<Customer> findByPhone(String phone);

    Optional<Customer> findByAccountNumber(String accountNumber);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    boolean existsByAccountNumber(String accountNumber);
}