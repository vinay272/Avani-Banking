package com.avanibank.backend.controller;

import com.avanibank.backend.dto.AuditLogRequest;
import com.avanibank.backend.entity.AuditLog;
import com.avanibank.backend.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/audit")
@CrossOrigin(origins = "http://localhost:5173")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(
            AuditLogService auditLogService) {

        this.auditLogService = auditLogService;
    }

    // =====================================================
    // CREATE AUDIT LOG
    // =====================================================

    @PostMapping("/logs")
    public ResponseEntity<AuditLog> createAuditLog(
            @RequestBody AuditLogRequest request) {

        return ResponseEntity.ok(
                auditLogService.createAuditLog(request)
        );
    }

    // =====================================================
    // GET ALL AUDIT LOGS
    // =====================================================

    @GetMapping("/logs")
    public ResponseEntity<List<AuditLog>> getAllAuditLogs() {

        return ResponseEntity.ok(
                auditLogService.getAllAuditLogs()
        );
    }

    // =====================================================
    // GET BY MODULE
    // =====================================================

    @GetMapping("/logs/module/{module}")
    public ResponseEntity<List<AuditLog>> getByModule(
            @PathVariable String module) {

        return ResponseEntity.ok(
                auditLogService.getByModule(module)
        );
    }

    // =====================================================
    // GET BY ACTION
    // =====================================================

    @GetMapping("/logs/action/{action}")
    public ResponseEntity<List<AuditLog>> getByAction(
            @PathVariable String action) {

        return ResponseEntity.ok(
                auditLogService.getByAction(action)
        );
    }

    // =====================================================
    // GET BY ACTOR
    // =====================================================

    @GetMapping("/logs/actor/{actorEmail}")
    public ResponseEntity<List<AuditLog>> getByActorEmail(
            @PathVariable String actorEmail) {

        return ResponseEntity.ok(
                auditLogService.getByActorEmail(actorEmail)
        );
    }

    // =====================================================
    // GET BY STATUS
    // =====================================================

    @GetMapping("/logs/status/{status}")
    public ResponseEntity<List<AuditLog>> getByStatus(
            @PathVariable String status) {

        return ResponseEntity.ok(
                auditLogService.getByStatus(status)
        );
    }
}