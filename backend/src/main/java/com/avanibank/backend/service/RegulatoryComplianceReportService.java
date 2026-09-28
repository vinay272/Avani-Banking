package com.avanibank.backend.service;

import com.avanibank.backend.dto.RegulatoryComplianceReportResponse;
import com.avanibank.backend.entity.AuditLog;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.FraudAlert;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.repository.AuditLogRepository;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.FraudAlertRepository;
import com.avanibank.backend.repository.LoginActivityRepository;
import com.avanibank.backend.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RegulatoryComplianceReportService {

    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;
    private final FraudAlertRepository fraudAlertRepository;
    private final AuditLogRepository auditLogRepository;
    private final LoginActivityRepository loginActivityRepository;

    public RegulatoryComplianceReportService(
            CustomerRepository customerRepository,
            TransactionRepository transactionRepository,
            FraudAlertRepository fraudAlertRepository,
            AuditLogRepository auditLogRepository,
            LoginActivityRepository loginActivityRepository) {

        this.customerRepository = customerRepository;
        this.transactionRepository = transactionRepository;
        this.fraudAlertRepository = fraudAlertRepository;
        this.auditLogRepository = auditLogRepository;
        this.loginActivityRepository = loginActivityRepository;
    }

    // =====================================================
    // REGULATORY COMPLIANCE REPORT
    // =====================================================

    public RegulatoryComplianceReportResponse getReport() {

        List<Customer> customers =
                customerRepository.findAll();

        List<Transaction> transactions =
                transactionRepository.findAll();

        List<FraudAlert> fraudAlerts =
                fraudAlertRepository.findAll();

        List<AuditLog> auditLogs =
                auditLogRepository.findAll();

        // =================================================
        // KYC
        // =================================================

        long totalCustomers = customers.size();

        long verifiedKycCustomers =
                customers.stream()
                        .filter(customer ->
                                "VERIFIED".equalsIgnoreCase(
                                        customer.getKycStatus()))
                        .count();

        long pendingKycCustomers =
                customers.stream()
                        .filter(customer ->
                                "PENDING".equalsIgnoreCase(
                                        customer.getKycStatus()))
                        .count();

        long rejectedKycCustomers =
                customers.stream()
                        .filter(customer ->
                                "REJECTED".equalsIgnoreCase(
                                        customer.getKycStatus()))
                        .count();

        double kycComplianceRate = 0.0;

        if (totalCustomers > 0) {

            kycComplianceRate =
                    (verifiedKycCustomers * 100.0)
                            / totalCustomers;
        }

        // =================================================
        // TRANSACTIONS
        // =================================================

        long totalTransactions =
                transactions.size();

        long successfulTransactions =
                transactions.stream()
                        .filter(transaction ->
                                "SUCCESS".equalsIgnoreCase(
                                        transaction.getStatus())
                                ||
                                "COMPLETED".equalsIgnoreCase(
                                        transaction.getStatus()))
                        .count();

        long failedTransactions =
                transactions.stream()
                        .filter(transaction ->
                                "FAILED".equalsIgnoreCase(
                                        transaction.getStatus()))
                        .count();

        double totalTransactionAmount =
                transactions.stream()
                        .filter(transaction ->
                                transaction.getAmount() != null)
                        .mapToDouble(Transaction::getAmount)
                        .sum();

        // =================================================
        // FRAUD / RISK
        // =================================================

        long totalFraudCases =
                fraudAlerts.size();

        long openFraudCases =
                fraudAlerts.stream()
                        .filter(alert ->
                                "OPEN".equalsIgnoreCase(
                                        alert.getStatus()))
                        .count();

        long resolvedFraudCases =
                fraudAlerts.stream()
                        .filter(alert ->
                                "RESOLVED".equalsIgnoreCase(
                                        alert.getStatus()))
                        .count();

        long highRiskCases =
                fraudAlerts.stream()
                        .filter(alert ->
                                "HIGH".equalsIgnoreCase(
                                        alert.getRiskLevel()))
                        .count();

        long criticalRiskCases =
                fraudAlerts.stream()
                        .filter(alert ->
                                "CRITICAL".equalsIgnoreCase(
                                        alert.getRiskLevel()))
                        .count();

        // =================================================
        // AUDIT LOGS
        // =================================================

        long totalAuditLogs =
                auditLogs.size();

        long successfulAuditActions =
                auditLogs.stream()
                        .filter(log ->
                                "SUCCESS".equalsIgnoreCase(
                                        log.getStatus()))
                        .count();

        long failedAuditActions =
                auditLogs.stream()
                        .filter(log ->
                                "FAILED".equalsIgnoreCase(
                                        log.getStatus()))
                        .count();

        // =================================================
        // LOGIN / ACCESS
        // =================================================

        long totalLoginActivities =
                loginActivityRepository.count();

        // =================================================
        // RESPONSE
        // =================================================

        return new RegulatoryComplianceReportResponse(

                totalCustomers,

                verifiedKycCustomers,

                pendingKycCustomers,

                rejectedKycCustomers,

                round(kycComplianceRate),

                totalTransactions,

                successfulTransactions,

                failedTransactions,

                round(totalTransactionAmount),

                totalFraudCases,

                openFraudCases,

                resolvedFraudCases,

                highRiskCases,

                criticalRiskCases,

                totalAuditLogs,

                successfulAuditActions,

                failedAuditActions,

                totalLoginActivities
        );
    }

    // =====================================================
    // ROUNDING
    // =====================================================

    private double round(double value) {

        return Math.round(value * 100.0) / 100.0;
    }
}