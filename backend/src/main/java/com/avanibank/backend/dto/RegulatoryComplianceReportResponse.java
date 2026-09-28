package com.avanibank.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegulatoryComplianceReportResponse {

    // =====================================================
    // KYC COMPLIANCE
    // =====================================================

    private long totalCustomers;

    private long verifiedKycCustomers;

    private long pendingKycCustomers;

    private long rejectedKycCustomers;

    private double kycComplianceRate;

    // =====================================================
    // TRANSACTION MONITORING
    // =====================================================

    private long totalTransactions;

    private long successfulTransactions;

    private long failedTransactions;

    private double totalTransactionAmount;

    // =====================================================
    // FRAUD / RISK
    // =====================================================

    private long totalFraudCases;

    private long openFraudCases;

    private long resolvedFraudCases;

    private long highRiskCases;

    private long criticalRiskCases;

    // =====================================================
    // AUDIT
    // =====================================================

    private long totalAuditLogs;

    private long successfulAuditActions;

    private long failedAuditActions;

    // =====================================================
    // ACCESS / LOGIN
    // =====================================================

    private long totalLoginActivities;
}