package com.avanibank.backend.repository;

import com.avanibank.backend.entity.DataRetentionPolicy;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DataRetentionPolicyRepository
        extends JpaRepository<DataRetentionPolicy, Long> {

    List<DataRetentionPolicy>
    findByStatusOrderByCreatedAtDesc(String status);

    boolean existsByPolicyNameIgnoreCase(String policyName);
}