package com.avanibank.backend.service;

import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AccountStatementService {

    private final TransactionRepository transactionRepository;

    public AccountStatementService(
            TransactionRepository transactionRepository) {

        this.transactionRepository = transactionRepository;
    }

    // =========================
    // FULL ACCOUNT STATEMENT
    // =========================

    public List<Transaction> getAccountStatement(
            String accountNumber) {

        return transactionRepository
                .findBySenderAccountNumberOrReceiverAccountNumberOrderByTransactionDateDesc(
                        accountNumber,
                        accountNumber
                );
    }

    // =========================
    // MINI STATEMENT
    // =========================

    public List<Transaction> getMiniStatement(
            String accountNumber) {

        return transactionRepository
                .findBySenderAccountNumberOrReceiverAccountNumberOrderByTransactionDateDesc(
                        accountNumber,
                        accountNumber
                )
                .stream()
                .limit(5)
                .toList();
    }
}