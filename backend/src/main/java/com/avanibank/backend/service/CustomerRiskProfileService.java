package com.avanibank.backend.service;

import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.CustomerRiskProfile;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.CustomerRiskProfileRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class CustomerRiskProfileService {

    private final CustomerRiskProfileRepository riskProfileRepository;
    private final CustomerRepository customerRepository;

    public CustomerRiskProfileService(
            CustomerRiskProfileRepository riskProfileRepository,
            CustomerRepository customerRepository) {

        this.riskProfileRepository = riskProfileRepository;
        this.customerRepository = customerRepository;
    }

    // =========================
    // CREATE / UPDATE RISK PROFILE
    // =========================

    public CustomerRiskProfile saveRiskProfile(
            Long customerId,
            Integer riskScore,
            String riskLevel,
            String remarks) {

        Customer customer = customerRepository
                .findById(customerId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found with ID: " + customerId
                        )
                );

        Optional<CustomerRiskProfile> existingProfile =
                riskProfileRepository.findByCustomerId(customerId);

        CustomerRiskProfile profile;

        if (existingProfile.isPresent()) {
            profile = existingProfile.get();
        } else {
            profile = new CustomerRiskProfile();
            profile.setCustomer(customer);
            profile.setCreatedAt(LocalDateTime.now());
        }

        profile.setRiskScore(riskScore);
        profile.setRiskLevel(riskLevel);
        profile.setRemarks(remarks);
        profile.setUpdatedAt(LocalDateTime.now());

        return riskProfileRepository.save(profile);
    }

    // =========================
    // GET RISK PROFILE
    // =========================

    public CustomerRiskProfile getRiskProfile(
            Long customerId) {

        return riskProfileRepository
                .findByCustomerId(customerId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Risk profile not found for customer ID: "
                                        + customerId
                        )
                );
    }

    // =========================
    // DELETE RISK PROFILE
    // =========================

    public void deleteRiskProfile(Long customerId) {

        CustomerRiskProfile profile =
                riskProfileRepository
                        .findByCustomerId(customerId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Risk profile not found for customer ID: "
                                                + customerId
                                )
                        );

        riskProfileRepository.delete(profile);
    }
}