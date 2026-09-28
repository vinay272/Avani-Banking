package com.avanibank.backend.repository;

import com.avanibank.backend.entity.CustomerRelationshipHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomerRelationshipHistoryRepository
        extends JpaRepository<CustomerRelationshipHistory, Long> {

    List<CustomerRelationshipHistory>
    findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<CustomerRelationshipHistory>
    findByRelatedCustomerIdOrderByCreatedAtDesc(Long customerId);
}