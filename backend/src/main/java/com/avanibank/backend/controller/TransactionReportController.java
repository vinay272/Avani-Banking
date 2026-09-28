package com.avanibank.backend.controller;

import com.avanibank.backend.dto.TransactionReportResponse;
import com.avanibank.backend.service.TransactionReportService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionReportController {

    private final TransactionReportService transactionReportService;

    public TransactionReportController(
            TransactionReportService transactionReportService) {

        this.transactionReportService =
                transactionReportService;
    }

    // =====================================================
    // TRANSACTION REPORT
    // =====================================================

    @GetMapping("/transactions")
    public ResponseEntity<TransactionReportResponse>
    getTransactionReport() {

        return ResponseEntity.ok(
                transactionReportService
                        .getTransactionReport()
        );
    }
}