package com.avanibank.backend.controller;

import com.avanibank.backend.entity.Investment;
import com.avanibank.backend.service.InvestmentService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/investments")
public class InvestmentController {

    private final InvestmentService investmentService;

    public InvestmentController(
            InvestmentService investmentService) {

        this.investmentService = investmentService;
    }

    // =========================
    // GET MY INVESTMENTS
    // =========================

    @GetMapping
    public ResponseEntity<List<Investment>> getMyInvestments(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                investmentService.getMyInvestments(email)
        );
    }

    // =========================
    // GET MY ACTIVE INVESTMENTS
    // =========================

    @GetMapping("/active")
    public ResponseEntity<List<Investment>> getMyActiveInvestments(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                investmentService.getMyActiveInvestments(email)
        );
    }

    // =========================
    // GET INVESTMENT BY ID
    // =========================

    @GetMapping("/{investmentId}")
    public ResponseEntity<Investment> getInvestmentById(
            @PathVariable Long investmentId,
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                investmentService.getInvestmentById(
                        investmentId,
                        email
                )
        );
    }

    // =========================
    // GET INVESTMENTS BY TYPE
    // =========================

    @GetMapping("/type/{investmentType}")
    public ResponseEntity<List<Investment>> getInvestmentsByType(
            @PathVariable String investmentType,
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                investmentService.getInvestmentsByType(
                        investmentType,
                        email
                )
        );
    }

        // =========================
    // BUY MUTUAL FUND
    // =========================

    @PostMapping("/mutual-funds/buy")
    public ResponseEntity<Investment> buyMutualFund(
            @RequestParam Long accountId,
            @RequestParam Long fundId,
            @RequestParam Double investmentAmount,
            Authentication authentication) {

        String email = authentication.getName();

        Investment investment =
                investmentService.buyMutualFund(
                        email,
                        accountId,
                        fundId,
                        investmentAmount
                );

        return ResponseEntity.ok(investment);
    }

    // =========================
    // CREATE INVESTMENT
    // =========================

    @PostMapping
    public ResponseEntity<Investment> createInvestment(
            @RequestParam Long accountId,
            @RequestParam String investmentType,
            @RequestParam String investmentName,
            @RequestParam Double principalAmount,
            @RequestParam(required = false) Double expectedReturnRate,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate maturityDate,
            Authentication authentication) {

        String email = authentication.getName();

        Investment investment =
                investmentService.createInvestment(
                        email,
                        accountId,
                        investmentType,
                        investmentName,
                        principalAmount,
                        expectedReturnRate,
                        startDate,
                        maturityDate
                );

        return ResponseEntity.ok(investment);
    }

    // =========================
    // UPDATE CURRENT VALUE
    // =========================

    @PutMapping("/{investmentId}/value")
    public ResponseEntity<Investment> updateCurrentValue(
            @PathVariable Long investmentId,
            @RequestParam Double currentValue,
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                investmentService.updateCurrentValue(
                        investmentId,
                        email,
                        currentValue
                )
        );
    }

    // =========================
    // REDEEM INVESTMENT
    // =========================

    @PutMapping("/{investmentId}/redeem")
    public ResponseEntity<Investment> redeemInvestment(
            @PathVariable Long investmentId,
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                investmentService.redeemInvestment(
                        investmentId,
                        email
                )
        );
    }
}