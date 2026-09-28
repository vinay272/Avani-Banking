package com.avanibank.backend.repository;

import com.avanibank.backend.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CardRepository extends JpaRepository<Card, Long> {

    List<Card> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    Optional<Card> findByIdAndCustomerId(Long cardId, Long customerId);

    boolean existsByCustomerIdAndAccountIdAndCardTypeAndStatus(
            Long customerId,
            Long accountId,
            String cardType,
            String status
    );

    boolean existsByCardNumberHash(String cardNumberHash);
}