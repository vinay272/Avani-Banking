package com.avanibank.backend.controller;

import com.avanibank.backend.dto.DataRetentionDryRunRequest;
import com.avanibank.backend.dto.DataRetentionPolicyRequest;
import com.avanibank.backend.entity.DataRetentionPolicy;
import com.avanibank.backend.service.DataRetentionPolicyService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/compliance/retention")
@CrossOrigin(origins = "http://localhost:5173")
public class DataRetentionPolicyController {

    private final DataRetentionPolicyService
            retentionPolicyService;

    public DataRetentionPolicyController(
            DataRetentionPolicyService retentionPolicyService) {

        this.retentionPolicyService =
                retentionPolicyService;
    }

    // =====================================================
    // CREATE POLICY
    // =====================================================

    @PostMapping("/policies")
    public ResponseEntity<DataRetentionPolicy>
    createPolicy(
            @Valid
            @RequestBody
            DataRetentionPolicyRequest request) {

        return ResponseEntity.ok(
                retentionPolicyService
                        .createPolicy(request)
        );
    }

    // =====================================================
    // GET POLICIES
    // =====================================================

    @GetMapping("/policies")
    public ResponseEntity<List<DataRetentionPolicy>>
    getPolicies() {

        return ResponseEntity.ok(
                retentionPolicyService
                        .getAllPolicies()
        );
    }

    // =====================================================
    // UPDATE POLICY
    // =====================================================

    @PutMapping("/policies/{id}")
    public ResponseEntity<DataRetentionPolicy>
    updatePolicy(
            @PathVariable Long id,
            @Valid
            @RequestBody
            DataRetentionPolicyRequest request) {

        return ResponseEntity.ok(
                retentionPolicyService
                        .updatePolicy(id, request)
        );
    }

    // =====================================================
    // DRY RUN
    // =====================================================

    @PostMapping("/dry-run")
    public ResponseEntity<Map<String, Object>>
    dryRun(
            @Valid
            @RequestBody
            DataRetentionDryRunRequest request) {

        return ResponseEntity.ok(
                retentionPolicyService
                        .dryRun(request)
        );
    }
}