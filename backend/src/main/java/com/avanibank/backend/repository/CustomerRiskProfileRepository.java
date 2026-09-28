package com.avanibank.backend.repository;

import com.avanibank.backend.entity.CustomerRiskProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRiskProfileRepository
        extends JpaRepository<CustomerRiskProfile, Long> {

    Optional<CustomerRiskProfile> findByCustomerId(Long customerId);
}