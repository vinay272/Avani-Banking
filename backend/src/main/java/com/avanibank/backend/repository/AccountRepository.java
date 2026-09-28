package com.avanibank.backend.repository;

import com.avanibank.backend.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository
        extends JpaRepository<Account, Long> {

    Optional<Account> findByAccountNumber(
            String accountNumber
    );

    boolean existsByAccountNumber(
            String accountNumber
    );

    List<Account> findByCustomerId(
            Long customerId
    );

    List<Account> findByCustomerIdAndStatus(
            Long customerId,
            String status
    );

    Optional<Account> findByIdAndCustomerId(
            Long accountId,
            Long customerId
    );
}