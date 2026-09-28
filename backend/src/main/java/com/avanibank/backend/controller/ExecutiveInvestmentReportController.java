package com.avanibank.backend.controller;

import com.avanibank.backend.dto.InvestmentReportResponse;
import com.avanibank.backend.service.ExecutiveInvestmentReportService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class ExecutiveInvestmentReportController {

    private final ExecutiveInvestmentReportService service;

    public ExecutiveInvestmentReportController(
            ExecutiveInvestmentReportService service) {

        this.service = service;
    }

    @GetMapping("/investments")
    public ResponseEntity<InvestmentReportResponse>
    getInvestmentReport() {

        return ResponseEntity.ok(
                service.getInvestmentReport()
        );
    }
}