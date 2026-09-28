package com.avanibank.backend.controller;

import com.avanibank.backend.dto.ScheduledPaymentRequest;
import com.avanibank.backend.entity.ScheduledPayment;
import com.avanibank.backend.service.ScheduledPaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@RestController
@RequestMapping("/api/scheduled-payments")
@CrossOrigin(origins = "*")
public class ScheduledPaymentController {

    private final ScheduledPaymentService scheduledPaymentService;

    public ScheduledPaymentController(
            ScheduledPaymentService scheduledPaymentService) {

        this.scheduledPaymentService =
                scheduledPaymentService;
    }

    // =====================================================
    // CREATE SCHEDULED PAYMENT
    // =====================================================

    @PostMapping
    public ResponseEntity<ScheduledPayment>
    createScheduledPayment(
            @RequestBody ScheduledPaymentRequest request) {

        String email = getLoggedInEmail();

        ScheduledPayment scheduledPayment =
                scheduledPaymentService
                        .createScheduledPayment(
                                email,
                                request
                        );

        return ResponseEntity.ok(
                scheduledPayment
        );
    }

    // =====================================================
    // GET ALL SCHEDULED PAYMENTS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<ScheduledPayment>>
    getScheduledPayments() {

        String email = getLoggedInEmail();

        return ResponseEntity.ok(
                scheduledPaymentService
                        .getScheduledPayments(email)
        );
    }

    // =====================================================
    // GET SCHEDULED PAYMENT BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<ScheduledPayment>
    getScheduledPayment(
            @PathVariable Long id) {

        String email = getLoggedInEmail();

        return ResponseEntity.ok(
                scheduledPaymentService
                        .getScheduledPayment(
                                email,
                                id
                        )
        );
    }

    // =====================================================
    // PAUSE
    // =====================================================

    @PutMapping("/{id}/pause")
    public ResponseEntity<ScheduledPayment>
    pauseScheduledPayment(
            @PathVariable Long id) {

        String email = getLoggedInEmail();

        return ResponseEntity.ok(
                scheduledPaymentService
                        .pauseScheduledPayment(
                                email,
                                id
                        )
        );
    }

    // =====================================================
    // RESUME
    // =====================================================

    @PutMapping("/{id}/resume")
    public ResponseEntity<ScheduledPayment>
    resumeScheduledPayment(
            @PathVariable Long id) {

        String email = getLoggedInEmail();

        return ResponseEntity.ok(
                scheduledPaymentService
                        .resumeScheduledPayment(
                                email,
                                id
                        )
        );
    }

    // =====================================================
    // CANCEL
    // =====================================================

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ScheduledPayment>
    cancelScheduledPayment(
            @PathVariable Long id) {

        String email = getLoggedInEmail();

        return ResponseEntity.ok(
                scheduledPaymentService
                        .cancelScheduledPayment(
                                email,
                                id
                        )
        );
    }

    // =====================================================
    // DELETE
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String>
    deleteScheduledPayment(
            @PathVariable Long id) {

        String email = getLoggedInEmail();

        scheduledPaymentService
                .deleteScheduledPayment(
                        email,
                        id
                );

        return ResponseEntity.ok(
                "Scheduled Payment deleted successfully"
        );
    }

    // =====================================================
    // GET LOGGED-IN EMAIL
    // =====================================================

    private String getLoggedInEmail() {

        return SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
    }
   
}