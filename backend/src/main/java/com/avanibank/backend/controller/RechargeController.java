package com.avanibank.backend.controller;

import com.avanibank.backend.dto.RechargeRequest;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.service.TransactionService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recharge")
@CrossOrigin(origins = "*")
public class RechargeController {

    private final TransactionService transactionService;

    public RechargeController(
            TransactionService transactionService) {

        this.transactionService = transactionService;
    }

    // =====================================================
    // MOBILE RECHARGE
    // =====================================================

    @PostMapping
    public ResponseEntity<Transaction> recharge(
            @RequestBody RechargeRequest request) {

        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        Transaction transaction =
                transactionService.recharge(
                        email,
                        request
                );

        return ResponseEntity.ok(transaction);
    }
}
