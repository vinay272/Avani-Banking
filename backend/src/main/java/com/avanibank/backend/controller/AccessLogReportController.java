package com.avanibank.backend.controller;

import com.avanibank.backend.dto.AccessLogReportResponse;
import com.avanibank.backend.service.AccessLogReportService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/compliance")
@CrossOrigin(origins = "http://localhost:5173")
public class AccessLogReportController {

    private final AccessLogReportService accessLogReportService;

    public AccessLogReportController(
            AccessLogReportService accessLogReportService) {

        this.accessLogReportService =
                accessLogReportService;
    }

    // =====================================================
    // ACCESS LOG REPORT
    // =====================================================

    @GetMapping("/access-logs")
    public ResponseEntity<AccessLogReportResponse>
    getAccessLogReport() {

        return ResponseEntity.ok(
                accessLogReportService.getReport()
        );
    }
}