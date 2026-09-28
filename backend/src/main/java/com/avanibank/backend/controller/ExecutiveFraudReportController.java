package com.avanibank.backend.controller;

import com.avanibank.backend.dto.FraudReportResponse;
import com.avanibank.backend.service.ExecutiveFraudReportService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class ExecutiveFraudReportController {

    private final ExecutiveFraudReportService service;

    public ExecutiveFraudReportController(
            ExecutiveFraudReportService service) {

        this.service = service;
    }

    @GetMapping("/fraud")
    public ResponseEntity<FraudReportResponse>
    getFraudReport() {

        return ResponseEntity.ok(
                service.getFraudReport()
        );
    }
}