package com.avanibank.backend.dto;

import com.avanibank.backend.entity.Transaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionReportResponse {

    private long totalTransactions;

    private double totalTransactionAmount;

    private long successfulTransactions;

    private long failedTransactions;

    private List<Transaction> transactions;
}