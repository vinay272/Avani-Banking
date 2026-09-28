package com.avanibank.backend.repository;

import com.avanibank.backend.entity.AddressVerification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AddressVerificationRepository
        extends JpaRepository<AddressVerification, Long> {

    Optional<AddressVerification> findByCustomerId(Long customerId);
}