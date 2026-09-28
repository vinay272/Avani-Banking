package com.avanibank.backend.controller;

import com.avanibank.backend.dto.CardIssuanceRequest;
import com.avanibank.backend.dto.CardLimitRequest;
import com.avanibank.backend.dto.CardPinRequest;
import com.avanibank.backend.dto.CardResponse;
import com.avanibank.backend.dto.CardRewardRequest;
import com.avanibank.backend.dto.CardStatementResponse;
import com.avanibank.backend.entity.Card;
import com.avanibank.backend.service.CardService;
import com.avanibank.backend.dto.CardPinChangeRequest;
import com.avanibank.backend.dto.CardPinResetRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cards")
@CrossOrigin(origins = "*")
public class CardController {

    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    // =====================================================
    // CARD ISSUANCE
    // =====================================================

    @PostMapping("/issue")
    public ResponseEntity<CardResponse> issueCard(
            @RequestBody CardIssuanceRequest request) {

        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        Card card =
                cardService.issueCard(email, request);

        return ResponseEntity.ok(
                new CardResponse(card)
        );
    }

// =====================================================
// CARD ACTIVATION
// =====================================================

@PutMapping("/{cardId}/activate")
public ResponseEntity<CardResponse> activateCard(
        @PathVariable Long cardId) {

    String email =
            SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    .getName();

    Card card =
            cardService.activateCard(
                    email,
                    cardId
            );

    return ResponseEntity.ok(
            new CardResponse(card)
    );
}

// =====================================================
// PIN GENERATION
// =====================================================

@PostMapping("/{cardId}/pin")
public ResponseEntity<CardResponse> generatePin(
        @PathVariable Long cardId,
        @RequestBody CardPinRequest request) {

    String email =
            SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    .getName();

    if (request == null) {
        throw new RuntimeException(
                "PIN request cannot be empty"
        );
    }

    Card card =
            cardService.generatePin(
                    email,
                    cardId,
                    request.getPin()
            );

    return ResponseEntity.ok(
            new CardResponse(card)
    );
}

// =====================================================
// CHANGE CARD PIN
// =====================================================

@PostMapping("/{cardId}/pin/change")
public ResponseEntity<CardResponse> changePin(
        @PathVariable Long cardId,
        @RequestBody CardPinChangeRequest request) {

    String email =
            SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    .getName();

    if (request == null) {
        throw new RuntimeException(
                "PIN change request cannot be empty"
        );
    }

    Card card =
            cardService.changePin(
                    email,
                    cardId,
                    request.getCurrentPin(),
                    request.getNewPin()
            );

    return ResponseEntity.ok(
            new CardResponse(card)
    );
}


// =====================================================
// RESET / FORGOT CARD PIN
// =====================================================

@PostMapping("/{cardId}/pin/reset")
public ResponseEntity<CardResponse> resetPin(
        @PathVariable Long cardId,
        @RequestBody CardPinResetRequest request) {

    String email =
            SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    .getName();

    if (request == null) {
        throw new RuntimeException(
                "PIN reset request cannot be empty"
        );
    }

    Card card =
            cardService.resetPin(
                    email,
                    cardId,
                    request.getNewPin()
            );

    return ResponseEntity.ok(
            new CardResponse(card)
    );
}

// =====================================================
// CARD BLOCKING
// =====================================================

@PutMapping("/{cardId}/block")
public ResponseEntity<CardResponse> blockCard(
        @PathVariable Long cardId) {

    String email =
            SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    .getName();

    Card card =
            cardService.blockCard(
                    email,
                    cardId
            );

    return ResponseEntity.ok(
            new CardResponse(card)
    );
}

    
    // =====================================================
    // INTERNATIONAL USAGE 
    // =====================================================

    @PutMapping("/{cardId}/international-usage")
    public ResponseEntity<CardResponse> updateInternationalUsage(
        @PathVariable Long cardId,
        @RequestBody Boolean enabled) {

    String email = SecurityContextHolder.getContext()
        .getAuthentication()
        .getName();

    Card card = cardService.updateInternationalUsage(
        email,
        cardId,
        enabled
    );

    return ResponseEntity.ok(new CardResponse(card));
    }

    // =====================================================
    // REWARD POINTS
    // =====================================================

    @PostMapping("/{cardId}/rewards")
    public ResponseEntity<CardResponse> addRewardPoints(
        @PathVariable Long cardId,
        @RequestBody CardRewardRequest request) {

    String email = SecurityContextHolder.getContext()
        .getAuthentication()
        .getName();

    if (request == null) {
        throw new RuntimeException("Reward request cannot be empty");
    }

    Card card = cardService.addRewardPoints(
        email,
        cardId,
        request.getPoints()
    );

    return ResponseEntity.ok(new CardResponse(card));
    }

    
    // =====================================================
    // CARD STATEMENT
    // =====================================================

    @GetMapping("/{cardId}/statement")
public ResponseEntity<List<CardStatementResponse>> getCardStatement(
        @PathVariable Long cardId) {

    String email = SecurityContextHolder.getContext()
        .getAuthentication()
        .getName();

    List<CardStatementResponse> statement =
        cardService.getCardStatement(email, cardId);

    return ResponseEntity.ok(statement);
    }

    // =====================================================
    // CARD REPLACE
    // =====================================================

    @PutMapping("/{cardId}/replace")
    public ResponseEntity<CardResponse> replaceCard(@PathVariable Long cardId) {

    String email = SecurityContextHolder.getContext()
        .getAuthentication()
        .getName();

    Card newCard = cardService.replaceCard(email, cardId);

    return ResponseEntity.ok(new CardResponse(newCard));
    }

    // =====================================================
    // TRANSACTION LIMIT
    // =====================================================

    @PutMapping("/{cardId}/limits")
    public ResponseEntity<CardResponse> updateTransactionLimits(
        @PathVariable Long cardId,
        @RequestBody CardLimitRequest request) {

    String email = SecurityContextHolder.getContext()
        .getAuthentication()
        .getName();

    Card card = cardService.updateTransactionLimits(
        email,
        cardId,
        request
    );

    return ResponseEntity.ok(new CardResponse(card));
    }

    // =====================================================
    // GET MY CARDS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<CardResponse>> getMyCards() {

        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        List<CardResponse> response =
                cardService.getMyCards(email)
                        .stream()
                        .map(CardResponse::new)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // =====================================================
    // GET SINGLE CARD
    // =====================================================

    @GetMapping("/{cardId}")
    public ResponseEntity<CardResponse> getMyCard(
            @PathVariable Long cardId) {

        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        Card card =
                cardService.getMyCard(
                        email,
                        cardId
                );

        return ResponseEntity.ok(
                new CardResponse(card)
        );
    }
}