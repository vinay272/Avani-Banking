package com.avanibank.backend.controller;

import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.service.AccountStatementService;
import com.avanibank.backend.service.CustomerService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/account")
@CrossOrigin(origins = "*")
public class AccountStatementController {

    private final AccountStatementService accountStatementService;
    private final CustomerService customerService;

    public AccountStatementController(
            AccountStatementService accountStatementService,
            CustomerService customerService) {

        this.accountStatementService = accountStatementService;
        this.customerService = customerService;
    }

    // =========================
    // ACCOUNT STATEMENT
    // =========================

    @GetMapping("/statement")
    public ResponseEntity<List<Transaction>> getAccountStatement() {

        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        Customer customer =
                customerService.getCustomerByEmail(email);

        return ResponseEntity.ok(
                accountStatementService.getAccountStatement(
                        customer.getAccountNumber()
                )
        );
    }

    // =========================
    // MINI STATEMENT
    // =========================

    @GetMapping("/mini-statement")
    public ResponseEntity<List<Transaction>> getMiniStatement() {

        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        Customer customer =
                customerService.getCustomerByEmail(email);

        return ResponseEntity.ok(
                accountStatementService.getMiniStatement(
                        customer.getAccountNumber()
                )
        );
    }
}