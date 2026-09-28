package com.avanibank.backend.controller;

import com.avanibank.backend.entity.BiometricVerification;
import com.avanibank.backend.service.BiometricVerificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/biometric-verification")
@CrossOrigin(origins = "*")
public class BiometricVerificationController {

    private final BiometricVerificationService biometricService;

    public BiometricVerificationController(
            BiometricVerificationService biometricService) {

        this.biometricService = biometricService;
    }

    // =========================
    // CREATE BIOMETRIC VERIFICATION
    // =========================

    @PostMapping("/verify")
    public ResponseEntity<BiometricVerification> createVerification(
            @RequestParam Long customerId,
            @RequestParam String biometricType,
            @RequestParam String status,
            @RequestParam(required = false) String remarks) {

        return ResponseEntity.ok(
                biometricService.createVerification(
                        customerId,
                        biometricType,
                        status,
                        remarks
                )
        );
    }

    // =========================
    // GET CUSTOMER VERIFICATIONS
    // =========================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<BiometricVerification>>
    getCustomerVerifications(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                biometricService.getCustomerVerifications(
                        customerId
                )
        );
    }

    // =========================
    // GET VERIFIED RECORDS
    // =========================

    @GetMapping("/customer/{customerId}/verified")
    public ResponseEntity<List<BiometricVerification>>
    getVerifiedRecords(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                biometricService.getVerifiedRecords(
                        customerId
                )
        );
    }
}