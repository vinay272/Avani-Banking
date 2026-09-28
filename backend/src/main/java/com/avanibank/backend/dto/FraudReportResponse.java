package com.avanibank.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FraudReportResponse {

    private long totalFraudCases;

    private long openCases;

    private long resolvedCases;

    private long criticalCases;

    private long highRiskCases;

    private long mediumRiskCases;

    private long lowRiskCases;

    private Map<String, Long> riskLevelSummary;

    private Map<String, Long> alertTypeSummary;

    private Map<String, Long> statusSummary;

    private Map<String, Long> transactionTypeSummary;

    private List<Map<String, Object>> fraudCases;
}