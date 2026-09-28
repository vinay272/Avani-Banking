package com.avanibank.backend.controller;

import com.avanibank.backend.dto.DailyClosingReportRequest;
import com.avanibank.backend.dto.DailyClosingReportResponse;
import com.avanibank.backend.service.DailyClosingReportManagementService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/daily-closing")
@CrossOrigin(origins = "http://localhost:5173")
public class DailyClosingReportManagementController {

    private final DailyClosingReportManagementService reportService;

    public DailyClosingReportManagementController(
            DailyClosingReportManagementService reportService
    ) {
        this.reportService = reportService;
    }

    // =========================
    // CREATE DAILY CLOSING REPORT
    // =========================

    @PostMapping
    public ResponseEntity<DailyClosingReportResponse> createReport(
            @Valid @RequestBody DailyClosingReportRequest request
    ) {

        return ResponseEntity.ok(
                reportService.createReport(request)
        );
    }

    // =========================
    // GET ALL REPORTS
    // =========================

    @GetMapping
    public ResponseEntity<List<DailyClosingReportResponse>> getAllReports() {

        return ResponseEntity.ok(
                reportService.getAllReports()
        );
    }

    // =========================
    // GET REPORT BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<DailyClosingReportResponse> getReportById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                reportService.getReportById(id)
        );
    }

    // =========================
    // GET REPORTS BY BRANCH
    // =========================

    @GetMapping("/branch/{branchCode}")
    public ResponseEntity<List<DailyClosingReportResponse>> getReportsByBranch(
            @PathVariable String branchCode
    ) {

        return ResponseEntity.ok(
                reportService.getReportsByBranch(branchCode)
        );
    }

    // =========================
    // GET REPORTS BY STATUS
    // =========================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<DailyClosingReportResponse>> getReportsByStatus(
            @PathVariable String status
    ) {

        return ResponseEntity.ok(
                reportService.getReportsByStatus(status)
        );
    }

    // =========================
    // GET REPORT BY BRANCH + DATE
    // =========================

    @GetMapping("/branch/{branchCode}/date/{closingDate}")
    public ResponseEntity<DailyClosingReportResponse>
    getReportByBranchAndDate(
            @PathVariable String branchCode,
            @PathVariable LocalDate closingDate
    ) {

        return ResponseEntity.ok(
                reportService.getReportByBranchAndDate(
                        branchCode,
                        closingDate
                )
        );
    }
}