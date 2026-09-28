package com.avanibank.backend.service;

import com.avanibank.backend.dto.UpiTransferRequest;
import com.avanibank.backend.entity.Account;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.entity.UpiAccount;
import com.avanibank.backend.repository.AccountRepository;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.TransactionRepository;
import com.avanibank.backend.repository.UpiAccountRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UpiService {

    private final UpiAccountRepository upiAccountRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public UpiService(
            UpiAccountRepository upiAccountRepository,
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            TransactionRepository transactionRepository) {

        this.upiAccountRepository = upiAccountRepository;
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    // =====================================================
    // CREATE UPI ID
    // =====================================================

    @Transactional
    public UpiAccount createUpiId(
            String email,
            Long accountId,
            String upiId) {

        // =================================================
        // VALIDATE UPI ID
        // =================================================

        if (upiId == null
                || upiId.trim().isEmpty()) {

            throw new RuntimeException(
                    "UPI ID is required"
            );
        }

        upiId = upiId.trim().toLowerCase();

        // =================================================
        // BASIC UPI FORMAT VALIDATION
        // =================================================

        if (!upiId.contains("@")
                || upiId.indexOf("@") <= 0
                || upiId.indexOf("@")
                        == upiId.length() - 1) {

            throw new RuntimeException(
                    "Invalid UPI ID format"
            );
        }

        // =================================================
        // CHECK DUPLICATE UPI ID
        // =================================================

        if (upiAccountRepository.existsByUpiId(upiId)) {

            throw new RuntimeException(
                    "UPI ID already registered"
            );
        }

        // =================================================
        // FIND CUSTOMER
        // =================================================

        Customer customer =
                customerRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found"
                                )
                        );

        // =================================================
        // FIND CUSTOMER ACCOUNT
        // =================================================

        Account account =
                accountRepository
                        .findByIdAndCustomerId(
                                accountId,
                                customer.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Account not found"
                                )
                        );

        // =================================================
        // ACCOUNT STATUS
        // =================================================

        if (!"ACTIVE".equalsIgnoreCase(
                account.getStatus())) {

            throw new RuntimeException(
                    "Account is not active"
            );
        }

        // =================================================
        // CREATE UPI ACCOUNT
        // =================================================

        UpiAccount upiAccount =
                new UpiAccount();

        upiAccount.setCustomer(customer);
        upiAccount.setAccount(account);
        upiAccount.setUpiId(upiId);
        upiAccount.setStatus("ACTIVE");

        return upiAccountRepository.save(
                upiAccount
        );
    }

    // =====================================================
    // GET MY UPI IDs
    // =====================================================

    public List<UpiAccount> getMyUpiIds(
            String email) {

        Customer customer =
                customerRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found"
                                )
                        );

        return upiAccountRepository
                .findByCustomerId(
                        customer.getId()
                );
    }

    // =====================================================
    // UPI TRANSFER
    // =====================================================

    @Transactional
    public Transaction transferMoney(
            String senderEmail,
            UpiTransferRequest request) {

        // =================================================
        // VALIDATE REQUEST
        // =================================================

        if (request == null) {

            throw new RuntimeException(
                    "UPI transfer request cannot be empty"
            );
        }

        if (request.getReceiverUpiId() == null
                || request.getReceiverUpiId()
                        .trim().isEmpty()) {

            throw new RuntimeException(
                    "Receiver UPI ID is required"
            );
        }

        if (request.getAmount() == null
                || request.getAmount() <= 0) {

            throw new RuntimeException(
                    "Transfer amount must be greater than zero"
            );
        }

        String receiverUpiId =
                request.getReceiverUpiId()
                        .trim()
                        .toLowerCase();

        Double amount =
                request.getAmount();

        // =================================================
        // FIND SENDER CUSTOMER
        // =================================================

        Customer sender =
                customerRepository
                        .findByEmail(senderEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Sender account not found"
                                )
                        );

        // =================================================
        // FIND SENDER UPI ACCOUNT
        // =================================================

        List<UpiAccount> senderUpiAccounts =
                upiAccountRepository
                        .findByCustomerId(
                                sender.getId()
                        );

        UpiAccount senderUpi =
                senderUpiAccounts.stream()
                        .filter(u ->
                                "ACTIVE".equalsIgnoreCase(
                                        u.getStatus()
                                ))
                        .findFirst()
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No active UPI account found"
                                )
                        );

        // =================================================
        // FIND RECEIVER UPI ACCOUNT
        // =================================================

        UpiAccount receiverUpi =
                upiAccountRepository
                        .findByUpiId(
                                receiverUpiId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Receiver UPI ID not found"
                                )
                        );

        // =================================================
        // RECEIVER UPI STATUS
        // =================================================

        if (!"ACTIVE".equalsIgnoreCase(
                receiverUpi.getStatus())) {

            throw new RuntimeException(
                    "Receiver UPI ID is not active"
            );
        }

        // =================================================
        // PREVENT SELF TRANSFER
        // =================================================

        if (senderUpi.getId()
                .equals(receiverUpi.getId())) {

            throw new RuntimeException(
                    "You cannot transfer money to your own UPI ID"
            );
        }

        // =================================================
        // GET SENDER ACCOUNT
        // =================================================

        Account senderAccount =
                senderUpi.getAccount();

        // =================================================
        // GET RECEIVER ACCOUNT
        // =================================================

        Account receiverAccount =
                receiverUpi.getAccount();

        // =================================================
        // CHECK SENDER ACCOUNT STATUS
        // =================================================

        if (!"ACTIVE".equalsIgnoreCase(
                senderAccount.getStatus())) {

            throw new RuntimeException(
                    "Sender account is not active"
            );
        }

        // =================================================
        // CHECK RECEIVER ACCOUNT STATUS
        // =================================================

        if (!"ACTIVE".equalsIgnoreCase(
                receiverAccount.getStatus())) {

            throw new RuntimeException(
                    "Receiver account is not active"
            );
        }

        // =================================================
        // CHECK BALANCE
        // =================================================

        if (senderAccount.getBalance() == null) {

            throw new RuntimeException(
                    "Sender account balance is unavailable"
            );
        }

        if (senderAccount.getBalance() < amount) {

            throw new RuntimeException(
                    "Insufficient balance"
            );
        }

        // =================================================
        // DEBIT SENDER
        // =================================================

        senderAccount.setBalance(
                senderAccount.getBalance() - amount
        );

        // =================================================
        // CREDIT RECEIVER
        // =================================================

        if (receiverAccount.getBalance() == null) {

            receiverAccount.setBalance(0.0);
        }

        receiverAccount.setBalance(
                receiverAccount.getBalance() + amount
        );

        // =================================================
        // SAVE ACCOUNTS
        // =================================================

        accountRepository.save(senderAccount);
        accountRepository.save(receiverAccount);

        // =================================================
        // KEEP CUSTOMER BALANCE IN SYNC
        // =================================================

        sender.setBalance(
                senderAccount.getBalance()
        );

        Customer receiver =
                receiverUpi.getCustomer();

        receiver.setBalance(
                receiverAccount.getBalance()
        );

        customerRepository.save(sender);
        customerRepository.save(receiver);

        // =================================================
        // CREATE TRANSACTION RECORD
        // =================================================

        Transaction transaction =
                new Transaction();

        transaction.setSenderAccountNumber(
                senderAccount.getAccountNumber()
        );

        transaction.setReceiverAccountNumber(
                receiverAccount.getAccountNumber()
        );

        transaction.setAmount(amount);

        transaction.setTransactionType(
                "UPI"
        );

        transaction.setStatus(
                "SUCCESS"
        );

        return transactionRepository.save(
                transaction
        );
    }
}