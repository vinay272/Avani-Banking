package com.avanibank.backend.repository;

import com.avanibank.backend.entity.Investment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvestmentRepository extends JpaRepository<Investment, Long> {

    List<Investment> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    Optional<Investment> findByIdAndCustomerId(Long investmentId, Long customerId);

    List<Investment> findByCustomerIdAndStatusOrderByCreatedAtDesc(
            Long customerId,
            String status
    );

    List<Investment> findByCustomerIdAndInvestmentTypeOrderByCreatedAtDesc(
            Long customerId,
            String investmentType
    );
}