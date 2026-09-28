package com.avanibank.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExecutiveDashboardResponse {

    private long totalCustomers;

    private double totalDeposits;

    private double totalLoans;

    private long dailyTransactions;

    private double loanRecoveryRate;

    private long fraudCases;

    private long activeCards;

    private double investmentPortfolio;

    private double revenue;

    private List<Map<String, Object>> branchPerformance;
}