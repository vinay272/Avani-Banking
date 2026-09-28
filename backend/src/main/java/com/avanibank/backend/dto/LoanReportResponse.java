package com.avanibank.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanReportResponse {

    private long totalLoans;

    private long approvedLoans;

    private long pendingLoans;

    private long rejectedLoans;

    private long foreclosedLoans;

    private double totalRequestedAmount;

    private double totalApprovedAmount;

    private double totalDisbursedAmount;

    private Map<String, Long> loanTypeSummary;

    private Map<String, Long> loanStatusSummary;

    private List<Map<String, Object>> loans;
}