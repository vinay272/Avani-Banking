package com.avanibank.backend.controller;

import com.avanibank.backend.dto.VaultRequest;
import com.avanibank.backend.dto.VaultResponse;
import com.avanibank.backend.service.VaultManagementService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/vaults")
@CrossOrigin(origins = "http://localhost:5173")
public class VaultManagementController {

    private final VaultManagementService vaultManagementService;

    public VaultManagementController(
            VaultManagementService vaultManagementService
    ) {
        this.vaultManagementService = vaultManagementService;
    }

    // =========================
    // CREATE VAULT
    // =========================

    @PostMapping
    public ResponseEntity<VaultResponse> createVault(
            @Valid @RequestBody VaultRequest request
    ) {

        return ResponseEntity.ok(
                vaultManagementService.createVault(request)
        );
    }

    // =========================
    // GET ALL VAULTS
    // =========================

    @GetMapping
    public ResponseEntity<List<VaultResponse>> getAllVaults() {

        return ResponseEntity.ok(
                vaultManagementService.getAllVaults()
        );
    }

    // =========================
    // GET VAULT BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<VaultResponse> getVaultById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                vaultManagementService.getVaultById(id)
        );
    }

    // =========================
    // GET VAULTS BY BRANCH
    // =========================

    @GetMapping("/branch/{branchCode}")
    public ResponseEntity<List<VaultResponse>> getVaultsByBranch(
            @PathVariable String branchCode
    ) {

        return ResponseEntity.ok(
                vaultManagementService.getVaultsByBranch(branchCode)
        );
    }

    // =========================
    // GET VAULTS BY STATUS
    // =========================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<VaultResponse>> getVaultsByStatus(
            @PathVariable String status
    ) {

        return ResponseEntity.ok(
                vaultManagementService.getVaultsByStatus(status)
        );
    }

    // =========================
    // UPDATE VAULT
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<VaultResponse> updateVault(
            @PathVariable Long id,
            @Valid @RequestBody VaultRequest request
    ) {

        return ResponseEntity.ok(
                vaultManagementService.updateVault(id, request)
        );
    }

    // =========================
    // UPDATE STATUS
    // =========================

    @PutMapping("/{id}/status")
    public ResponseEntity<VaultResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {

        return ResponseEntity.ok(
                vaultManagementService.updateStatus(id, status)
        );
    }

    // =========================
    // RECORD AUDIT
    // =========================

    @PutMapping("/{id}/audit")
    public ResponseEntity<VaultResponse> recordAudit(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                vaultManagementService.recordAudit(id)
        );
    }
}