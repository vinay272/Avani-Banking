package com.avanibank.backend.service;

import com.avanibank.backend.entity.Account;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.Investment;
import com.avanibank.backend.entity.MutualFund;
import com.avanibank.backend.repository.AccountRepository;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.InvestmentRepository;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class InvestmentService {

    private final InvestmentRepository investmentRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final MutualFundService mutualFundService;

    public InvestmentService(
            InvestmentRepository investmentRepository,
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            TransactionRepository transactionRepository,
            MutualFundService mutualFundService) {

        this.investmentRepository = investmentRepository;
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.mutualFundService = mutualFundService;
    }

    // =========================
    // GET MY INVESTMENTS
    // =========================

    public List<Investment> getMyInvestments(String email) {

        Customer customer = getCustomerByEmail(email);

        return investmentRepository
                .findByCustomerIdOrderByCreatedAtDesc(
                        customer.getId());
    }

    // =========================
    // GET MY ACTIVE INVESTMENTS
    // =========================

    public List<Investment> getMyActiveInvestments(String email) {

        Customer customer = getCustomerByEmail(email);

        return investmentRepository
                .findByCustomerIdAndStatusOrderByCreatedAtDesc(
                        customer.getId(),
                        "ACTIVE");
    }

    // =========================
    // GET INVESTMENT BY ID
    // =========================

    public Investment getInvestmentById(
            Long investmentId,
            String email) {

        Customer customer = getCustomerByEmail(email);

        return investmentRepository
                .findByIdAndCustomerId(
                        investmentId,
                        customer.getId())
                .orElseThrow(() -> new RuntimeException(
                        "Investment not found"));
    }

    // =========================
    // GET BY INVESTMENT TYPE
    // =========================

    public List<Investment> getInvestmentsByType(
            String investmentType,
            String email) {

        Customer customer = getCustomerByEmail(email);

        return investmentRepository
                .findByCustomerIdAndInvestmentTypeOrderByCreatedAtDesc(
                        customer.getId(),
                        investmentType);
    }

        // =========================
    // BUY MUTUAL FUND
    // =========================

    @Transactional
    public Investment buyMutualFund(
            String email,
            Long accountId,
            Long fundId,
            Double investmentAmount) {

        Customer customer = getCustomerByEmail(email);

        // =========================
        // VALIDATE MUTUAL FUND
        // =========================

        MutualFund mutualFund =
                mutualFundService.validateFund(fundId);

        // =========================
        // VALIDATE AMOUNT
        // =========================

        if (investmentAmount == null ||
                investmentAmount <= 0) {

            throw new RuntimeException(
                    "Investment amount must be greater than zero"
            );
        }

        // =========================
        // MINIMUM INVESTMENT CHECK
        // =========================

        if (investmentAmount <
                mutualFund.getMinimumInvestment()) {

            throw new RuntimeException(
                    "Minimum investment amount is ₹"
                    + mutualFund.getMinimumInvestment()
            );
        }

        // =========================
        // GET CUSTOMER ACCOUNT
        // =========================

        Account account =
                accountRepository
                        .findByIdAndCustomerId(
                                accountId,
                                customer.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Account not found or unauthorized"
                                )
                        );

        // =========================
        // ACCOUNT STATUS CHECK
        // =========================

        if (!"ACTIVE".equalsIgnoreCase(
                account.getStatus())) {

            throw new RuntimeException(
                    "Only active accounts can be used for investments"
            );
        }

        // =========================
        // BALANCE CHECK
        // =========================

        if (account.getBalance() == null ||
                account.getBalance() < investmentAmount) {

            throw new RuntimeException(
                    "Insufficient account balance"
            );
        }

        // =========================
        // DEBIT ACCOUNT
        // =========================

        account.setBalance(
                account.getBalance()
                        - investmentAmount
        );

        accountRepository.save(account);

        // =========================
        // CREATE INVESTMENT
        // =========================

        Investment investment =
                new Investment();

        investment.setCustomer(customer);
        investment.setAccount(account);

        investment.setInvestmentType(
                "MUTUAL_FUND"
        );

        investment.setInvestmentName(
                mutualFund.getFundName()
        );

        investment.setPrincipalAmount(
                investmentAmount
        );

        investment.setCurrentValue(
                investmentAmount
        );

        investment.setExpectedReturnRate(
                mutualFund.getExpectedReturnRate()
        );

        investment.setStartDate(
                LocalDate.now()
        );

        investment.setStatus(
                "ACTIVE"
        );

        investment.setTotalProfitLoss(
                0.0
        );

        Investment savedInvestment =
                investmentRepository.save(
                        investment
                );

        // =========================
        // RECORD TRANSACTION
        // =========================

        Transaction transaction =
                new Transaction();

        transaction.setSenderAccountNumber(
                account.getAccountNumber()
        );

        transaction.setReceiverAccountNumber(
                account.getAccountNumber()
        );

        transaction.setAmount(
                investmentAmount
        );

        transaction.setTransactionType(
                "MUTUAL_FUND_PURCHASE"
        );

        transaction.setStatus(
                "SUCCESS"
        );

        transactionRepository.save(
                transaction
        );

        return savedInvestment;
    }


    // =========================
    // CREATE INVESTMENT
    // =========================

    @Transactional
    public Investment createInvestment(
            String email,
            Long accountId,
            String investmentType,
            String investmentName,
            Double principalAmount,
            Double expectedReturnRate,
            LocalDate startDate,
            LocalDate maturityDate) {

        Customer customer = getCustomerByEmail(email);

        // =========================
        // VALIDATE INVESTMENT TYPE
        // =========================

        if (investmentType == null ||
                investmentType.trim().isEmpty()) {

            throw new RuntimeException(
                    "Investment type is required");
        }

        String type = investmentType
                .trim()
                .toUpperCase();

        if (!List.of(
                "MUTUAL_FUND",
                "FIXED_DEPOSIT",
                "SIP",
                "BOND",
                "GOLD").contains(type)) {

            throw new RuntimeException(
                    "Invalid investment type");
        }

        // =========================
        // VALIDATE NAME
        // =========================

        if (investmentName == null ||
                investmentName.trim().isEmpty()) {

            throw new RuntimeException(
                    "Investment name is required");
        }

        // =========================
        // VALIDATE AMOUNT
        // =========================

        if (principalAmount == null ||
                principalAmount <= 0) {

            throw new RuntimeException(
                    "Investment amount must be greater than zero");
        }

        // =========================
        // VALIDATE RETURN RATE
        // =========================

        if (expectedReturnRate != null &&
                expectedReturnRate < 0) {

            throw new RuntimeException(
                    "Expected return rate cannot be negative");
        }

        // =========================
        // VALIDATE START DATE
        // =========================

        if (startDate == null) {
            startDate = LocalDate.now();
        }

        // =========================
        // VALIDATE MATURITY DATE
        // =========================

        if (maturityDate != null &&
                maturityDate.isBefore(startDate)) {

            throw new RuntimeException(
                    "Maturity date cannot be before start date");
        }

        // =========================
        // GET CUSTOMER ACCOUNT
        // =========================

        Account account = accountRepository
                .findByIdAndCustomerId(
                        accountId,
                        customer.getId())
                .orElseThrow(() -> new RuntimeException(
                        "Account not found or unauthorized"));

        // =========================
        // ACCOUNT STATUS CHECK
        // =========================

        if (!"ACTIVE".equalsIgnoreCase(
                account.getStatus())) {

            throw new RuntimeException(
                    "Only active accounts can be used for investments");
        }

        // =========================
        // BALANCE CHECK
        // =========================

        if (account.getBalance() == null ||
                account.getBalance() < principalAmount) {

            throw new RuntimeException(
                    "Insufficient account balance");
        }

        // =========================
        // DEBIT ACCOUNT
        // =========================

        account.setBalance(
                account.getBalance() - principalAmount);

        accountRepository.save(account);

        // =========================
        // RECORD INVESTMENT TRANSACTION
        // =========================

        Transaction transaction = new Transaction();

        transaction.setSenderAccountNumber(
                account.getAccountNumber());

        transaction.setReceiverAccountNumber(
                account.getAccountNumber());

        transaction.setAmount(principalAmount);

        transaction.setTransactionType(
                "INVESTMENT");

        transaction.setStatus(
                "SUCCESS");

        transactionRepository.save(transaction);

        // =========================
        // CREATE INVESTMENT
        // =========================

        Investment investment = new Investment();

        investment.setCustomer(customer);
        investment.setAccount(account);
        investment.setInvestmentType(type);
        investment.setInvestmentName(
                investmentName.trim());
        investment.setPrincipalAmount(principalAmount);
        investment.setCurrentValue(principalAmount);
        investment.setExpectedReturnRate(
                expectedReturnRate != null
                        ? expectedReturnRate
                        : 0.0);
        investment.setStartDate(startDate);
        investment.setMaturityDate(maturityDate);
        investment.setStatus("ACTIVE");
        investment.setTotalProfitLoss(0.0);

        return investmentRepository.save(investment);
    }

    // =========================
    // UPDATE CURRENT VALUE
    // =========================

    @Transactional
    public Investment updateCurrentValue(
            Long investmentId,
            String email,
            Double currentValue) {

        Investment investment = getInvestmentById(
                investmentId,
                email);

        if (currentValue == null ||
                currentValue < 0) {

            throw new RuntimeException(
                    "Current value cannot be negative");
        }

        investment.setCurrentValue(currentValue);

        double profitLoss = currentValue -
                investment.getPrincipalAmount();

        investment.setTotalProfitLoss(
                profitLoss);

        investment.setUpdatedAt(
                java.time.LocalDateTime.now());

        return investmentRepository.save(
                investment);
    }

    // =========================
    // REDEEM INVESTMENT
    // =========================

    @Transactional
    public Investment redeemInvestment(
            Long investmentId,
            String email) {

        Investment investment = getInvestmentById(
                investmentId,
                email);

        if (!"ACTIVE".equalsIgnoreCase(
                investment.getStatus())) {

            throw new RuntimeException(
                    "Only active investments can be redeemed");
        }

        Account account = investment.getAccount();

        Double redemptionAmount = investment.getCurrentValue();

        if (redemptionAmount == null ||
                redemptionAmount < 0) {

            redemptionAmount = 0.0;
        }

        account.setBalance(
                (account.getBalance() == null
                        ? 0.0
                        : account.getBalance())
                        + redemptionAmount);

        accountRepository.save(account);

        // =========================
        // RECORD REDEMPTION TRANSACTION
        // =========================

        Transaction transaction = new Transaction();

        transaction.setSenderAccountNumber(
                account.getAccountNumber());

        transaction.setReceiverAccountNumber(
                account.getAccountNumber());

        transaction.setAmount(redemptionAmount);

        transaction.setTransactionType(
                "INVESTMENT_REDEMPTION");

        transaction.setStatus(
                "SUCCESS");

        transactionRepository.save(transaction);

        investment.setStatus("REDEEMED");
        investment.setUpdatedAt(
                java.time.LocalDateTime.now());

        return investmentRepository.save(
                investment);
    }

    // =========================
    // GET CUSTOMER
    // =========================

    private Customer getCustomerByEmail(
            String email) {

        return customerRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException(
                        "Customer not found"));
    }
}