package com.avanibank.backend.repository;

import com.avanibank.backend.entity.AmlCheck;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AmlCheckRepository
        extends JpaRepository<AmlCheck, Long> {

    List<AmlCheck>
    findByCustomerIdOrderByCheckedAtDesc(Long customerId);

    List<AmlCheck>
    findByCustomerIdAndStatusOrderByCheckedAtDesc(
            Long customerId,
            String status
    );

    List<AmlCheck>
    findByRiskLevelOrderByCheckedAtDesc(
            String riskLevel
    );
}