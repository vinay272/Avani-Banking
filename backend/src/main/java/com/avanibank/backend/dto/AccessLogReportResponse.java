package com.avanibank.backend.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class AccessLogReportResponse {

    private long totalAccessLogs;

    private long successfulAccesses;

    private long failedAccesses;

    private long uniqueIpAddresses;

    private Map<String, Long> requestMethodSummary;

    private Map<String, Long> requestPathSummary;

    private Map<String, Long> statusSummary;

    private List<Map<String, Object>> accessLogs;
}