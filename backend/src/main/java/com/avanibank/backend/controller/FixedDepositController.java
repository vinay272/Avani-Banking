package com.avanibank.backend.controller;

import com.avanibank.backend.entity.FixedDeposit;
import com.avanibank.backend.service.FixedDepositService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.List;

@RestController
@RequestMapping("/api/fixed-deposits")
@CrossOrigin(origins = "*")
public class FixedDepositController {

    private final FixedDepositService fixedDepositService;

    public FixedDepositController(
            FixedDepositService fixedDepositService) {

        this.fixedDepositService = fixedDepositService;
    }

    // =========================
    // CREATE FIXED DEPOSIT
    // =========================

    @PostMapping
    public ResponseEntity<FixedDeposit> createFixedDeposit(
            @RequestParam Long accountId,
            @RequestParam Double amount,
            @RequestParam Double interestRate,
            @RequestParam Integer tenureMonths) {

        String email = getLoggedInEmail();

        return ResponseEntity.ok(
                fixedDepositService.createFixedDeposit(
                        email,
                        accountId,
                        amount,
                        interestRate,
                        tenureMonths
                )
        );
    }

    // =========================
    // GET MY FIXED DEPOSITS
    // =========================

    @GetMapping
    public ResponseEntity<List<FixedDeposit>> getMyFixedDeposits() {

        String email = getLoggedInEmail();

        return ResponseEntity.ok(
                fixedDepositService.getMyFixedDeposits(email)
        );
    }

    // =========================
    // GET ACTIVE FIXED DEPOSITS
    // =========================

    @GetMapping("/active")
    public ResponseEntity<List<FixedDeposit>> getActiveFixedDeposits() {

        String email = getLoggedInEmail();

        return ResponseEntity.ok(
                fixedDepositService.getActiveFixedDeposits(email)
        );
    }

    // =========================
    // GET FD BY ID
    // =========================

    @GetMapping("/{fdId}")
    public ResponseEntity<FixedDeposit> getFixedDepositById(
            @PathVariable Long fdId) {

        String email = getLoggedInEmail();

        return ResponseEntity.ok(
                fixedDepositService.getFixedDepositById(
                        fdId,
                        email
                )
        );
    }

    // =========================
    // LOGGED-IN USER EMAIL
    // =========================

    private String getLoggedInEmail() {

        return SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
    }
    // =========================
// FD ERROR HANDLER
// =========================

@ExceptionHandler(RuntimeException.class)
public ResponseEntity<?> handleRuntimeException(
        RuntimeException ex) {
    System.out.println("FD ERROR: " + ex.getMessage());
    return ResponseEntity
            .badRequest()
            .body(
                    java.util.Map.of(
                        "message",
                            ex.getMessage() != null
                                    ? ex.getMessage()
                                    : "Unable to create fixed deposit."
                    )
            );
}

// =====================================================
// PREMATURE FD CLOSURE
// =====================================================

@PutMapping("/{fdId}/close")
public ResponseEntity<FixedDeposit> closeFixedDeposit(
        @PathVariable Long fdId,
        Authentication authentication) {

    String email = authentication.getName();

    FixedDeposit closedFD =
            fixedDepositService.closeFixedDeposit(
                    fdId,
                    email
            );

    return ResponseEntity.ok(closedFD);
}

}