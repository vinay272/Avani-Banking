package com.avanibank.backend.service;

import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.DuplicateKycDetection;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.DuplicateKycDetectionRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class DuplicateKycDetectionService {

    private final DuplicateKycDetectionRepository duplicateRepository;
    private final CustomerRepository customerRepository;

    public DuplicateKycDetectionService(
            DuplicateKycDetectionRepository duplicateRepository,
            CustomerRepository customerRepository) {

        this.duplicateRepository = duplicateRepository;
        this.customerRepository = customerRepository;
    }

    // =========================
    // CHECK DUPLICATE KYC
    // =========================

    public DuplicateKycDetection checkDuplicate(
            Long customerId,
            String documentType,
            String documentNumber) {

        Customer customer = customerRepository
                .findById(customerId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found with ID: "
                                        + customerId
                        )
                );

        Optional<DuplicateKycDetection> existing =
                duplicateRepository
                        .findByDocumentTypeAndDocumentNumber(
                                documentType,
                                documentNumber
                        );

        DuplicateKycDetection result;

        if (existing.isPresent()) {

            result = existing.get();

            if (result.getCustomer().getId().equals(customerId)) {

                result.setDuplicate(false);
                result.setRemarks(
                        "Document belongs to the same customer."
                );

            } else {

                result.setDuplicate(true);
                result.setRemarks(
                        "Document is already associated with another customer."
                );
            }

        } else {

            result = new DuplicateKycDetection();

            result.setCustomer(customer);
            result.setDocumentType(documentType);
            result.setDocumentNumber(documentNumber);
            result.setDuplicate(false);
            result.setRemarks(
                    "No duplicate document found."
            );
            result.setCreatedAt(LocalDateTime.now());
        }

        result.setUpdatedAt(LocalDateTime.now());

        return duplicateRepository.save(result);
    }

    // =========================
    // GET DUPLICATE RESULT
    // =========================

    public DuplicateKycDetection getResult(Long id) {

        return duplicateRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Duplicate KYC record not found with ID: "
                                        + id
                        )
                );
    }
}