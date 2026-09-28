package com.avanibank.backend.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class TransactionMonitoringReportResponse {

    private long totalTransactions;

    private long successfulTransactions;

    private long failedTransactions;

    private double totalTransactionAmount;

    private long highValueTransactions;

    private long fraudLinkedTransactions;

    private Map<String, Long> transactionTypeSummary;

    private Map<String, Long> transactionStatusSummary;

    private List<Map<String, Object>> transactionRecords;
}