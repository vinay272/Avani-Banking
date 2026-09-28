package com.avanibank.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AmlReportResponse {

    private long totalAmlCases;

    private long openAmlCases;

    private long resolvedAmlCases;

    private long criticalAmlCases;

    private long highRiskAmlCases;

    private double totalSuspiciousAmount;

    private Map<String, Long> alertTypeSummary;

    private Map<String, Long> transactionTypeSummary;

    private List<Map<String, Object>> amlCases;
}