package com.avanibank.backend.controller;

import com.avanibank.backend.entity.MutualFund;
import com.avanibank.backend.service.MutualFundService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mutual-funds")
public class MutualFundController {

    private final MutualFundService mutualFundService;

    public MutualFundController(
            MutualFundService mutualFundService) {

        this.mutualFundService = mutualFundService;
    }

    // =========================
    // GET ACTIVE MUTUAL FUNDS
    // =========================

    @GetMapping
    public ResponseEntity<List<MutualFund>> getActiveFunds() {

        return ResponseEntity.ok(
                mutualFundService.getActiveFunds()
        );
    }

    // =========================
    // GET MUTUAL FUND BY ID
    // =========================

    @GetMapping("/{fundId}")
    public ResponseEntity<MutualFund> getFundById(
            @PathVariable Long fundId) {

        return ResponseEntity.ok(
                mutualFundService.getFundById(
                        fundId
                )
        );
    }

    // =========================
    // CREATE MUTUAL FUND
    // =========================

    @PostMapping
    public ResponseEntity<MutualFund> createFund(
            @RequestParam String fundName,
            @RequestParam String fundCategory,
            @RequestParam String riskLevel,
            @RequestParam Double expectedReturnRate,
            @RequestParam Double minimumInvestment,
            @RequestParam(required = false) Double exitLoad) {

        return ResponseEntity.ok(
                mutualFundService.createFund(
                        fundName,
                        fundCategory,
                        riskLevel,
                        expectedReturnRate,
                        minimumInvestment,
                        exitLoad
                )
        );
    }

    // =========================
    // DEACTIVATE MUTUAL FUND
    // =========================

    @PutMapping("/{fundId}/deactivate")
    public ResponseEntity<MutualFund> deactivateFund(
            @PathVariable Long fundId) {

        return ResponseEntity.ok(
                mutualFundService.deactivateFund(
                        fundId
                )
        );
    }
}