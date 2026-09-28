package com.avanibank.backend.controller;

import com.avanibank.backend.entity.Beneficiary;
import com.avanibank.backend.service.BeneficiaryService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/beneficiaries")
@CrossOrigin(origins = "*")
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    public BeneficiaryController(
            BeneficiaryService beneficiaryService) {

        this.beneficiaryService = beneficiaryService;
    }

    // =========================
    // ADD BENEFICIARY
    // =========================

    @PostMapping
    public ResponseEntity<Beneficiary> addBeneficiary(
            @RequestParam String beneficiaryName,
            @RequestParam String accountNumber) {

        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        Beneficiary beneficiary =
                beneficiaryService.addBeneficiary(
                        email,
                        beneficiaryName,
                        accountNumber
                );

        return ResponseEntity.ok(beneficiary);
    }

    // =========================
    // GET MY BENEFICIARIES
    // =========================

    @GetMapping
    public ResponseEntity<List<Beneficiary>>
    getMyBeneficiaries() {

        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        return ResponseEntity.ok(
                beneficiaryService.getMyBeneficiaries(
                        email
                )
        );
    }

    // =========================
    // DELETE BENEFICIARY
    // =========================

    @DeleteMapping("/{beneficiaryId}")
    public ResponseEntity<String> deleteBeneficiary(
            @PathVariable Long beneficiaryId) {

        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        beneficiaryService.deleteBeneficiary(
                email,
                beneficiaryId
        );

        return ResponseEntity.ok(
                "Beneficiary deleted successfully."
        );
    }
}