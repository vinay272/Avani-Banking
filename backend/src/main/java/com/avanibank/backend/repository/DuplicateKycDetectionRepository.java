package com.avanibank.backend.repository;

import com.avanibank.backend.entity.DuplicateKycDetection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DuplicateKycDetectionRepository
        extends JpaRepository<DuplicateKycDetection, Long> {

    Optional<DuplicateKycDetection> findByDocumentTypeAndDocumentNumber(
            String documentType,
            String documentNumber
    );
}