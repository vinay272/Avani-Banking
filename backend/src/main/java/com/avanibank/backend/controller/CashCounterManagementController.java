package com.avanibank.backend.controller;

import com.avanibank.backend.dto.CashCounterRequest;
import com.avanibank.backend.dto.CashCounterResponse;
import com.avanibank.backend.service.CashCounterManagementService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/cash-counters")
@CrossOrigin(origins = "http://localhost:5173")
public class CashCounterManagementController {

    private final CashCounterManagementService cashCounterManagementService;

    public CashCounterManagementController(
            CashCounterManagementService cashCounterManagementService) {

        this.cashCounterManagementService = cashCounterManagementService;
    }

    @PostMapping
    public ResponseEntity<CashCounterResponse> createCounter(
            @Valid @RequestBody CashCounterRequest request) {

        return ResponseEntity.ok(
                cashCounterManagementService.createCounter(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<CashCounterResponse>> getAllCounters() {

        return ResponseEntity.ok(
                cashCounterManagementService.getAllCounters()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<CashCounterResponse> getCounterById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                cashCounterManagementService.getCounterById(id)
        );
    }

    @GetMapping("/branch/{branchCode}")
    public ResponseEntity<List<CashCounterResponse>> getCountersByBranch(
            @PathVariable String branchCode) {

        return ResponseEntity.ok(
                cashCounterManagementService
                        .getCountersByBranch(branchCode)
        );
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<CashCounterResponse>> getCountersByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                cashCounterManagementService
                        .getCountersByStatus(status)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<CashCounterResponse> updateCounter(
            @PathVariable Long id,
            @Valid @RequestBody CashCounterRequest request) {

        return ResponseEntity.ok(
                cashCounterManagementService
                        .updateCounter(id, request)
        );
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<CashCounterResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return ResponseEntity.ok(
                cashCounterManagementService
                        .updateStatus(id, status)
        );
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<CashCounterResponse> assignCashier(
            @PathVariable Long id,
            @RequestParam String employeeCode) {

        return ResponseEntity.ok(
                cashCounterManagementService
                        .assignCashier(id, employeeCode)
        );
    }
}