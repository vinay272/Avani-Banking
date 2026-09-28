package com.avanibank.backend.controller;

import com.avanibank.backend.dto.CustomerReportResponse;
import com.avanibank.backend.service.CustomerReportService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class CustomerReportController {

    private final CustomerReportService customerReportService;

    public CustomerReportController(
            CustomerReportService customerReportService) {

        this.customerReportService =
                customerReportService;
    }

    // =====================================================
    // CUSTOMER REPORT
    // =====================================================

    @GetMapping("/customers")
    public ResponseEntity<CustomerReportResponse>
    getCustomerReport() {

        return ResponseEntity.ok(
                customerReportService
                        .getCustomerReport()
        );
    }
}