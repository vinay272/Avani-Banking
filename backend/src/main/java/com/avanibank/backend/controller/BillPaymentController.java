package com.avanibank.backend.controller;

import com.avanibank.backend.dto.BillPaymentRequest;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.service.BillPaymentService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class BillPaymentController {

    private final BillPaymentService billPaymentService;

    public BillPaymentController(
            BillPaymentService billPaymentService) {

        this.billPaymentService = billPaymentService;
    }

    // =====================================================
    // BILL PAYMENT
    // =====================================================

    @PostMapping("/bill")
    public ResponseEntity<Transaction> payBill(
            @RequestBody BillPaymentRequest request) {

        // =================================================
        // GET LOGGED-IN USER EMAIL FROM JWT
        // =================================================

        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        // =================================================
        // PROCESS BILL PAYMENT
        // =================================================

        Transaction transaction =
                billPaymentService.payBill(
                        email,
                        request
                );

        // =================================================
        // SUCCESS
        // =================================================

        return ResponseEntity.ok(transaction);
    }
}