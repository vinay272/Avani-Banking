package com.avanibank.backend.service;

import com.avanibank.backend.dto.TransactionReportResponse;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.repository.TransactionRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionReportService {

    private final TransactionRepository transactionRepository;

    public TransactionReportService(
            TransactionRepository transactionRepository) {

        this.transactionRepository = transactionRepository;
    }

    // =====================================================
    // TRANSACTION REPORT
    // =====================================================

    public TransactionReportResponse getTransactionReport() {

        List<Transaction> transactions =
                transactionRepository.findAll();

        double totalAmount = 0.0;

        long successfulTransactions = 0;

        long failedTransactions = 0;

        for (Transaction transaction : transactions) {

            if (transaction.getAmount() != null) {

                totalAmount += transaction.getAmount();
            }

            if ("SUCCESS".equalsIgnoreCase(
                    transaction.getStatus())) {

                successfulTransactions++;

            } else if ("FAILED".equalsIgnoreCase(
                    transaction.getStatus())) {

                failedTransactions++;
            }
        }

        return new TransactionReportResponse(
                transactions.size(),
                totalAmount,
                successfulTransactions,
                failedTransactions,
                transactions
        );
    }
}