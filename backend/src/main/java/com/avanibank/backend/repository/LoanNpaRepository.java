package com.avanibank.backend.repository;

import com.avanibank.backend.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanNpaRepository extends JpaRepository<Loan, Long> {

    List<Loan> findByCustomerIdAndStatusOrderByNpaDateDesc(
            Long customerId,
            String status
    );

    List<Loan> findByStatus(String status);
}