package com.avanibank.backend.dto;

import lombok.Data;

@Data
public class AuditLogRequest {

    private String actorType;

    private Long actorId;

    private String actorEmail;

    private String action;

    private String module;

    private String entityType;

    private Long entityId;

    private String description;

    private String ipAddress;

    private String userAgent;

    private String requestMethod;

    private String requestPath;

    private String status;
}