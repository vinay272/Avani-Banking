package com.avanibank.backend.controller;

import com.avanibank.backend.entity.CustomerRiskProfile;
import com.avanibank.backend.service.CustomerRiskProfileService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/risk-profile")
@CrossOrigin(origins = "*")
public class CustomerRiskProfileController {

    private final CustomerRiskProfileService riskProfileService;

    public CustomerRiskProfileController(
            CustomerRiskProfileService riskProfileService) {

        this.riskProfileService = riskProfileService;
    }

    // =========================
    // CREATE / UPDATE RISK PROFILE
    // =========================

    @PostMapping("/customer/{customerId}")
    public ResponseEntity<CustomerRiskProfile> saveRiskProfile(
            @PathVariable Long customerId,
            @RequestParam Integer riskScore,
            @RequestParam String riskLevel,
            @RequestParam(required = false) String remarks) {

        CustomerRiskProfile profile =
                riskProfileService.saveRiskProfile(
                        customerId,
                        riskScore,
                        riskLevel,
                        remarks
                );

        return ResponseEntity.ok(profile);
    }

    // =========================
    // GET CUSTOMER RISK PROFILE
    // =========================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<CustomerRiskProfile> getRiskProfile(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                riskProfileService.getRiskProfile(customerId)
        );
    }

    // =========================
    // DELETE CUSTOMER RISK PROFILE
    // =========================

    @DeleteMapping("/customer/{customerId}")
    public ResponseEntity<String> deleteRiskProfile(
            @PathVariable Long customerId) {

        riskProfileService.deleteRiskProfile(customerId);

        return ResponseEntity.ok(
                "Risk profile deleted successfully."
        );
    }
}