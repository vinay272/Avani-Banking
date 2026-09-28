package com.avanibank.backend.controller;

import com.avanibank.backend.dto.TransactionMonitoringReportResponse;
import com.avanibank.backend.service.TransactionMonitoringService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/compliance")
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionMonitoringController {

    private final TransactionMonitoringService
            transactionMonitoringService;

    public TransactionMonitoringController(
            TransactionMonitoringService transactionMonitoringService) {

        this.transactionMonitoringService =
                transactionMonitoringService;
    }

    // =====================================================
    // TRANSACTION MONITORING REPORT
    // =====================================================

    @GetMapping("/transactions")
    public ResponseEntity<TransactionMonitoringReportResponse>
    getTransactionMonitoringReport() {

        return ResponseEntity.ok(
                transactionMonitoringService.getReport()
        );
    }
}