package com.avanibank.backend.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class UserActivityReportResponse {

    private long totalLoginActivities;

    private long uniqueCustomers;

    private long uniqueIpAddresses;

    private long unusualLocationActivities;

    private Map<String, Long> locationSummary;

    private List<Map<String, Object>> activities;
}