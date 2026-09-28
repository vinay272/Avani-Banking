package com.avanibank.backend.controller;

import com.avanibank.backend.dto.BranchAnalyticsResponse;
import com.avanibank.backend.service.BranchAnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/branch-analytics")
@CrossOrigin(origins = "http://localhost:5173")
public class BranchAnalyticsController {

    private final BranchAnalyticsService branchAnalyticsService;

    public BranchAnalyticsController(
            BranchAnalyticsService branchAnalyticsService) {
        this.branchAnalyticsService = branchAnalyticsService;
    }

    @GetMapping("/{branchCode}")
    public ResponseEntity<BranchAnalyticsResponse> getBranchAnalytics(
            @PathVariable String branchCode) {

        return ResponseEntity.ok(
                branchAnalyticsService.getBranchAnalytics(branchCode)
        );
    }
}