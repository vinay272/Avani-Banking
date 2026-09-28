package com.avanibank.backend.repository;

import com.avanibank.backend.entity.FraudAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FraudAlertRepository extends JpaRepository<FraudAlert, Long> {

    List<FraudAlert> findByCustomerIdOrderByDetectedAtDesc(Long customerId);

    List<FraudAlert> findByCustomerIdAndStatusOrderByDetectedAtDesc(
            Long customerId,
            String status
    );

    List<FraudAlert> findByAccountIdOrderByDetectedAtDesc(Long accountId);

    List<FraudAlert> findByRiskLevelOrderByDetectedAtDesc(
            String riskLevel
    );

    List<FraudAlert> findByAlertTypeOrderByDetectedAtDesc(
            String alertType
    );

    long countByCustomerIdAndStatus(
            Long customerId,
            String status
    );

    long countByStatus(String status);

    long countByRiskLevel(String riskLevel);        

}