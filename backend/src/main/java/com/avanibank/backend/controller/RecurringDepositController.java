package com.avanibank.backend.controller;

import com.avanibank.backend.entity.RecurringDeposit;
import com.avanibank.backend.service.RecurringDepositService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recurring-deposits")
@CrossOrigin(origins = "*")
public class RecurringDepositController {

    private final RecurringDepositService recurringDepositService;

    public RecurringDepositController(
            RecurringDepositService recurringDepositService) {

        this.recurringDepositService =
                recurringDepositService;
    }

    // =========================
    // CREATE RD
    // =========================

    @PostMapping
    public ResponseEntity<RecurringDeposit> createRD(
            @RequestParam Long accountId,
            @RequestParam Double monthlyInstallment,
            @RequestParam Double interestRate,
            @RequestParam Integer tenureMonths) {

        String email = getLoggedInEmail();

        return ResponseEntity.ok(
                recurringDepositService.createRecurringDeposit(
                        email,
                        accountId,
                        monthlyInstallment,
                        interestRate,
                        tenureMonths
                )
        );
    }

    // =========================
    // GET MY RDS
    // =========================

    @GetMapping
    public ResponseEntity<List<RecurringDeposit>>
    getMyRDs() {

        String email = getLoggedInEmail();

        return ResponseEntity.ok(
                recurringDepositService
                        .getMyRecurringDeposits(email)
        );
    }

    // =========================
    // GET ACTIVE RDS
    // =========================

    @GetMapping("/active")
    public ResponseEntity<List<RecurringDeposit>>
    getActiveRDs() {

        String email = getLoggedInEmail();

        return ResponseEntity.ok(
                recurringDepositService
                        .getActiveRecurringDeposits(email)
        );
    }

    // =========================
    // GET RD BY ID
    // =========================

    @GetMapping("/{rdId}")
    public ResponseEntity<RecurringDeposit>
    getRDById(
            @PathVariable Long rdId) {

        String email = getLoggedInEmail();

        return ResponseEntity.ok(
                recurringDepositService
                        .getRecurringDepositById(
                                rdId,
                                email
                        )
        );
    }

    // =========================
    // CLOSE RD
    // =========================

    @PutMapping("/{rdId}/close")
    public ResponseEntity<RecurringDeposit>
    closeRD(
            @PathVariable Long rdId) {

        String email = getLoggedInEmail();

        return ResponseEntity.ok(
                recurringDepositService
                        .closeRecurringDeposit(
                                rdId,
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
}