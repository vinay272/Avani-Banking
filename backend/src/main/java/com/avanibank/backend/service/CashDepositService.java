package com.avanibank.backend.service;

import com.avanibank.backend.dto.CashDepositRequest;
import com.avanibank.backend.entity.Account;
import com.avanibank.backend.entity.CashCounter;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.Employee;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.repository.AccountRepository;
import com.avanibank.backend.repository.CashCounterRepository;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.EmployeeRepository;
import com.avanibank.backend.repository.TransactionRepository;
import com.avanibank.backend.security.StaffRole;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class CashDepositService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final CashCounterRepository cashCounterRepository;
    private final EmployeeRepository employeeRepository;
    private final TransactionRepository transactionRepository;

    public CashDepositService(
            AccountRepository accountRepository,
            CustomerRepository customerRepository,
            CashCounterRepository cashCounterRepository,
            EmployeeRepository employeeRepository,
            TransactionRepository transactionRepository) {

        this.accountRepository = accountRepository;
        this.customerRepository = customerRepository;
        this.cashCounterRepository = cashCounterRepository;
        this.employeeRepository = employeeRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public Transaction depositCash(
            String cashierEmail,
            CashDepositRequest request) {

        // =====================================================
        // 1. VALIDATE AMOUNT
        // =====================================================

        if (request.getAmount() == null
                || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Deposit amount must be greater than 0"
            );
        }

        // =====================================================
        // 2. FIND LOGGED-IN CASHIER
        // =====================================================

        Employee cashier = employeeRepository
                .findByEmail(cashierEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Cashier employee not found"
                        ));

        if (!StaffRole.CASHIER.name()
                .equalsIgnoreCase(cashier.getRole())) {

            throw new RuntimeException(
                    "Only CASHIER employees can perform cash deposits"
            );
        }

        if (!"ACTIVE".equalsIgnoreCase(cashier.getStatus())) {

            throw new RuntimeException(
                    "Cashier account is not active"
            );
        }

        if (cashier.getBranchCode() == null
                || cashier.getBranchCode().isBlank()) {

            throw new RuntimeException(
                    "Cashier is not assigned to any branch"
            );
        }

        // =====================================================
        // 3. FIND CASH COUNTER
        // =====================================================

        CashCounter counter = cashCounterRepository
                .findByCounterCode(request.getCounterCode())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Cash counter not found: "
                                        + request.getCounterCode()
                        ));

        if (!"ACTIVE".equalsIgnoreCase(counter.getStatus())) {

            throw new RuntimeException(
                    "Cash counter is not active"
            );
        }

        // =====================================================
        // 4. CASHIER + COUNTER BRANCH VALIDATION
        // =====================================================

        if (!cashier.getBranchCode()
                .equalsIgnoreCase(counter.getBranchCode())) {

            throw new RuntimeException(
                    "Cashier and cash counter must belong to the same branch"
            );
        }

        // =====================================================
        // 5. ASSIGNED CASHIER VALIDATION
        // =====================================================

        String assignedEmployeeCode =
                counter.getAssignedEmployeeCode();

        if (assignedEmployeeCode != null
                && !assignedEmployeeCode.isBlank()
                && !assignedEmployeeCode.equalsIgnoreCase(
                        cashier.getEmployeeCode())) {

            throw new RuntimeException(
                    "This cash counter is assigned to another cashier"
            );
        }

        // =====================================================
        // 6. FIND CUSTOMER ACCOUNT
        // =====================================================

        Account account = accountRepository
                .findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Account not found: "
                                        + request.getAccountNumber()
                        ));

        // =====================================================
        // 7. ACCOUNT STATUS
        // =====================================================

        if (!"ACTIVE".equalsIgnoreCase(account.getStatus())) {

            throw new RuntimeException(
                    "Customer account is not active"
            );
        }

        // =====================================================
        // 8. GET CUSTOMER
        // =====================================================

        Customer customer = account.getCustomer();

        if (customer == null) {

            throw new RuntimeException(
                    "Customer not found for account"
            );
        }

        // =====================================================
        // 9. CREDIT CUSTOMER ACCOUNT
        // =====================================================

        double depositAmount =
                request.getAmount().doubleValue();

        double currentAccountBalance =
                account.getBalance() == null
                        ? 0.0
                        : account.getBalance();

        double newAccountBalance =
                currentAccountBalance + depositAmount;

        account.setBalance(newAccountBalance);

        accountRepository.save(account);

        // =====================================================
        // 10. SYNC CUSTOMER BALANCE
        // =====================================================

        customer.setBalance(newAccountBalance);

        customerRepository.save(customer);

        // =====================================================
        // 11. CREDIT CASH COUNTER
        // =====================================================

        BigDecimal currentCounterBalance =
                counter.getCurrentBalance() == null
                        ? BigDecimal.ZERO
                        : counter.getCurrentBalance();

        BigDecimal newCounterBalance =
                currentCounterBalance.add(request.getAmount());

        counter.setCurrentBalance(newCounterBalance);

        cashCounterRepository.save(counter);

        // =====================================================
        // 12. CREATE TRANSACTION
        // =====================================================

        Transaction transaction = new Transaction();

        // No sender account for physical cash deposit
        transaction.setSenderAccountNumber(null);

        transaction.setReceiverAccountNumber(
                account.getAccountNumber()
        );

        transaction.setAmount(depositAmount);

        transaction.setTransactionType(
                "CASH_DEPOSIT"
        );

        transaction.setStatus(
                "SUCCESS"
        );

        transaction.setTransactionReference(
                generateTransactionReference()
        );

        transaction.setBranchCode(
                counter.getBranchCode()
        );

        transaction.setCashCounterCode(
                counter.getCounterCode()
        );

        transaction.setCashierEmployeeCode(
                cashier.getEmployeeCode()
        );

        Transaction savedTransaction =
                transactionRepository.save(transaction);

        return savedTransaction;
    }

    private String generateTransactionReference() {

        return "CD-"
                + System.currentTimeMillis()
                + "-"
                + UUID.randomUUID()
                        .toString()
                        .substring(0, 6)
                        .toUpperCase();
    }
}