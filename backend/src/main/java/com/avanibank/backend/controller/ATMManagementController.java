package com.avanibank.backend.controller;

import com.avanibank.backend.dto.ATMRequest;
import com.avanibank.backend.dto.ATMResponse;
import com.avanibank.backend.service.ATMManagementService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/atms")
@CrossOrigin(origins = "http://localhost:5173")
public class ATMManagementController {

    private final ATMManagementService atmManagementService;

    public ATMManagementController(
            ATMManagementService atmManagementService) {

        this.atmManagementService = atmManagementService;
    }

    @PostMapping
    public ResponseEntity<ATMResponse> createATM(
            @Valid @RequestBody ATMRequest request) {

        return ResponseEntity.ok(
                atmManagementService.createATM(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<ATMResponse>> getAllATMs() {

        return ResponseEntity.ok(
                atmManagementService.getAllATMs()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ATMResponse> getATMById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                atmManagementService.getATMById(id)
        );
    }

    @GetMapping("/branch/{branchCode}")
    public ResponseEntity<List<ATMResponse>> getATMsByBranch(
            @PathVariable String branchCode) {

        return ResponseEntity.ok(
                atmManagementService.getATMsByBranch(branchCode)
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ATMResponse>> getATMsByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                atmManagementService.getATMsByStatus(status)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ATMResponse> updateATM(
            @PathVariable Long id,
            @Valid @RequestBody ATMRequest request) {

        return ResponseEntity.ok(
                atmManagementService.updateATM(id, request)
        );
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ATMResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return ResponseEntity.ok(
                atmManagementService.updateStatus(id, status)
        );
    }

    @PutMapping("/{id}/maintenance")
    public ResponseEntity<ATMResponse> recordMaintenance(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                atmManagementService.recordMaintenance(id)
        );
    }
}