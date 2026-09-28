package com.avanibank.backend.controller;

import com.avanibank.backend.dto.RegulatoryComplianceReportResponse;
import com.avanibank.backend.service.RegulatoryComplianceReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/compliance")
@CrossOrigin(origins = "http://localhost:5173")
public class RegulatoryComplianceReportController {

    private final RegulatoryComplianceReportService
            regulatoryComplianceReportService;

    public RegulatoryComplianceReportController(
            RegulatoryComplianceReportService
                    regulatoryComplianceReportService) {

        this.regulatoryComplianceReportService =
                regulatoryComplianceReportService;
    }

    // =====================================================
    // RBI / REGULATORY COMPLIANCE REPORT
    // =====================================================

    @GetMapping("/regulatory")
    public ResponseEntity<RegulatoryComplianceReportResponse>
    getRegulatoryComplianceReport() {

        return ResponseEntity.ok(
                regulatoryComplianceReportService.getReport()
        );
    }
}