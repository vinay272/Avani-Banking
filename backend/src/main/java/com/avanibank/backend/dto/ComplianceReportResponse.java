package com.avanibank.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplianceReportResponse {

    // =========================
    // KYC COMPLIANCE
    // =========================

    private long totalCustomers;

    private long verifiedKycCustomers;

    private long pendingKycCustomers;

    private long rejectedKycCustomers;

    private double kycComplianceRate;


    // =========================
    // TRANSACTION MONITORING
    // =========================

    private long totalTransactions;

    private long successfulTransactions;

    private long failedTransactions;

    private double totalTransactionAmount;


    // =========================
    // AML / FRAUD MONITORING
    // =========================

    private long totalFraudCases;

    private long openFraudCases;

    private long resolvedFraudCases;

    private long highRiskCases;

    private long criticalRiskCases;

    private long moneyLaunderingCases;

    private long suspiciousTransactionCases;


    // =========================
    // ACCESS / LOGIN ACTIVITY
    // =========================

    private long totalLoginActivities;


    // =========================
    // SUMMARIES
    // =========================

    private Map<String, Long> kycStatusSummary;

    private Map<String, Long> transactionStatusSummary;

    private Map<String, Long> fraudRiskSummary;

    private Map<String, Long> fraudTypeSummary;


    // =========================
    // DETAILS
    // =========================

    private List<Map<String, Object>> complianceIssues;
}