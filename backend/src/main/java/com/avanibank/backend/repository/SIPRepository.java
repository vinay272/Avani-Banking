package com.avanibank.backend.repository;

import com.avanibank.backend.entity.SIP;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SIPRepository extends JpaRepository<SIP, Long> {

    List<SIP> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<SIP> findByCustomerIdAndStatusOrderByCreatedAtDesc(
            Long customerId,
            String status
    );

    Optional<SIP> findByIdAndCustomerId(
            Long id,
            Long customerId
    );
}