package com.avanibank.backend.service;

import com.avanibank.backend.dto.LoanReportResponse;
import com.avanibank.backend.entity.Loan;
import com.avanibank.backend.repository.LoanRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class LoanReportService {

    private final LoanRepository loanRepository;

    public LoanReportService(
            LoanRepository loanRepository) {

        this.loanRepository = loanRepository;
    }

    // =====================================================
    // LOAN REPORT
    // =====================================================

    public LoanReportResponse getLoanReport() {

        List<Loan> loans =
                loanRepository.findAll();

        long approvedLoans = 0;
        long pendingLoans = 0;
        long rejectedLoans = 0;
        long foreclosedLoans = 0;

        double totalRequestedAmount = 0.0;
        double totalApprovedAmount = 0.0;
        double totalDisbursedAmount = 0.0;

        Map<String, Long> loanTypeSummary =
                new LinkedHashMap<>();

        Map<String, Long> loanStatusSummary =
                new LinkedHashMap<>();

        List<Map<String, Object>> loanList =
                new ArrayList<>();

        for (Loan loan : loans) {

            // =================================================
            // AMOUNTS
            // =================================================

            if (loan.getRequestedAmount() != null) {

                totalRequestedAmount +=
                        loan.getRequestedAmount();
            }

            if (loan.getApprovedAmount() != null) {

                totalApprovedAmount +=
                        loan.getApprovedAmount();
            }

            if (loan.getDisbursedAmount() != null) {

                totalDisbursedAmount +=
                        loan.getDisbursedAmount();
            }

            // =================================================
            // STATUS
            // =================================================

            String status = loan.getStatus();

            if (status != null
                    && !status.isBlank()) {

                status =
                        status.trim().toUpperCase();

                loanStatusSummary.put(
                        status,
                        loanStatusSummary.getOrDefault(
                                status,
                                0L
                        ) + 1
                );

                if ("APPROVED".equals(status)
                        || "DISBURSED".equals(status)) {

                    approvedLoans++;

                } else if ("REJECTED".equals(status)) {

                    rejectedLoans++;

                } else if ("FORECLOSED".equals(status)) {

                    foreclosedLoans++;

                } else if (
                        "PENDING".equals(status)
                        || "UNDER_REVIEW".equals(status)
                        || "ELIGIBLE".equals(status)
                ) {

                    pendingLoans++;
                }
            }

            // =================================================
            // LOAN TYPE
            // =================================================

            String loanType =
                    loan.getLoanType();

            if (loanType != null
                    && !loanType.isBlank()) {

                loanType =
                        loanType.trim().toUpperCase();

                loanTypeSummary.put(
                        loanType,
                        loanTypeSummary.getOrDefault(
                                loanType,
                                0L
                        ) + 1
                );
            }

            // =================================================
            // SAFE LOAN DETAILS
            // =================================================

            Map<String, Object> loanData =
                    new LinkedHashMap<>();

            loanData.put(
                    "id",
                    loan.getId()
            );

            loanData.put(
                    "loanType",
                    loan.getLoanType()
            );

            loanData.put(
                    "requestedAmount",
                    loan.getRequestedAmount()
            );

            loanData.put(
                    "approvedAmount",
                    loan.getApprovedAmount()
            );

            loanData.put(
                    "disbursedAmount",
                    loan.getDisbursedAmount()
            );

            loanData.put(
                    "interestRate",
                    loan.getInterestRate()
            );

            loanData.put(
                    "tenureMonths",
                    loan.getTenureMonths()
            );

            loanData.put(
                    "emiAmount",
                    loan.getEmiAmount()
            );

            loanData.put(
                    "status",
                    loan.getStatus()
            );

            loanData.put(
                    "applicationDate",
                    loan.getApplicationDate()
            );

            loanData.put(
                    "disbursementDate",
                    loan.getDisbursementDate()
            );

            loanData.put(
                    "foreclosureDate",
                    loan.getForeclosureDate()
            );

            loanData.put(
                    "overdueDays",
                    loan.getOverdueDays()
            );

            loanData.put(
                    "customerId",
                    loan.getCustomer() != null
                            ? loan.getCustomer().getId()
                            : null
            );

            loanData.put(
                    "customerName",
                    loan.getCustomer() != null
                            ? loan.getCustomer().getFullName()
                            : null
            );

            loanList.add(loanData);
        }

        return new LoanReportResponse(
                loans.size(),
                approvedLoans,
                pendingLoans,
                rejectedLoans,
                foreclosedLoans,
                totalRequestedAmount,
                totalApprovedAmount,
                totalDisbursedAmount,
                loanTypeSummary,
                loanStatusSummary,
                loanList
        );
    }
}
