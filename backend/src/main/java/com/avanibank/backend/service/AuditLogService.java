package com.avanibank.backend.service;

import com.avanibank.backend.dto.AuditLogRequest;
import com.avanibank.backend.entity.AuditLog;
import com.avanibank.backend.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(
            AuditLogRepository auditLogRepository) {

        this.auditLogRepository = auditLogRepository;
    }

    // =====================================================
    // CREATE AUDIT LOG
    // =====================================================

    public AuditLog createAuditLog(AuditLogRequest request) {

        AuditLog auditLog = new AuditLog();

        auditLog.setActorType(request.getActorType());
        auditLog.setActorId(request.getActorId());
        auditLog.setActorEmail(request.getActorEmail());

        auditLog.setAction(request.getAction());
        auditLog.setModule(request.getModule());

        auditLog.setEntityType(request.getEntityType());
        auditLog.setEntityId(request.getEntityId());

        auditLog.setDescription(request.getDescription());

        auditLog.setIpAddress(request.getIpAddress());
        auditLog.setUserAgent(request.getUserAgent());

        auditLog.setRequestMethod(request.getRequestMethod());
        auditLog.setRequestPath(request.getRequestPath());

        auditLog.setStatus(
                request.getStatus() == null ||
                request.getStatus().isBlank()
                        ? "SUCCESS"
                        : request.getStatus()
        );

        return auditLogRepository.save(auditLog);
    }

    // =====================================================
    // GET ALL AUDIT LOGS
    // =====================================================

    public List<AuditLog> getAllAuditLogs() {

        return auditLogRepository
                .findAll()
                .stream()
                .sorted(
                        (a, b) ->
                                b.getCreatedAt()
                                        .compareTo(a.getCreatedAt())
                )
                .toList();
    }

    // =====================================================
    // GET BY MODULE
    // =====================================================

    public List<AuditLog> getByModule(String module) {

        return auditLogRepository
                .findByModuleOrderByCreatedAtDesc(module);
    }

    // =====================================================
    // GET BY ACTION
    // =====================================================

    public List<AuditLog> getByAction(String action) {

        return auditLogRepository
                .findByActionOrderByCreatedAtDesc(action);
    }

    // =====================================================
    // GET BY ACTOR
    // =====================================================

    public List<AuditLog> getByActorEmail(String actorEmail) {

        return auditLogRepository
                .findByActorEmailOrderByCreatedAtDesc(actorEmail);
    }

    // =====================================================
    // GET BY STATUS
    // =====================================================

    public List<AuditLog> getByStatus(String status) {

        return auditLogRepository
                .findByStatusOrderByCreatedAtDesc(status);
    }
}