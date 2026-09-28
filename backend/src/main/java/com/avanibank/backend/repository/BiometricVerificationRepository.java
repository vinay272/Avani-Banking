package com.avanibank.backend.repository;

import com.avanibank.backend.entity.BiometricVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BiometricVerificationRepository
        extends JpaRepository<BiometricVerification, Long> {

    List<BiometricVerification>
    findByCustomerIdOrderByVerifiedAtDesc(Long customerId);

    List<BiometricVerification>
    findByCustomerIdAndStatusOrderByVerifiedAtDesc(
            Long customerId,
            String status
    );
}