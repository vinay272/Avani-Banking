package com.avanibank.backend.service;

import com.avanibank.backend.dto.AccessLogReportResponse;
import com.avanibank.backend.entity.AuditLog;
import com.avanibank.backend.repository.AuditLogRepository;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AccessLogReportService {

    private final AuditLogRepository auditLogRepository;

    public AccessLogReportService(
            AuditLogRepository auditLogRepository) {

        this.auditLogRepository = auditLogRepository;
    }

    // =====================================================
    // ACCESS LOG REPORT
    // =====================================================

    public AccessLogReportResponse getReport() {

        List<AuditLog> logs =
                auditLogRepository.findAll();

        long totalAccessLogs =
                logs.size();

        // =================================================
        // SUCCESSFUL ACCESS
        // =================================================

        long successfulAccesses =
                logs.stream()
                        .filter(log ->
                                "SUCCESS".equalsIgnoreCase(
                                        log.getStatus()))
                        .count();

        // =================================================
        // FAILED ACCESS
        // =================================================

        long failedAccesses =
                logs.stream()
                        .filter(log ->
                                "FAILED".equalsIgnoreCase(
                                        log.getStatus())
                                        || "FAILURE".equalsIgnoreCase(
                                                log.getStatus()))
                        .count();

        // =================================================
        // UNIQUE IP ADDRESSES
        // =================================================

        Set<String> uniqueIps =
                logs.stream()
                        .map(AuditLog::getIpAddress)
                        .filter(ip ->
                                ip != null
                                        && !ip.isBlank()
                                        && !"UNKNOWN".equalsIgnoreCase(ip))
                        .collect(Collectors.toSet());

        long uniqueIpAddresses =
                uniqueIps.size();

        // =================================================
        // REQUEST METHOD SUMMARY
        // =================================================

        Map<String, Long> requestMethodSummary =
                logs.stream()
                        .collect(Collectors.groupingBy(
                                log ->
                                        log.getRequestMethod() == null
                                                ? "UNKNOWN"
                                                : log.getRequestMethod(),
                                LinkedHashMap::new,
                                Collectors.counting()
                        ));

        // =================================================
        // REQUEST PATH SUMMARY
        // =================================================

        Map<String, Long> requestPathSummary =
                logs.stream()
                        .collect(Collectors.groupingBy(
                                log ->
                                        log.getRequestPath() == null
                                                ? "UNKNOWN"
                                                : log.getRequestPath(),
                                LinkedHashMap::new,
                                Collectors.counting()
                        ));

        // =================================================
        // STATUS SUMMARY
        // =================================================

        Map<String, Long> statusSummary =
                logs.stream()
                        .collect(Collectors.groupingBy(
                                log ->
                                        log.getStatus() == null
                                                ? "UNKNOWN"
                                                : log.getStatus(),
                                LinkedHashMap::new,
                                Collectors.counting()
                        ));

        // =================================================
        // ACCESS LOG RECORDS
        // =================================================

        List<Map<String, Object>> accessLogs =
                logs.stream()
                        .map(this::toSafeMap)
                        .toList();

        AccessLogReportResponse response =
                new AccessLogReportResponse();

        response.setTotalAccessLogs(
                totalAccessLogs);

        response.setSuccessfulAccesses(
                successfulAccesses);

        response.setFailedAccesses(
                failedAccesses);

        response.setUniqueIpAddresses(
                uniqueIpAddresses);

        response.setRequestMethodSummary(
                requestMethodSummary);

        response.setRequestPathSummary(
                requestPathSummary);

        response.setStatusSummary(
                statusSummary);

        response.setAccessLogs(
                accessLogs);

        return response;
    }

    // =====================================================
    // SAFE ACCESS LOG MAP
    // =====================================================

    private Map<String, Object> toSafeMap(
            AuditLog log) {

        Map<String, Object> map =
                new LinkedHashMap<>();

        map.put(
                "id",
                log.getId()
        );

        map.put(
                "actorType",
                log.getActorType()
        );

        map.put(
                "actorId",
                log.getActorId()
        );

        map.put(
                "actorEmail",
                log.getActorEmail()
        );

        map.put(
                "action",
                log.getAction()
        );

        map.put(
                "module",
                log.getModule()
        );

        map.put(
                "entityType",
                log.getEntityType()
        );

        map.put(
                "entityId",
                log.getEntityId()
        );

        map.put(
                "ipAddress",
                log.getIpAddress()
        );

        map.put(
                "userAgent",
                log.getUserAgent()
        );

        map.put(
                "requestMethod",
                log.getRequestMethod()
        );

        map.put(
                "requestPath",
                log.getRequestPath()
        );

        map.put(
                "status",
                log.getStatus()
        );

        map.put(
                "createdAt",
                log.getCreatedAt()
        );

        return map;
    }
}