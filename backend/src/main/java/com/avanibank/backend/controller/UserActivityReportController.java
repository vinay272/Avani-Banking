package com.avanibank.backend.controller;

import com.avanibank.backend.dto.UserActivityReportResponse;
import com.avanibank.backend.service.UserActivityReportService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/compliance")
@CrossOrigin(origins = "http://localhost:5173")
public class UserActivityReportController {

    private final UserActivityReportService
            userActivityReportService;

    public UserActivityReportController(
            UserActivityReportService userActivityReportService) {

        this.userActivityReportService =
                userActivityReportService;
    }

    // =====================================================
    // USER ACTIVITY REPORT
    // =====================================================

    @GetMapping("/user-activity")
    public ResponseEntity<UserActivityReportResponse>
    getUserActivityReport() {

        return ResponseEntity.ok(
                userActivityReportService.getReport()
        );
    }
}