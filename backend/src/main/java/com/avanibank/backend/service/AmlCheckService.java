package com.avanibank.backend.service;

import com.avanibank.backend.entity.AmlCheck;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.repository.AmlCheckRepository;
import com.avanibank.backend.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AmlCheckService {

    private final AmlCheckRepository amlCheckRepository;
    private final CustomerRepository customerRepository;

    public AmlCheckService(
            AmlCheckRepository amlCheckRepository,
            CustomerRepository customerRepository) {

        this.amlCheckRepository = amlCheckRepository;
        this.customerRepository = customerRepository;
    }

    // =========================
    // CREATE AML CHECK
    // =========================

    public AmlCheck createCheck(
            Long customerId,
            String status,
            String riskLevel,
            String remarks) {

        Customer customer = customerRepository
                .findById(customerId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found with ID: "
                                        + customerId
                        )
                );

        AmlCheck amlCheck = new AmlCheck();

        amlCheck.setCustomer(customer);
        amlCheck.setStatus(status);
        amlCheck.setRiskLevel(riskLevel);
        amlCheck.setRemarks(remarks);
        amlCheck.setCheckedAt(LocalDateTime.now());

        return amlCheckRepository.save(amlCheck);
    }

    // =========================
    // GET CUSTOMER AML HISTORY
    // =========================

    public List<AmlCheck> getCustomerChecks(
            Long customerId) {

        if (!customerRepository.existsById(customerId)) {
            throw new RuntimeException(
                    "Customer not found with ID: "
                            + customerId
            );
        }

        return amlCheckRepository
                .findByCustomerIdOrderByCheckedAtDesc(
                        customerId
                );
    }

    // =========================
    // GET FLAGGED CHECKS
    // =========================

    public List<AmlCheck> getFlaggedChecks(
            Long customerId) {

        if (!customerRepository.existsById(customerId)) {
            throw new RuntimeException(
                    "Customer not found with ID: "
                            + customerId
            );
        }

        return amlCheckRepository
                .findByCustomerIdAndStatusOrderByCheckedAtDesc(
                        customerId,
                        "FLAGGED"
                );
    }

    // =========================
    // GET HIGH-RISK CHECKS
    // =========================

    public List<AmlCheck> getHighRiskChecks() {

        return amlCheckRepository
                .findByRiskLevelOrderByCheckedAtDesc(
                        "HIGH"
                );
    }
}