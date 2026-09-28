package com.avanibank.backend.service;

import com.avanibank.backend.entity.Account;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.repository.AccountRepository;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

import java.util.List;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;

    public AccountService(
            AccountRepository accountRepository,
            CustomerRepository customerRepository,
            TransactionRepository transactionRepository) {

        this.accountRepository = accountRepository;
        this.customerRepository = customerRepository;
        this.transactionRepository = transactionRepository;
    }

    // =========================
    // GET MY ACCOUNTS
    // =========================

    public List<Account> getMyAccounts(String email) {

        Customer customer = getCustomerByEmail(email);

        return accountRepository.findByCustomerId(
                customer.getId()
        );
    }

    // =========================
    // GET MY ACTIVE ACCOUNTS
    // =========================

    public List<Account> getMyActiveAccounts(String email) {

        Customer customer = getCustomerByEmail(email);

        return accountRepository.findByCustomerIdAndStatus(
                customer.getId(),
                "ACTIVE"
        );
    }

    // =========================
    // GET ACCOUNT BY NUMBER
    // =========================

    public Account getAccountByNumber(
            String accountNumber,
            String email) {

        Customer customer = getCustomerByEmail(email);

        Account account = accountRepository
                .findByAccountNumber(accountNumber)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Account not found"
                        )
                );

        // Security check
        if (!account.getCustomer().getId()
                .equals(customer.getId())) {

            throw new RuntimeException(
                    "You are not authorized to access this account"
            );
        }

        return account;
    }

    // =========================
    // BALANCE INQUIRY
    // =========================

    public Double getBalance(String email) {

        Customer customer = getCustomerByEmail(email);

        List<Account> accounts =
                accountRepository.findByCustomerIdAndStatus(
                        customer.getId(),
                        "ACTIVE"
                );

        if (accounts.isEmpty()) {
            throw new RuntimeException(
                    "No active account found"
            );
        }

        return accounts.get(0).getBalance();
    }

    // =========================
    // ACCOUNT STATEMENT
    // =========================

    public List<Transaction> getAccountStatement(
            String accountNumber,
            String email) {

        // Verify that account belongs to logged-in customer
        getAccountByNumber(accountNumber, email);

        List<Transaction> sent =
                transactionRepository
                        .findBySenderAccountNumberOrderByTransactionDateDesc(
                                accountNumber
                        );

        List<Transaction> received =
                transactionRepository
                        .findByReceiverAccountNumberOrderByTransactionDateDesc(
                                accountNumber
                        );

        List<Transaction> statement = new ArrayList<>();

        statement.addAll(sent);
        statement.addAll(received);

        // Latest transaction first
        statement.sort((a, b) -> {

    if (a.getTransactionDate() == null
            && b.getTransactionDate() == null) {
        return 0;
    }

    if (a.getTransactionDate() == null) {
        return 1;
    }

    if (b.getTransactionDate() == null) {
        return -1;
    }

    return b.getTransactionDate()
            .compareTo(a.getTransactionDate());
});

        return statement;
    }

    // =========================
    // MINI STATEMENT
    // =========================

    public List<Transaction> getMiniStatement(
            String accountNumber,
            String email) {

        List<Transaction> statement =
                getAccountStatement(
                        accountNumber,
                        email
                );

        // Latest 5 transactions
        return statement.stream()
                .limit(5)
                .toList();
    }

    // =========================
    // FREEZE ACCOUNT
    // =========================

    public Account freezeAccount(
            Long accountId,
            String email) {

        Account account =
                getMyAccountById(accountId, email);

        if ("FROZEN".equalsIgnoreCase(
                account.getStatus())) {

            throw new RuntimeException(
                    "Account is already frozen"
            );
        }

        account.setStatus("FROZEN");

        return accountRepository.save(account);
    }

    // =========================
    // UNFREEZE ACCOUNT
    // =========================

    public Account unfreezeAccount(
            Long accountId,
            String email) {

        Account account =
                getMyAccountById(accountId, email);

        if ("ACTIVE".equalsIgnoreCase(
                account.getStatus())) {

            throw new RuntimeException(
                    "Account is already active"
            );
        }

        account.setStatus("ACTIVE");

        return accountRepository.save(account);
    }

    // =========================
    // GET ACCOUNT BY ID
    // =========================

    private Account getMyAccountById(
            Long accountId,
            String email) {

        Customer customer =
                getCustomerByEmail(email);

        return accountRepository
                .findByIdAndCustomerId(
                        accountId,
                        customer.getId()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Account not found"
                        )
                );
    }

    // =========================
    // GET CUSTOMER
    // =========================

    private Customer getCustomerByEmail(
            String email) {

        return customerRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found"
                        )
                );
    }
}