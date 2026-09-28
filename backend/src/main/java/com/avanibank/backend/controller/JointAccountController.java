package com.avanibank.backend.controller;

import com.avanibank.backend.entity.JointAccount;
import com.avanibank.backend.service.JointAccountService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/joint-accounts")
@CrossOrigin(origins = "*")
public class JointAccountController {

    private final JointAccountService jointAccountService;

    public JointAccountController(
            JointAccountService jointAccountService) {

        this.jointAccountService = jointAccountService;
    }

    // =========================
    // CREATE JOINT ACCOUNT
    // =========================

    @PostMapping("/create")
    public ResponseEntity<JointAccount> createJointAccount(
            @RequestParam Long primaryCustomerId,
            @RequestParam Long jointCustomerId,
            @RequestParam String accountNumber,
            @RequestParam String ownershipType) {

        return ResponseEntity.ok(
                jointAccountService.createJointAccount(
                        primaryCustomerId,
                        jointCustomerId,
                        accountNumber,
                        ownershipType
                )
        );
    }

    // =========================
    // GET PRIMARY CUSTOMER ACCOUNTS
    // =========================

    @GetMapping("/primary/{customerId}")
    public ResponseEntity<List<JointAccount>>
    getPrimaryCustomerAccounts(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                jointAccountService
                        .getPrimaryCustomerAccounts(customerId)
        );
    }

    // =========================
    // GET JOINT CUSTOMER ACCOUNTS
    // =========================

    @GetMapping("/joint/{customerId}")
    public ResponseEntity<List<JointAccount>>
    getJointCustomerAccounts(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                jointAccountService
                        .getJointCustomerAccounts(customerId)
        );
    }

    // =========================
    // UPDATE STATUS
    // =========================

    @PutMapping("/{accountId}/status")
    public ResponseEntity<JointAccount> updateStatus(
            @PathVariable Long accountId,
            @RequestParam String status) {

        return ResponseEntity.ok(
                jointAccountService.updateStatus(
                        accountId,
                        status
                )
        );
    }

    // =========================
    // DELETE JOINT ACCOUNT
    // =========================

    @DeleteMapping("/{accountId}")
    public ResponseEntity<String> deleteJointAccount(
            @PathVariable Long accountId) {

        jointAccountService.deleteJointAccount(accountId);

        return ResponseEntity.ok(
                "Joint account deleted successfully."
        );
    }
}
