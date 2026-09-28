package com.avanibank.backend.service;

import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.CustomerRelationshipHistory;
import com.avanibank.backend.repository.CustomerRelationshipHistoryRepository;
import com.avanibank.backend.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CustomerRelationshipHistoryService {

    private final CustomerRelationshipHistoryRepository historyRepository;
    private final CustomerRepository customerRepository;

    public CustomerRelationshipHistoryService(
            CustomerRelationshipHistoryRepository historyRepository,
            CustomerRepository customerRepository) {

        this.historyRepository = historyRepository;
        this.customerRepository = customerRepository;
    }

    // =========================
    // ADD RELATIONSHIP HISTORY
    // =========================

    public CustomerRelationshipHistory addHistory(
            Long customerId,
            String relationshipType,
            String description,
            Long relatedCustomerId) {

        Customer customer = customerRepository
                .findById(customerId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found with ID: "
                                        + customerId
                        )
                );

        Customer relatedCustomer = null;

        if (relatedCustomerId != null) {
            relatedCustomer = customerRepository
                    .findById(relatedCustomerId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Related customer not found with ID: "
                                            + relatedCustomerId
                            )
                    );
        }

        CustomerRelationshipHistory history =
                new CustomerRelationshipHistory();

        history.setCustomer(customer);
        history.setRelationshipType(relationshipType);
        history.setDescription(description);
        history.setRelatedCustomer(relatedCustomer);
        history.setCreatedAt(LocalDateTime.now());

        return historyRepository.save(history);
    }

    // =========================
    // GET CUSTOMER HISTORY
    // =========================

    public List<CustomerRelationshipHistory>
    getCustomerHistory(Long customerId) {

        if (!customerRepository.existsById(customerId)) {
            throw new RuntimeException(
                    "Customer not found with ID: "
                            + customerId
            );
        }

        return historyRepository
                .findByCustomerIdOrderByCreatedAtDesc(
                        customerId
                );
    }

    // =========================
    // GET RELATED CUSTOMER HISTORY
    // =========================

    public List<CustomerRelationshipHistory>
    getRelatedCustomerHistory(Long customerId) {

        if (!customerRepository.existsById(customerId)) {
            throw new RuntimeException(
                    "Customer not found with ID: "
                            + customerId
            );
        }

        return historyRepository
                .findByRelatedCustomerIdOrderByCreatedAtDesc(
                        customerId
                );
    }
}