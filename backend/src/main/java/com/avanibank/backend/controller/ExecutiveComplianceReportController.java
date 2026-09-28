package com.avanibank.backend.controller;

import com.avanibank.backend.dto.ComplianceReportResponse;
import com.avanibank.backend.service.ExecutiveComplianceReportService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class ExecutiveComplianceReportController {

    private final ExecutiveComplianceReportService service;


    public ExecutiveComplianceReportController(
            ExecutiveComplianceReportService service) {

        this.service = service;
    }


    @GetMapping("/compliance")
    public ResponseEntity<ComplianceReportResponse>
    getComplianceReport() {

        return ResponseEntity.ok(
                service.getComplianceReport()
        );
    }
}