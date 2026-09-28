package com.avanibank.backend.service;

import com.avanibank.backend.entity.BiometricVerification;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.repository.BiometricVerificationRepository;
import com.avanibank.backend.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BiometricVerificationService {

    private final BiometricVerificationRepository biometricRepository;
    private final CustomerRepository customerRepository;

    public BiometricVerificationService(
            BiometricVerificationRepository biometricRepository,
            CustomerRepository customerRepository) {

        this.biometricRepository = biometricRepository;
        this.customerRepository = customerRepository;
    }

    // =========================
    // CREATE BIOMETRIC VERIFICATION
    // =========================

    public BiometricVerification createVerification(
            Long customerId,
            String biometricType,
            String status,
            String remarks) {

        Customer customer = customerRepository
                .findById(customerId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found with ID: "
                                        + customerId
                        )
                );

        BiometricVerification verification =
                new BiometricVerification();

        verification.setCustomer(customer);
        verification.setBiometricType(biometricType);
        verification.setStatus(status);
        verification.setRemarks(remarks);
        verification.setVerifiedAt(LocalDateTime.now());

        return biometricRepository.save(verification);
    }

    // =========================
    // GET CUSTOMER VERIFICATIONS
    // =========================

    public List<BiometricVerification>
    getCustomerVerifications(Long customerId) {

        if (!customerRepository.existsById(customerId)) {
            throw new RuntimeException(
                    "Customer not found with ID: "
                            + customerId
            );
        }

        return biometricRepository
                .findByCustomerIdOrderByVerifiedAtDesc(
                        customerId
                );
    }

    // =========================
    // GET VERIFIED RECORDS
    // =========================

    public List<BiometricVerification>
    getVerifiedRecords(Long customerId) {

        if (!customerRepository.existsById(customerId)) {
            throw new RuntimeException(
                    "Customer not found with ID: "
                            + customerId
            );
        }

        return biometricRepository
                .findByCustomerIdAndStatusOrderByVerifiedAtDesc(
                        customerId,
                        "VERIFIED"
                );
    }
}