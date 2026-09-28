package com.avanibank.backend.controller;

import com.avanibank.backend.entity.DuplicateKycDetection;
import com.avanibank.backend.service.DuplicateKycDetectionService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/duplicate-kyc")
@CrossOrigin(origins = "*")
public class DuplicateKycDetectionController {

    private final DuplicateKycDetectionService duplicateKycDetectionService;

    public DuplicateKycDetectionController(
            DuplicateKycDetectionService duplicateKycDetectionService) {

        this.duplicateKycDetectionService =
                duplicateKycDetectionService;
    }

    // =========================
    // CHECK DUPLICATE KYC
    // =========================

    @PostMapping("/check/{customerId}")
    public ResponseEntity<DuplicateKycDetection> checkDuplicate(
            @PathVariable Long customerId,
            @RequestParam String documentType,
            @RequestParam String documentNumber) {

        return ResponseEntity.ok(
                duplicateKycDetectionService.checkDuplicate(
                        customerId,
                        documentType,
                        documentNumber
                )
        );
    }

    // =========================
    // GET DUPLICATE RESULT
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<DuplicateKycDetection> getResult(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                duplicateKycDetectionService.getResult(id)
        );
    }
}