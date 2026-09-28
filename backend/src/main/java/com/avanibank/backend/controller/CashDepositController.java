package com.avanibank.backend.controller;

import com.avanibank.backend.dto.CashDepositRequest;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.service.CashDepositService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cash-deposits")
@CrossOrigin(origins = "http://localhost:5173")
public class CashDepositController {

    private final CashDepositService cashDepositService;

    public CashDepositController(
            CashDepositService cashDepositService) {

        this.cashDepositService = cashDepositService;
    }

    @PostMapping
    public ResponseEntity<Transaction> depositCash(
            @Valid @RequestBody CashDepositRequest request) {

        String cashierEmail =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        Transaction transaction =
                cashDepositService.depositCash(
                        cashierEmail,
                        request
                );

        return ResponseEntity.ok(transaction);
    }
}