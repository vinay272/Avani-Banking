package com.avanibank.backend.repository;

import com.avanibank.backend.entity.KycDocument;
import com.avanibank.backend.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface KycDocumentRepository
                extends JpaRepository<KycDocument, Long> {

        List<KycDocument> findByCustomer(Customer customer);

        List<KycDocument> findByVerificationStatus(String verificationStatus);

    boolean existsByCustomerAndDocumentType(
            Customer customer,
            String documentType
    );

     // Duplicate KYC detection
        boolean existsByDocumentTypeAndDocumentNumber(
                        String documentType,
                        String documentNumber);
}