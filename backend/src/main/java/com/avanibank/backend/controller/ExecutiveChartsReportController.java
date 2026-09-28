package com.avanibank.backend.controller;

import com.avanibank.backend.dto.ExecutiveChartsResponse;
import com.avanibank.backend.service.ExecutiveChartsReportService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class ExecutiveChartsReportController {

    private final ExecutiveChartsReportService service;

    public ExecutiveChartsReportController(
            ExecutiveChartsReportService service) {

        this.service = service;
    }

    @GetMapping("/charts")
    public ResponseEntity<ExecutiveChartsResponse>
    getCharts() {

        return ResponseEntity.ok(
                service.getCharts()
        );
    }
}