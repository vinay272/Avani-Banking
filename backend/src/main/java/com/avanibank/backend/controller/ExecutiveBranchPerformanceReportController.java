package com.avanibank.backend.controller;

import com.avanibank.backend.dto.BranchPerformanceReportResponse;
import com.avanibank.backend.service.ExecutiveBranchPerformanceReportService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class ExecutiveBranchPerformanceReportController {

    private final ExecutiveBranchPerformanceReportService service;

    public ExecutiveBranchPerformanceReportController(
            ExecutiveBranchPerformanceReportService service) {

        this.service = service;
    }

    @GetMapping("/branches")
    public ResponseEntity<BranchPerformanceReportResponse>
    getBranchPerformanceReport() {

        return ResponseEntity.ok(
                service.getBranchPerformanceReport()
        );
    }
}