package com.avanibank.backend.repository;

import com.avanibank.backend.entity.SupportChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupportChatMessageRepository
        extends JpaRepository<SupportChatMessage, Long> {

    List<SupportChatMessage>
    findByCustomerIdAndSessionIdOrderByCreatedAtAsc(
            Long customerId,
            String sessionId
    );

    List<SupportChatMessage>
    findByCustomerIdOrderByCreatedAtDesc(Long customerId);
}