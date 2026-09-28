package com.avanibank.backend.scheduler;

import com.avanibank.backend.entity.Account;
import com.avanibank.backend.entity.Bond;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.repository.AccountRepository;
import com.avanibank.backend.repository.BondRepository;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.TransactionRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Component
public class BondScheduler {

    private final BondRepository bondRepository;
    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;

    public BondScheduler(
            BondRepository bondRepository,
            AccountRepository accountRepository,
            CustomerRepository customerRepository,
            TransactionRepository transactionRepository) {

        this.bondRepository = bondRepository;
        this.accountRepository = accountRepository;
        this.customerRepository = customerRepository;
        this.transactionRepository = transactionRepository;
    }

    // =====================================================
    // BOND PROCESSING
    // Runs every day at 01:00 AM
    // =====================================================

    @Scheduled(cron = "0 0 1 * * *")
    @Transactional
    public void processBonds() {

        List<Bond> activeBonds =
                bondRepository
                        .findAll()
                        .stream()
                        .filter(bond ->
                                "ACTIVE".equalsIgnoreCase(
                                        bond.getStatus()
                                ))
                        .toList();

        LocalDate today =
                LocalDate.now();

        for (Bond bond : activeBonds) {

            try {
                processBond(
                        bond,
                        today
                );
            } catch (Exception e) {

                /*
                 * One failed bond should not stop
                 * processing of other bonds.
                 */
                System.err.println(
                        "Bond processing failed for Bond ID "
                                + bond.getId()
                                + ": "
                                + e.getMessage()
                );
            }
        }
    }

    // =====================================================
    // PROCESS INDIVIDUAL BOND
    // =====================================================

    private void processBond(
            Bond bond,
            LocalDate today) {

        if (bond.getAccount() == null) {
            return;
        }

        Account account =
                bond.getAccount();

        if (!"ACTIVE".equalsIgnoreCase(
                account.getStatus())) {

            return;
        }

        // =================================================
        // INTEREST PROCESSING
        // =================================================

        if (bond.getNextInterestDate() != null
                && !today.isBefore(
                        bond.getNextInterestDate())) {

            processInterest(
                    bond,
                    account,
                    today
            );
        }

        // =================================================
        // MATURITY PROCESSING
        // =================================================

        if (bond.getMaturityDate() != null
                && !today.isBefore(
                        bond.getMaturityDate())) {

            processMaturity(
                    bond,
                    account
            );
        }
    }

    // =====================================================
    // PROCESS INTEREST
    // =====================================================

    private void processInterest(
            Bond bond,
            Account account,
            LocalDate today) {

        Integer interestCycleMonths =
                getInterestCycleMonths(
                        bond.getBondType()
                );

        if (interestCycleMonths == null
                || interestCycleMonths <= 0) {

            return;
        }

        // =================================================
        // CALCULATE INTEREST
        // =================================================

        BigDecimal investmentAmount =
                bond.getInvestmentAmount();

        BigDecimal couponRate =
                bond.getCouponRate();

        BigDecimal interest =
                investmentAmount
                        .multiply(couponRate)
                        .multiply(
                                BigDecimal.valueOf(
                                        interestCycleMonths
                                )
                        )
                        .divide(
                                BigDecimal.valueOf(12),
                                10,
                                RoundingMode.HALF_UP
                        )
                        .divide(
                                BigDecimal.valueOf(100),
                                2,
                                RoundingMode.HALF_UP
                        );

        if (interest.compareTo(
                BigDecimal.ZERO) <= 0) {

            return;
        }

        // =================================================
        // CREDIT INTEREST TO ACCOUNT
        // =================================================

        Double currentBalance =
                account.getBalance();

        if (currentBalance == null) {
            currentBalance = 0.0;
        }

        account.setBalance(
                currentBalance
                        + interest.doubleValue()
        );

        accountRepository.save(account);

        // =================================================
        // UPDATE BOND INTEREST
        // =================================================

        BigDecimal totalInterest =
                bond.getTotalInterestEarned();

        if (totalInterest == null) {
            totalInterest =
                    BigDecimal.ZERO;
        }

        bond.setTotalInterestEarned(
                totalInterest
                        .add(interest)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        )
        );

        // =================================================
        // UPDATE CURRENT VALUE
        // =================================================

        bond.setCurrentValue(
                bond.getInvestmentAmount()
        );

        // =================================================
        // NEXT INTEREST DATE
        // =================================================

        LocalDate nextInterestDate =
                bond.getNextInterestDate()
                        .plusMonths(
                                interestCycleMonths
                        );

        if (nextInterestDate.isAfter(
                bond.getMaturityDate())) {

            nextInterestDate =
                    bond.getMaturityDate();
        }

        bond.setNextInterestDate(
                nextInterestDate
        );

        bondRepository.save(bond);

        // =================================================
        // SYNC CUSTOMER BALANCE
        // =================================================

        Customer customer =
                bond.getCustomer();

        if (customer != null) {

            customer.setBalance(
                    account.getBalance()
            );

            customerRepository.save(
                    customer
            );
        }

        // =================================================
        // CREATE INTEREST TRANSACTION
        // =================================================

        Transaction transaction =
                new Transaction();

        transaction.setSenderAccountNumber(
                "BOND-" + bond.getId()
        );

        transaction.setReceiverAccountNumber(
                account.getAccountNumber()
        );

        transaction.setAmount(
                interest.doubleValue()
        );

        transaction.setTransactionType(
                "BOND_INTEREST"
        );

        transaction.setStatus(
                "SUCCESS"
        );

        transactionRepository.save(
                transaction
        );

        System.out.println(
                "Bond interest credited successfully. "
                        + "Bond ID: "
                        + bond.getId()
                        + ", Interest: "
                        + interest
        );
    }

    // =====================================================
    // PROCESS MATURITY
    // =====================================================

    private void processMaturity(
            Bond bond,
            Account account) {

        // =================================================
        // CREDIT PRINCIPAL
        // =================================================

        BigDecimal principal =
                bond.getInvestmentAmount();

        if (principal == null
                || principal.compareTo(
                        BigDecimal.ZERO
                ) <= 0) {

            return;
        }

        Double currentBalance =
                account.getBalance();

        if (currentBalance == null) {
            currentBalance = 0.0;
        }

        account.setBalance(
                currentBalance
                        + principal.doubleValue()
        );

        accountRepository.save(account);

        // =================================================
        // UPDATE CUSTOMER BALANCE
        // =================================================

        Customer customer =
                bond.getCustomer();

        if (customer != null) {

            customer.setBalance(
                    account.getBalance()
            );

            customerRepository.save(
                    customer
            );
        }

        // =================================================
        // UPDATE BOND
        // =================================================

        bond.setCurrentValue(
                principal
        );

        bond.setStatus(
                "MATURED"
        );

        bondRepository.save(bond);

        // =================================================
        // MATURITY TRANSACTION
        // =================================================

        Transaction transaction =
                new Transaction();

        transaction.setSenderAccountNumber(
                "BOND-MATURITY-" + bond.getId()
        );

        transaction.setReceiverAccountNumber(
                account.getAccountNumber()
        );

        transaction.setAmount(
                principal.doubleValue()
        );

        transaction.setTransactionType(
                "BOND_MATURITY"
        );

        transaction.setStatus(
                "SUCCESS"
        );

        transactionRepository.save(
                transaction
        );

        System.out.println(
                "Bond matured successfully. "
                        + "Bond ID: "
                        + bond.getId()
                        + ", Principal: "
                        + principal
        );
    }

    // =====================================================
    // GET INTEREST CYCLE
    // =====================================================

    private Integer getInterestCycleMonths(
            String bondType) {

        if (bondType == null) {
            return 6;
        }

        switch (bondType.toUpperCase()) {

            case "CORPORATE":
                return 3;

            case "GOVERNMENT":
                return 12;

            case "TAX_FREE":
                return 12;

            case "BANK":
                return 6;

            case "PSU":
                return 6;

            default:
                return 6;
        }
    }
}