package com.avanibank.backend.controller;

import com.avanibank.backend.entity.AmlCheck;
import com.avanibank.backend.service.AmlCheckService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/aml-check")
@CrossOrigin(origins = "*")
public class AmlCheckController {

    private final AmlCheckService amlCheckService;

    public AmlCheckController(
            AmlCheckService amlCheckService) {

        this.amlCheckService = amlCheckService;
    }

    // =========================
    // CREATE AML CHECK
    // =========================

    @PostMapping("/check")
    public ResponseEntity<AmlCheck> createCheck(
            @RequestParam Long customerId,
            @RequestParam String status,
            @RequestParam String riskLevel,
            @RequestParam(required = false) String remarks) {

        return ResponseEntity.ok(
                amlCheckService.createCheck(
                        customerId,
                        status,
                        riskLevel,
                        remarks
                )
        );
    }

    // =========================
    // GET CUSTOMER AML HISTORY
    // =========================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<AmlCheck>> getCustomerChecks(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                amlCheckService.getCustomerChecks(
                        customerId
                )
        );
    }

    // =========================
    // GET FLAGGED CHECKS
    // =========================

    @GetMapping("/customer/{customerId}/flagged")
    public ResponseEntity<List<AmlCheck>> getFlaggedChecks(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                amlCheckService.getFlaggedChecks(
                        customerId
                )
        );
    }

    // =========================
    // GET HIGH-RISK CHECKS
    // =========================

    @GetMapping("/high-risk")
    public ResponseEntity<List<AmlCheck>> getHighRiskChecks() {

        return ResponseEntity.ok(
                amlCheckService.getHighRiskChecks()
        );
    }
}