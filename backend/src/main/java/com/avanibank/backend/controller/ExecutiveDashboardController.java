package com.avanibank.backend.controller;

import com.avanibank.backend.dto.ExecutiveDashboardResponse;
import com.avanibank.backend.service.ExecutiveDashboardService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class ExecutiveDashboardController {

    private final ExecutiveDashboardService executiveDashboardService;

    public ExecutiveDashboardController(
            ExecutiveDashboardService executiveDashboardService) {

        this.executiveDashboardService =
                executiveDashboardService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ExecutiveDashboardResponse>
    getDashboard() {

        return ResponseEntity.ok(
                executiveDashboardService
                        .getDashboardMetrics()
        );
    }
}