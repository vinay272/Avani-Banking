package com.avanibank.backend.controller;

import com.avanibank.backend.entity.InvestmentReport;
import com.avanibank.backend.service.InvestmentReportService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/investment-reports")
@CrossOrigin(origins = "http://localhost:5173")
public class InvestmentReportController {

    private final InvestmentReportService investmentReportService;

    public InvestmentReportController(
            InvestmentReportService investmentReportService) {
        this.investmentReportService = investmentReportService;
    }

    @GetMapping
    public ResponseEntity<InvestmentReport> getInvestmentReport(
            Authentication authentication) {

        String customerEmail = authentication.getName();

        return ResponseEntity.ok(
                investmentReportService.generateReport(customerEmail)
        );
    }
}