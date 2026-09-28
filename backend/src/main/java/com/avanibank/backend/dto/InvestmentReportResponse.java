package com.avanibank.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvestmentReportResponse {

    private long totalInvestments;

    private double totalInvestedAmount;

    private double totalCurrentValue;

    private double totalProfitLoss;

    private long fixedDeposits;

    private long sips;

    private long bonds;

    private long goldInvestments;

    private Map<String, Long> investmentTypeSummary;

    private Map<String, Long> investmentStatusSummary;

    private List<Map<String, Object>> investments;
}