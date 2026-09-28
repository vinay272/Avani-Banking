package com.avanibank.backend.controller;

import com.avanibank.backend.dto.KycComplianceReportResponse;
import com.avanibank.backend.service.KycComplianceReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/compliance")
@CrossOrigin(origins = "http://localhost:5173")
public class KycComplianceReportController {

    private final KycComplianceReportService
            kycComplianceReportService;

    public KycComplianceReportController(
            KycComplianceReportService
                    kycComplianceReportService) {

        this.kycComplianceReportService =
                kycComplianceReportService;
    }

    // =====================================================
    // KYC COMPLIANCE REPORT
    // =====================================================

    @GetMapping("/kyc")
    public ResponseEntity<KycComplianceReportResponse>
    getKycReport() {

        return ResponseEntity.ok(
                kycComplianceReportService.getReport()
        );
    }
}