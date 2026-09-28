package com.avanibank.backend.repository;

import com.avanibank.backend.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LoanRepository
        extends JpaRepository<Loan, Long> {

    List<Loan> findByCustomerIdOrderByCreatedAtDesc(
            Long customerId
    );

    Optional<Loan> findByIdAndCustomerId(
            Long loanId,
            Long customerId
    );

    List<Loan> findByStatus(
            String status
    );
}