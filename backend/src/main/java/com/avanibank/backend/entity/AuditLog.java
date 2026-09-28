package com.avanibank.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Who performed the action
    @Column(name = "actor_type", length = 30)
    private String actorType;

    @Column(name = "actor_id")
    private Long actorId;

    @Column(name = "actor_email", length = 150)
    private String actorEmail;

    // What action was performed
    @Column(nullable = false, length = 100)
    private String action;

    // Which module generated the action
    @Column(length = 100)
    private String module;

    // Which entity was affected
    @Column(name = "entity_type", length = 100)
    private String entityType;

    @Column(name = "entity_id")
    private Long entityId;

    // Human readable description
    @Column(columnDefinition = "TEXT")
    private String description;

    // Request information
    @Column(name = "ip_address", length = 100)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "request_method", length = 20)
    private String requestMethod;

    @Column(name = "request_path", length = 255)
    private String requestPath;

    // SUCCESS / FAILED
    @Column(length = 30)
    private String status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (status == null || status.isBlank()) {
            status = "SUCCESS";
        }
    }
}