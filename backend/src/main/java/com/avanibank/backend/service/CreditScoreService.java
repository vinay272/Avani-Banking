package com.avanibank.backend.service;

import com.avanibank.backend.dto.CreditScoreResponse;
import com.avanibank.backend.entity.Account;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.repository.AccountRepository;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.TransactionRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CreditScoreService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public CreditScoreService(
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            TransactionRepository transactionRepository) {

        this.customerRepository =
                customerRepository;

        this.accountRepository =
                accountRepository;

        this.transactionRepository =
                transactionRepository;
    }

    // =====================================================
    // CHECK CREDIT SCORE
    // =====================================================

    public CreditScoreResponse checkCreditScore(
            String customerEmail) {

        // =================================================
        // FIND CUSTOMER
        // =================================================

        Customer customer =
                customerRepository
                        .findByEmail(customerEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer account not found"
                                ));

        // =================================================
        // FIND CUSTOMER ACCOUNTS
        // =================================================

        List<Account> accounts =
                accountRepository
                        .findByCustomerId(
                                customer.getId()
                        );

        if (accounts.isEmpty()) {

            throw new RuntimeException(
                    "No account found for credit score check"
            );
        }

        // =================================================
        // BASE SCORE
        // =================================================

        int score = 650;

        // =================================================
        // ACTIVE ACCOUNT FACTOR
        // =================================================

        boolean hasActiveAccount =
                accounts.stream()
                        .anyMatch(account ->
                                "ACTIVE".equalsIgnoreCase(
                                        account.getStatus()
                                ));

        if (hasActiveAccount) {
            score += 50;
        }

        // =================================================
        // TRANSACTION ACTIVITY
        // =================================================

        int transactionCount = 0;

        for (Account account : accounts) {

            List<Transaction> sent =
                    transactionRepository
                            .findBySenderAccountNumberOrderByTransactionDateDesc(
                                    account.getAccountNumber()
                            );

            List<Transaction> received =
                    transactionRepository
                            .findByReceiverAccountNumberOrderByTransactionDateDesc(
                                    account.getAccountNumber()
                            );

            transactionCount +=
                    sent.size() + received.size();
        }

        /*
         * Regular account activity gives a small
         * positive contribution.
         *
         * Maximum activity bonus = 50 points.
         */

        int activityBonus =
                Math.min(
                        transactionCount / 2,
                        50
                );

        score += activityBonus;

        // =================================================
        // ACCOUNT BALANCE FACTOR
        // =================================================

        double totalBalance = 0.0;

        for (Account account : accounts) {

            if (account.getBalance() != null) {

                totalBalance +=
                        account.getBalance();
            }
        }

        if (totalBalance >= 100000) {

            score += 25;

        } else if (totalBalance >= 50000) {

            score += 15;

        } else if (totalBalance >= 10000) {

            score += 10;
        }

        // =================================================
        // LIMIT SCORE
        // =================================================

        score =
                Math.min(score, 850);

        // =================================================
        // CATEGORY
        // =================================================

        String category;
        String riskLevel;
        String message;

        if (score >= 750) {

            category = "EXCELLENT";
            riskLevel = "LOW";

            message =
                    "Excellent credit profile. " +
                    "You may qualify for favorable loan terms.";

        } else if (score >= 700) {

            category = "GOOD";
            riskLevel = "LOW";

            message =
                    "Good credit profile. " +
                    "You have a healthy credit standing.";

        } else if (score >= 650) {

            category = "FAIR";
            riskLevel = "MEDIUM";

            message =
                    "Fair credit profile. " +
                    "Loan approval may depend on additional factors.";

        } else {

            category = "POOR";
            riskLevel = "HIGH";

            message =
                    "Poor credit profile. " +
                    "Additional verification may be required.";
        }

        // =================================================
        // RESPONSE
        // =================================================

        CreditScoreResponse response =
                new CreditScoreResponse();

        response.setCreditScore(score);

        response.setCategory(category);

        response.setRiskLevel(riskLevel);

        response.setMessage(message);

        return response;
    }
}