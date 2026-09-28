package com.avanibank.backend.controller;

import com.avanibank.backend.dto.UpiTransferRequest;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.entity.UpiAccount;
import com.avanibank.backend.service.UpiService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/upi")
public class UpiController {

    private final UpiService upiService;

    public UpiController(UpiService upiService) {
        this.upiService = upiService;
    }

    // =====================================================
    // CREATE UPI ID
    // =====================================================

    @PostMapping("/create")
    public ResponseEntity<UpiAccount> createUpiId(
            Authentication authentication,
            @RequestParam Long accountId,
            @RequestParam String upiId) {

        String email = authentication.getName();

        UpiAccount upiAccount =
                upiService.createUpiId(
                        email,
                        accountId,
                        upiId
                );

        return ResponseEntity.ok(upiAccount);
    }

    // =====================================================
    // GET MY UPI IDs
    // =====================================================

    @GetMapping("/my")
    public ResponseEntity<List<UpiAccount>> getMyUpiIds(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                upiService.getMyUpiIds(email)
        );
    }

    // =====================================================
    // UPI TRANSFER
    // =====================================================

    @PostMapping("/transfer")
    public ResponseEntity<Transaction> transferMoney(
            Authentication authentication,
            @RequestBody UpiTransferRequest request) {

        String email = authentication.getName();

        Transaction transaction =
                upiService.transferMoney(
                        email,
                        request
                );

        return ResponseEntity.ok(transaction);
    }
}