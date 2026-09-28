package com.avanibank.backend.service;

import com.avanibank.backend.dto.BillPaymentRequest;
import com.avanibank.backend.entity.Account;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.repository.AccountRepository;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.TransactionRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BillPaymentService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public BillPaymentService(
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            TransactionRepository transactionRepository) {

        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    // =====================================================
    // BILL PAYMENT
    // =====================================================

    @Transactional
    public Transaction payBill(
            String senderEmail,
            BillPaymentRequest request) {

        // =================================================
        // VALIDATE REQUEST
        // =================================================

        validateRequest(request);

        String billerCategory =
                request.getBillerCategory()
                        .trim()
                        .toUpperCase();

        String billerName =
                request.getBillerName()
                        .trim();

        String consumerNumber =
                request.getConsumerNumber()
                        .trim();

        Double amount =
                request.getAmount();

        // =================================================
        // FIND CUSTOMER
        // =================================================

        Customer customer =
                customerRepository
                        .findByEmail(senderEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer account not found"
                                ));

        // =================================================
        // FIND ACTIVE ACCOUNT
        // =================================================

        Account senderAccount =
                accountRepository
                        .findByCustomerIdAndStatus(
                                customer.getId(),
                                "ACTIVE"
                        )
                        .stream()
                        .findFirst()
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No active account found"
                                ));

        // =================================================
        // CHECK ACCOUNT STATUS
        // =================================================

        if (!"ACTIVE".equalsIgnoreCase(
                senderAccount.getStatus())) {

            throw new RuntimeException(
                    "Account is not active"
            );
        }

        // =================================================
        // CHECK BALANCE
        // =================================================

        if (senderAccount.getBalance() == null) {

            throw new RuntimeException(
                    "Account balance is unavailable"
            );
        }

        if (senderAccount.getBalance() < amount) {

            throw new RuntimeException(
                    "Insufficient balance"
            );
        }

        // =================================================
        // DEBIT ACCOUNT
        // =================================================

        senderAccount.setBalance(
                senderAccount.getBalance() - amount
        );

        accountRepository.save(senderAccount);

        // =================================================
        // SYNC CUSTOMER BALANCE
        // =================================================

        customer.setBalance(
                senderAccount.getBalance()
        );

        customerRepository.save(customer);

        // =================================================
        // CREATE TRANSACTION
        // =================================================

        Transaction transaction =
                new Transaction();

        transaction.setSenderAccountNumber(
                senderAccount.getAccountNumber()
        );

        // Existing Transaction entity requires
        // receiverAccountNumber.
        // For bill payment we store the consumer number
        // as the receiver/reference identifier.

        transaction.setReceiverAccountNumber(
                consumerNumber
        );

        transaction.setAmount(amount);

        transaction.setTransactionType(
                "BILL_PAYMENT"
        );

        transaction.setStatus(
                "SUCCESS"
        );

        Transaction savedTransaction =
                transactionRepository.save(transaction);

        return savedTransaction;
    }

    // =====================================================
    // VALIDATE BILL PAYMENT REQUEST
    // =====================================================

    private void validateRequest(
            BillPaymentRequest request) {

        if (request == null) {

            throw new RuntimeException(
                    "Bill payment request cannot be empty"
            );
        }

        // =================================================
        // BILLER CATEGORY
        // =================================================

        if (request.getBillerCategory() == null
                || request.getBillerCategory()
                        .trim()
                        .isEmpty()) {

            throw new RuntimeException(
                    "Biller category is required"
            );
        }

        // =================================================
        // BILLER NAME
        // =================================================

        if (request.getBillerName() == null
                || request.getBillerName()
                        .trim()
                        .isEmpty()) {

            throw new RuntimeException(
                    "Biller name is required"
            );
        }

        // =================================================
        // CONSUMER NUMBER
        // =================================================

        if (request.getConsumerNumber() == null
                || request.getConsumerNumber()
                        .trim()
                        .isEmpty()) {

            throw new RuntimeException(
                    "Consumer number is required"
            );
        }

        // =================================================
        // AMOUNT
        // =================================================

        if (request.getAmount() == null
                || request.getAmount() <= 0) {

            throw new RuntimeException(
                    "Bill payment amount must be greater than 0"
            );
        }
    }
}