package com.avanibank.backend.service;

import com.avanibank.backend.entity.Account;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.FixedDeposit;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.repository.TransactionRepository;
import com.avanibank.backend.repository.AccountRepository;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.FixedDepositRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class FixedDepositService {

        private final FixedDepositRepository fixedDepositRepository;
        private final CustomerRepository customerRepository;
        private final AccountRepository accountRepository;
        private final TransactionRepository transactionRepository;
        private final InvestmentMaturityAlertService investmentMaturityAlertService;

        public FixedDepositService(
                        FixedDepositRepository fixedDepositRepository,
                        CustomerRepository customerRepository,
                        AccountRepository accountRepository,
                        TransactionRepository transactionRepository,
                        InvestmentMaturityAlertService investmentMaturityAlertService) {

                this.fixedDepositRepository = fixedDepositRepository;
                this.customerRepository = customerRepository;
                this.accountRepository = accountRepository;
                this.transactionRepository = transactionRepository;
                this.investmentMaturityAlertService = investmentMaturityAlertService;
        }

        // =====================================================
        // CREATE FIXED DEPOSIT
        // =====================================================

        @Transactional
        public FixedDeposit createFixedDeposit(
                        String email,
                        Long accountId,
                        Double amount,
                        Double interestRate,
                        Integer tenureMonths) {

                Customer customer = getCustomerByEmail(email);

                if (amount == null || amount <= 0) {
                        throw new RuntimeException(
                                        "FD amount must be greater than zero");
                }

                if (interestRate == null || interestRate < 0) {
                        throw new RuntimeException(
                                        "Invalid interest rate");
                }

                if (tenureMonths == null || tenureMonths <= 0) {
                        throw new RuntimeException(
                                        "FD tenure must be greater than zero");
                }

                Account account = accountRepository
                                .findByIdAndCustomerId(
                                                accountId,
                                                customer.getId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Account not found"));

                if (!"ACTIVE".equalsIgnoreCase(
                                account.getStatus())) {

                        throw new RuntimeException(
                                        "Account is not active");
                }

                if (account.getBalance() == null) {
                        throw new RuntimeException(
                                        "Account balance is unavailable");
                }

                if (account.getBalance() < amount) {
                        throw new RuntimeException(
                                        "Insufficient account balance");
                }

                // =================================================
                // SIMPLE INTEREST CALCULATION
                // =================================================

                double interest = amount
                                * (interestRate / 100.0)
                                * (tenureMonths / 12.0);

                double maturityAmount = amount + interest;

                LocalDateTime createdAt = LocalDateTime.now();

                LocalDateTime maturityDate = createdAt.plusMonths(
                                tenureMonths);

                // =================================================
                // DEDUCT AMOUNT FROM ACCOUNT
                // =================================================

                double newBalance = account.getBalance() - amount;

                account.setBalance(newBalance);

                accountRepository.save(account);

                // Keep customer balance synchronized
                customer.setBalance(newBalance);

                customerRepository.save(customer);

                // =================================================
                // CREATE FD
                // =================================================

                FixedDeposit fixedDeposit = new FixedDeposit();

                fixedDeposit.setCustomer(customer);
                fixedDeposit.setAccount(account);
                fixedDeposit.setPrincipalAmount(amount);
                fixedDeposit.setInterestRate(interestRate);
                fixedDeposit.setTenureMonths(tenureMonths);
                fixedDeposit.setMaturityAmount(maturityAmount);
                fixedDeposit.setCreatedAt(createdAt);
                fixedDeposit.setMaturityDate(maturityDate);
                fixedDeposit.setStatus("ACTIVE");

                FixedDeposit savedFixedDeposit = fixedDepositRepository.save(fixedDeposit);

                investmentMaturityAlertService.sendMaturityAlert(
                customer,
                savedFixedDeposit.getId(),
                "Fixed Deposit",
                savedFixedDeposit.getMaturityDate().toLocalDate(),
                savedFixedDeposit.getMaturityAmount()
                );

                Transaction transaction = new Transaction();

                transaction.setSenderAccountNumber(
                                account.getAccountNumber());

                transaction.setReceiverAccountNumber(
                                "FD-" + savedFixedDeposit.getId());

                transaction.setAmount(amount);

                transaction.setTransactionType(
                                "FIXED_DEPOSIT");

                transaction.setStatus(
                                "SUCCESS");

                transactionRepository.save(transaction);

                return savedFixedDeposit;
        }

        // =====================================================
        // GET MY FIXED DEPOSITS
        // =====================================================

        public List<FixedDeposit> getMyFixedDeposits(
                        String email) {

                Customer customer = getCustomerByEmail(email);

                return fixedDepositRepository
                                .findByCustomerIdOrderByCreatedAtDesc(
                                                customer.getId());
        }

        // =====================================================
        // GET ACTIVE FIXED DEPOSITS
        // =====================================================

        public List<FixedDeposit> getActiveFixedDeposits(
                        String email) {

                Customer customer = getCustomerByEmail(email);

                return fixedDepositRepository
                                .findByCustomerIdAndStatusOrderByCreatedAtDesc(
                                                customer.getId(),
                                                "ACTIVE");
        }

        // =====================================================
        // GET FD BY ID
        // =====================================================

        public FixedDeposit getFixedDepositById(
                        Long fdId,
                        String email) {

                Customer customer = getCustomerByEmail(email);

                return fixedDepositRepository
                                .findByIdAndCustomerId(
                                                fdId,
                                                customer.getId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Fixed Deposit not found"));
        }

        // =====================================================
        // MATURE FIXED DEPOSIT
        // =====================================================

        @Transactional
        public FixedDeposit matureFixedDeposit(
                        Long fdId,
                        String email) {

                FixedDeposit fixedDeposit = getFixedDepositById(
                                fdId,
                                email);

                if (!"ACTIVE".equalsIgnoreCase(
                                fixedDeposit.getStatus())) {

                        throw new RuntimeException(
                                        "Fixed Deposit is not active");
                }

                if (LocalDateTime.now()
                                .isBefore(
                                                fixedDeposit.getMaturityDate())) {

                        throw new RuntimeException(
                                        "Fixed Deposit has not reached maturity");
                }

                Account account = fixedDeposit.getAccount();

                account.setBalance(
                                account.getBalance()
                                                + fixedDeposit.getMaturityAmount());

                accountRepository.save(account);

                fixedDeposit.setStatus("MATURED");

                return fixedDepositRepository.save(
                                fixedDeposit);
        }

        // =====================================================
        // PREMATURE FD CLOSURE
        // =====================================================

        @Transactional
        public FixedDeposit closeFixedDeposit(
                        Long fdId,
                        String email) {

                FixedDeposit fixedDeposit = getFixedDepositById(fdId, email);

                // -------------------------------------------------
                // FD STATUS CHECK
                // -------------------------------------------------

                if (!"ACTIVE".equalsIgnoreCase(
                                fixedDeposit.getStatus())) {

                        throw new RuntimeException(
                                        "Fixed Deposit is not active and cannot be closed");
                }

                // -------------------------------------------------
                // MATURITY CHECK
                // -------------------------------------------------

                if (!LocalDateTime.now().isBefore(
                                fixedDeposit.getMaturityDate())) {

                        throw new RuntimeException(
                                        "Fixed Deposit has already reached maturity. Please use maturity processing.");
                }

                // -------------------------------------------------
                // BASIC DATA
                // -------------------------------------------------

                Double principal = fixedDeposit.getPrincipalAmount();

                Double originalRate = fixedDeposit.getInterestRate();

                if (principal == null || principal <= 0) {

                        throw new RuntimeException(
                                        "Invalid Fixed Deposit principal amount");
                }

                if (originalRate == null || originalRate < 0) {

                        throw new RuntimeException(
                                        "Invalid Fixed Deposit interest rate");
                }

                // -------------------------------------------------
                // PREMATURE CLOSURE RATE
                // -------------------------------------------------
                //
                // Demo banking rule:
                // Original FD rate - 1.50%
                //
                // Rate can never become negative.
                // -------------------------------------------------

                double prematureRate = Math.max(0.0, originalRate - 1.50);

                // -------------------------------------------------
                // ACTUAL HOLDING PERIOD
                // -------------------------------------------------

                LocalDateTime now = LocalDateTime.now();

                long daysHeld = ChronoUnit.DAYS.between(
                                fixedDeposit.getCreatedAt(),
                                now);

                if (daysHeld < 0) {
                        daysHeld = 0;
                }

                // -------------------------------------------------
                // PREMATURE INTEREST
                // -------------------------------------------------

                double prematureInterest = principal
                                * (prematureRate / 100.0)
                                * (daysHeld / 365.0);

                double closureAmount = principal + prematureInterest;

                // -------------------------------------------------
                // GET ACCOUNT
                // -------------------------------------------------

                Account account = fixedDeposit.getAccount();

                if (account == null) {

                        throw new RuntimeException(
                                        "FD linked account not found");
                }

                if (account.getBalance() == null) {

                        throw new RuntimeException(
                                        "Account balance is unavailable");
                }

                // -------------------------------------------------
                // CREDIT CLOSURE AMOUNT
                // -------------------------------------------------

                double newBalance = account.getBalance()
                                + closureAmount;

                account.setBalance(newBalance);

                accountRepository.save(account);

                // -------------------------------------------------
                // SYNC CUSTOMER BALANCE
                // -------------------------------------------------

                Customer customer = fixedDeposit.getCustomer();

                if (customer != null) {

                        customer.setBalance(newBalance);

                        customerRepository.save(customer);
                }

                // -------------------------------------------------
                // CLOSE FD
                // -------------------------------------------------

                fixedDeposit.setStatus("CLOSED");

                FixedDeposit closedFixedDeposit = fixedDepositRepository.save(fixedDeposit);

                // -------------------------------------------------
                // CREATE TRANSACTION RECORD
                // -------------------------------------------------

                Transaction transaction = new Transaction();

                transaction.setSenderAccountNumber(
                                "FD-CLOSURE-" + closedFixedDeposit.getId());

                transaction.setReceiverAccountNumber(
                                account.getAccountNumber());

                transaction.setAmount(
                                closureAmount);

                transaction.setTransactionType(
                                "FIXED_DEPOSIT_CLOSURE");

                transaction.setStatus(
                                "SUCCESS");

                transactionRepository.save(transaction);

                return closedFixedDeposit;
        }

        // =====================================================
        // CUSTOMER
        // =====================================================

        private Customer getCustomerByEmail(
                        String email) {

                return customerRepository
                                .findByEmail(email)
                                .orElseThrow(() -> new RuntimeException(
                                                "Customer not found"));
        }
}