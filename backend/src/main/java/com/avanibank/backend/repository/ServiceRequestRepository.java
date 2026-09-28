package com.avanibank.backend.repository;

import com.avanibank.backend.entity.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServiceRequestRepository
        extends JpaRepository<ServiceRequest, Long> {

    List<ServiceRequest> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<ServiceRequest> findByStatusOrderByCreatedAtDesc(String status);

    Optional<ServiceRequest> findByRequestNumber(String requestNumber);
}