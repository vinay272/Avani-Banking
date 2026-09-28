package com.avanibank.backend.controller;

import com.avanibank.backend.entity.FraudAlert;
import com.avanibank.backend.service.FraudAlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/fraud")
@CrossOrigin(origins = "http://localhost:5173")
public class FraudAlertController {

    private final FraudAlertService fraudAlertService;

    public FraudAlertController(
            FraudAlertService fraudAlertService
    ) {
        this.fraudAlertService = fraudAlertService;
    }

    /*
     * Analyze a transaction and create a fraud alert
     * when the risk is MEDIUM or above.
     */
    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeTransaction(
            Authentication authentication,
            @RequestParam Long accountId,
            @RequestParam BigDecimal amount,
            @RequestParam String transactionType,
            @RequestParam(defaultValue = "0")
            int recentTransactionCount,
            @RequestParam(defaultValue = "false")
            boolean unusualLocation,
            @RequestParam(defaultValue = "false")
            boolean unusualDevice,
            @RequestParam(defaultValue = "false")
            boolean accountTakeoverIndicators,
            @RequestParam(defaultValue = "false")
            boolean moneyLaunderingIndicators,
            @RequestParam(required = false)
            Long transactionId,
            @RequestParam(required = false)
            String location
    ) {

        String customerEmail = authentication.getName();

        FraudAlert alert =
                fraudAlertService.analyzeAndCreateAlert(
                        customerEmail,
                        accountId,
                        amount,
                        transactionType,
                        recentTransactionCount,
                        unusualLocation,
                        unusualDevice,
                        accountTakeoverIndicators,
                        moneyLaunderingIndicators,
                        transactionId,
                        location
                );

        if (alert == null) {
            return ResponseEntity.ok(
                    "Transaction risk is LOW. No fraud alert created."
            );
        }

        return ResponseEntity.ok(alert);
    }

    /*
     * Get all fraud alerts for logged-in customer.
     */
    @GetMapping("/alerts")
    public ResponseEntity<List<FraudAlert>> getMyAlerts(
            Authentication authentication
    ) {

        String customerEmail = authentication.getName();

        return ResponseEntity.ok(
                fraudAlertService.getCustomerAlerts(
                        customerEmail
                )
        );
    }

    /*
     * Get only OPEN fraud alerts.
     */
    @GetMapping("/alerts/open")
    public ResponseEntity<List<FraudAlert>> getOpenAlerts(
            Authentication authentication
    ) {

        String customerEmail = authentication.getName();

        return ResponseEntity.ok(
                fraudAlertService.getOpenCustomerAlerts(
                        customerEmail
                )
        );
    }

     /*
     * Get number of OPEN fraud alerts.
     */
    @GetMapping("/alerts/open/count")
    public ResponseEntity<Long> getOpenAlertCount(
            Authentication authentication
    ) {

        String customerEmail = authentication.getName();

        return ResponseEntity.ok(
                fraudAlertService.getOpenAlertCount(
                        customerEmail
                )
        );
    }
}