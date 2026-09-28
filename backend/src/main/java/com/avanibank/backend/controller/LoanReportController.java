package com.avanibank.backend.controller;

import com.avanibank.backend.dto.LoanReportResponse;
import com.avanibank.backend.service.LoanReportService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class LoanReportController {

    private final LoanReportService loanReportService;

    public LoanReportController(
            LoanReportService loanReportService) {

        this.loanReportService =
                loanReportService;
    }

    // =====================================================
    // LOAN REPORT
    // =====================================================

    @GetMapping("/loans")
    public ResponseEntity<LoanReportResponse>
    getLoanReport() {

        return ResponseEntity.ok(
                loanReportService
                        .getLoanReport()
        );
    }
}