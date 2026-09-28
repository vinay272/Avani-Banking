package com.avanibank.backend.repository;

import com.avanibank.backend.entity.Dividend;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DividendRepository extends JpaRepository<Dividend, Long> {

    List<Dividend> findByCustomerIdOrderByDividendDateDesc(Long customerId);

    List<Dividend> findByCustomerIdAndStatusOrderByDividendDateDesc(
            Long customerId,
            String status
    );

    List<Dividend> findByAccountIdOrderByDividendDateDesc(Long accountId);

    List<Dividend> findByCustomerIdAndInvestmentTypeOrderByDividendDateDesc(
            Long customerId,
            String investmentType
    );
}