package com.avanibank.backend.service;

import com.avanibank.backend.dto.TransactionMonitoringReportResponse;
import com.avanibank.backend.entity.FraudAlert;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.repository.FraudAlertRepository;
import com.avanibank.backend.repository.TransactionRepository;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class TransactionMonitoringService {

    private final TransactionRepository transactionRepository;
    private final FraudAlertRepository fraudAlertRepository;

    public TransactionMonitoringService(
            TransactionRepository transactionRepository,
            FraudAlertRepository fraudAlertRepository) {

        this.transactionRepository = transactionRepository;
        this.fraudAlertRepository = fraudAlertRepository;
    }

    // =====================================================
    // TRANSACTION MONITORING REPORT
    // =====================================================

    public TransactionMonitoringReportResponse getReport() {

        List<Transaction> transactions =
                transactionRepository.findAll();

        long totalTransactions =
                transactions.size();

        long successfulTransactions =
                transactions.stream()
                        .filter(transaction ->
                                "SUCCESS".equalsIgnoreCase(
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
        // HIGH VALUE TRANSACTIONS
        // =================================================
        // Existing fraud engine uses ₹1,00,000 as a
        // high transaction amount threshold.

        long highValueTransactions =
                transactions.stream()
                        .filter(transaction ->
                                transaction.getAmount() != null
                                        && transaction.getAmount() >= 100000.0)
                        .count();

        // =================================================
        // FRAUD LINKED TRANSACTIONS
        // =================================================

        List<FraudAlert> fraudAlerts =
                fraudAlertRepository.findAll();

        Set<Long> fraudTransactionIds =
                fraudAlerts.stream()
                        .map(FraudAlert::getTransactionId)
                        .filter(id -> id != null)
                        .collect(Collectors.toSet());

        long fraudLinkedTransactions =
                transactions.stream()
                        .filter(transaction ->
                                transaction.getId() != null
                                        && fraudTransactionIds.contains(
                                                transaction.getId()))
                        .count();

        // =================================================
        // TRANSACTION TYPE SUMMARY
        // =================================================

        Map<String, Long> transactionTypeSummary =
                transactions.stream()
                        .collect(Collectors.groupingBy(
                                transaction ->
                                        transaction.getTransactionType() == null
                                                ? "UNKNOWN"
                                                : transaction.getTransactionType(),
                                LinkedHashMap::new,
                                Collectors.counting()
                        ));

        // =================================================
        // TRANSACTION STATUS SUMMARY
        // =================================================

        Map<String, Long> transactionStatusSummary =
                transactions.stream()
                        .collect(Collectors.groupingBy(
                                transaction ->
                                        transaction.getStatus() == null
                                                ? "UNKNOWN"
                                                : transaction.getStatus(),
                                LinkedHashMap::new,
                                Collectors.counting()
                        ));

        // =================================================
        // TRANSACTION RECORDS
        // =================================================

        List<Map<String, Object>> transactionRecords =
                transactions.stream()
                        .map(this::toSafeMap)
                        .toList();

        TransactionMonitoringReportResponse response =
                new TransactionMonitoringReportResponse();

        response.setTotalTransactions(totalTransactions);
        response.setSuccessfulTransactions(successfulTransactions);
        response.setFailedTransactions(failedTransactions);
        response.setTotalTransactionAmount(
                round(totalTransactionAmount));
        response.setHighValueTransactions(highValueTransactions);
        response.setFraudLinkedTransactions(fraudLinkedTransactions);
        response.setTransactionTypeSummary(transactionTypeSummary);
        response.setTransactionStatusSummary(transactionStatusSummary);
        response.setTransactionRecords(transactionRecords);

        return response;
    }

    // =====================================================
    // SAFE TRANSACTION MAP
    // =====================================================

    private Map<String, Object> toSafeMap(
            Transaction transaction) {

        Map<String, Object> map =
                new LinkedHashMap<>();

        map.put("id", transaction.getId());

        map.put(
                "senderAccountNumber",
                transaction.getSenderAccountNumber()
        );

        map.put(
                "receiverAccountNumber",
                transaction.getReceiverAccountNumber()
        );

        map.put(
                "amount",
                transaction.getAmount()
        );

        map.put(
                "transactionType",
                transaction.getTransactionType()
        );

        map.put(
                "status",
                transaction.getStatus()
        );

        map.put(
                "transactionDate",
                transaction.getTransactionDate()
        );

        return map;
    }

    // =====================================================
    // ROUND
    // =====================================================

    private double round(double value) {

        return Math.round(value * 100.0) / 100.0;
    }
}