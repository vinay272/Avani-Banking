package com.avanibank.backend.repository;

import com.avanibank.backend.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository
        extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByModuleOrderByCreatedAtDesc(String module);

    List<AuditLog> findByActionOrderByCreatedAtDesc(String action);

    List<AuditLog> findByActorEmailOrderByCreatedAtDesc(String actorEmail);

    List<AuditLog> findByStatusOrderByCreatedAtDesc(String status);
}