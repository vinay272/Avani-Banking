package com.avanibank.backend.service;

import com.avanibank.backend.dto.ComplianceReportResponse;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.FraudAlert;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.FraudAlertRepository;
import com.avanibank.backend.repository.LoginActivityRepository;
import com.avanibank.backend.repository.TransactionRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExecutiveComplianceReportService {

    private final CustomerRepository customerRepository;

    private final TransactionRepository transactionRepository;

    private final FraudAlertRepository fraudAlertRepository;

    private final LoginActivityRepository loginActivityRepository;


    public ExecutiveComplianceReportService(
            CustomerRepository customerRepository,
            TransactionRepository transactionRepository,
            FraudAlertRepository fraudAlertRepository,
            LoginActivityRepository loginActivityRepository) {

        this.customerRepository = customerRepository;

        this.transactionRepository = transactionRepository;

        this.fraudAlertRepository = fraudAlertRepository;

        this.loginActivityRepository = loginActivityRepository;
    }


    public ComplianceReportResponse
    getComplianceReport() {

        // =====================================================
        // LOAD EXISTING DATA
        // =====================================================

        List<Customer> customers =
                customerRepository.findAll();

        List<Transaction> transactions =
                transactionRepository.findAll();

        List<FraudAlert> fraudAlerts =
                fraudAlertRepository.findAll();


        // =====================================================
        // KYC COMPLIANCE
        // =====================================================

        long totalCustomers =
                customers.size();

        long verifiedKycCustomers = 0;

        long pendingKycCustomers = 0;

        long rejectedKycCustomers = 0;


        Map<String, Long> kycStatusSummary =
                new LinkedHashMap<>();


        for (Customer customer : customers) {

            String status =
                    customer.getKycStatus();

            if (status == null ||
                    status.isBlank()) {

                status = "UNKNOWN";
            }

            status =
                    status.toUpperCase();


            kycStatusSummary.put(
                    status,
                    kycStatusSummary.getOrDefault(
                            status,
                            0L
                    ) + 1
            );


            if ("VERIFIED".equals(status)) {

                verifiedKycCustomers++;

            } else if ("PENDING".equals(status)) {

                pendingKycCustomers++;

            } else if ("REJECTED".equals(status)) {

                rejectedKycCustomers++;
            }
        }


        double kycComplianceRate = 0.0;

        if (totalCustomers > 0) {

            kycComplianceRate =
                    (verifiedKycCustomers * 100.0)
                            / totalCustomers;
        }


        // =====================================================
        // TRANSACTION MONITORING
        // =====================================================

        long totalTransactions =
                transactions.size();

        long successfulTransactions = 0;

        long failedTransactions = 0;

        double totalTransactionAmount = 0.0;


        Map<String, Long> transactionStatusSummary =
                new LinkedHashMap<>();


        for (Transaction transaction : transactions) {

            Double amount =
                    transaction.getAmount();

            if (amount != null) {

                totalTransactionAmount +=
                        amount;
            }


            String status =
                    transaction.getStatus();

            if (status == null ||
                    status.isBlank()) {

                status = "UNKNOWN";
            }

            status =
                    status.toUpperCase();


            transactionStatusSummary.put(
                    status,
                    transactionStatusSummary.getOrDefault(
                            status,
                            0L
                    ) + 1
            );


            if ("SUCCESS".equals(status)) {

                successfulTransactions++;

            } else if ("FAILED".equals(status)) {

                failedTransactions++;
            }
        }


        // =====================================================
        // FRAUD / AML MONITORING
        // =====================================================

        long totalFraudCases =
                fraudAlerts.size();

        long openFraudCases = 0;

        long resolvedFraudCases = 0;

        long highRiskCases = 0;

        long criticalRiskCases = 0;

        long moneyLaunderingCases = 0;

        long suspiciousTransactionCases = 0;


        Map<String, Long> fraudRiskSummary =
                new LinkedHashMap<>();

        Map<String, Long> fraudTypeSummary =
                new LinkedHashMap<>();


        List<Map<String, Object>> complianceIssues =
                new ArrayList<>();


        for (FraudAlert alert : fraudAlerts) {

            String riskLevel =
                    alert.getRiskLevel();

            if (riskLevel == null ||
                    riskLevel.isBlank()) {

                riskLevel = "UNKNOWN";
            }

            riskLevel =
                    riskLevel.toUpperCase();


            fraudRiskSummary.put(
                    riskLevel,
                    fraudRiskSummary.getOrDefault(
                            riskLevel,
                            0L
                    ) + 1
            );


            if ("HIGH".equals(riskLevel)) {

                highRiskCases++;

            } else if ("CRITICAL".equals(riskLevel)) {

                criticalRiskCases++;
            }


            String alertType =
                    alert.getAlertType();

            if (alertType == null ||
                    alertType.isBlank()) {

                alertType = "UNKNOWN";
            }

            alertType =
                    alertType.toUpperCase();


            fraudTypeSummary.put(
                    alertType,
                    fraudTypeSummary.getOrDefault(
                            alertType,
                            0L
                    ) + 1
            );


            if ("MONEY_LAUNDERING".equals(alertType)) {

                moneyLaunderingCases++;
            }


            if ("SUSPICIOUS_TRANSACTION".equals(alertType)
                    || "TRANSACTION_RISK".equals(alertType)) {

                suspiciousTransactionCases++;
            }


            String status =
                    alert.getStatus();

            if (status == null ||
                    status.isBlank()) {

                status = "UNKNOWN";
            }

            status =
                    status.toUpperCase();


            if ("OPEN".equals(status)) {

                openFraudCases++;

            } else if ("RESOLVED".equals(status)) {

                resolvedFraudCases++;
            }


            // =================================================
            // COMPLIANCE ISSUE DETAILS
            // =================================================

            if (!"LOW".equals(riskLevel)) {

                Map<String, Object> issue =
                        new LinkedHashMap<>();

                issue.put(
                        "alertId",
                        alert.getId()
                );

                issue.put(
                        "customerId",
                        alert.getCustomer() != null
                                ? alert.getCustomer().getId()
                                : null
                );

                issue.put(
                        "customerName",
                        alert.getCustomer() != null
                                ? alert.getCustomer().getFullName()
                                : null
                );

                issue.put(
                        "alertType",
                        alertType
                );

                issue.put(
                        "riskLevel",
                        riskLevel
                );

                issue.put(
                        "riskScore",
                        alert.getRiskScore()
                );

                issue.put(
                        "transactionId",
                        alert.getTransactionId()
                );

                issue.put(
                        "transactionType",
                        alert.getTransactionType()
                );

                issue.put(
                        "status",
                        status
                );

                issue.put(
                        "description",
                        alert.getDescription()
                );

                issue.put(
                        "detectedAt",
                        alert.getDetectedAt()
                );

                complianceIssues.add(issue);
            }
        }


        // =====================================================
        // LOGIN / ACCESS ACTIVITY
        // =====================================================

        long totalLoginActivities =
                loginActivityRepository.count();


        // =====================================================
        // RETURN REPORT
        // =====================================================

        return new ComplianceReportResponse(

                // KYC
                totalCustomers,
                verifiedKycCustomers,
                pendingKycCustomers,
                rejectedKycCustomers,
                kycComplianceRate,

                // Transactions
                totalTransactions,
                successfulTransactions,
                failedTransactions,
                totalTransactionAmount,

                // Fraud / AML
                totalFraudCases,
                openFraudCases,
                resolvedFraudCases,
                highRiskCases,
                criticalRiskCases,
                moneyLaunderingCases,
                suspiciousTransactionCases,

                // Access
                totalLoginActivities,

                // Summaries
                kycStatusSummary,
                transactionStatusSummary,
                fraudRiskSummary,
                fraudTypeSummary,

                // Issues
                complianceIssues
        );
    }
}