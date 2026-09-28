package com.avanibank.backend.service;

import com.avanibank.backend.entity.Account;
import com.avanibank.backend.entity.Bond;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.repository.AccountRepository;
import com.avanibank.backend.repository.BondRepository;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class BondService {

    private final BondRepository bondRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public BondService(
            BondRepository bondRepository,
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            TransactionRepository transactionRepository) {

        this.bondRepository = bondRepository;
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    // =====================================================
    // CREATE / PURCHASE BOND
    // =====================================================

    @Transactional
    public Bond purchaseBond(
            String customerEmail,
            Long accountId,
            String bondName,
            String bondType,
            BigDecimal faceValue,
            BigDecimal investmentAmount,
            BigDecimal couponRate,
            Integer tenureMonths) {

        // =================================================
        // VALIDATION
        // =================================================

        if (customerEmail == null || customerEmail.trim().isEmpty()) {
            throw new RuntimeException("Customer email is required");
        }

        if (accountId == null) {
            throw new RuntimeException("Account is required");
        }

        if (bondName == null || bondName.trim().isEmpty()) {
            throw new RuntimeException("Bond name is required");
        }

        if (bondType == null || bondType.trim().isEmpty()) {
            throw new RuntimeException("Bond type is required");
        }

        if (faceValue == null || faceValue.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Face value must be greater than 0");
        }

        if (investmentAmount == null
                || investmentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException(
                    "Investment amount must be greater than 0"
            );
        }

        if (couponRate == null
                || couponRate.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Invalid coupon rate");
        }

        if (tenureMonths == null || tenureMonths <= 0) {
            throw new RuntimeException(
                    "Bond tenure must be greater than 0"
            );
        }

        // =================================================
        // FIND CUSTOMER
        // =================================================

        Customer customer =
                customerRepository
                        .findByEmail(customerEmail.trim())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer account not found"
                                ));

        // =================================================
        // FIND ACCOUNT
        // =================================================

        Account account =
                accountRepository
                        .findById(accountId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Account not found"
                                ));

        // =================================================
        // ACCOUNT OWNERSHIP
        // =================================================

        if (account.getCustomer() == null
                || !account.getCustomer()
                        .getId()
                        .equals(customer.getId())) {

            throw new RuntimeException(
                    "You are not authorized to use this account"
            );
        }

        // =================================================
        // ACCOUNT STATUS
        // =================================================

        if (!"ACTIVE".equalsIgnoreCase(account.getStatus())) {
            throw new RuntimeException(
                    "Account is not active"
            );
        }

        // =================================================
        // BALANCE CHECK
        // =================================================

        if (account.getBalance() == null) {
            throw new RuntimeException(
                    "Account balance is unavailable"
            );
        }

        double amount = investmentAmount.doubleValue();

        if (account.getBalance() < amount) {
            throw new RuntimeException(
                    "Insufficient balance for bond investment"
            );
        }

        // =================================================
        // PREVENT DUPLICATE ACTIVE BOND
        // =================================================

        boolean alreadyExists =
                bondRepository
                        .existsByCustomerIdAndBondNameAndStatus(
                                customer.getId(),
                                bondName.trim(),
                                "ACTIVE"
                        );

        if (alreadyExists) {
            throw new RuntimeException(
                    "An active bond with this name already exists"
            );
        }

        // =================================================
        // PURCHASE DATE
        // =================================================

        LocalDate purchaseDate =
                LocalDate.now();

        LocalDate maturityDate =
                purchaseDate.plusMonths(tenureMonths);

        // =================================================
        // NEXT INTEREST DATE
        // =================================================

        LocalDate nextInterestDate =
                purchaseDate.plusMonths(6);

        if (!nextInterestDate.isBefore(maturityDate)) {
            nextInterestDate = maturityDate;
        }

        // =================================================
        // INITIAL CURRENT VALUE
        // =================================================

        BigDecimal currentValue =
                investmentAmount.setScale(
                        2,
                        RoundingMode.HALF_UP
                );

        // =================================================
        // CREATE BOND
        // =================================================

        Bond bond = new Bond();

        bond.setCustomer(customer);
        bond.setAccount(account);

        bond.setBondName(
                bondName.trim()
        );

        bond.setBondType(
                bondType.trim().toUpperCase()
        );

        bond.setFaceValue(
                faceValue.setScale(
                        2,
                        RoundingMode.HALF_UP
                )
        );

        bond.setInvestmentAmount(
                investmentAmount.setScale(
                        2,
                        RoundingMode.HALF_UP
                )
        );

        bond.setCouponRate(
                couponRate.setScale(
                        3,
                        RoundingMode.HALF_UP
                )
        );

        bond.setTenureMonths(
                tenureMonths
        );

        bond.setPurchaseDate(
                purchaseDate
        );

        bond.setMaturityDate(
                maturityDate
        );

        bond.setNextInterestDate(
                nextInterestDate
        );

        bond.setTotalInterestEarned(
                BigDecimal.ZERO.setScale(
                        2,
                        RoundingMode.HALF_UP
                )
        );

        bond.setCurrentValue(
                currentValue
        );

        bond.setStatus(
                "ACTIVE"
        );

        Bond savedBond =
                bondRepository.save(bond);

        // =================================================
        // DEBIT ACCOUNT
        // =================================================

        account.setBalance(
                account.getBalance() - amount
        );

        accountRepository.save(account);

        // =================================================
        // SYNC CUSTOMER BALANCE
        // =================================================

        customer.setBalance(
                account.getBalance()
        );

        customerRepository.save(customer);

        // =================================================
        // CREATE TRANSACTION
        // =================================================

        Transaction transaction =
                new Transaction();

        transaction.setSenderAccountNumber(
                account.getAccountNumber()
        );

        transaction.setReceiverAccountNumber(
                "BOND-" + savedBond.getId()
        );

        transaction.setAmount(
                amount
        );

        transaction.setTransactionType(
                "BOND_PURCHASE"
        );

        transaction.setStatus(
                "SUCCESS"
        );

        transactionRepository.save(transaction);

        return savedBond;
    }

    // =====================================================
    // GET CUSTOMER BONDS
    // =====================================================

    public List<Bond> getCustomerBonds(
            String customerEmail) {

        Customer customer =
                customerRepository
                        .findByEmail(customerEmail.trim())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer account not found"
                                ));

        return bondRepository
                .findByCustomerIdOrderByCreatedAtDesc(
                        customer.getId()
                );
    }

    // =====================================================
    // GET ACTIVE BONDS
    // =====================================================

    public List<Bond> getActiveBonds(
            String customerEmail) {

        Customer customer =
                customerRepository
                        .findByEmail(customerEmail.trim())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer account not found"
                                ));

        return bondRepository
                .findByCustomerIdAndStatusOrderByCreatedAtDesc(
                        customer.getId(),
                        "ACTIVE"
                );
    }

    // =====================================================
    // GET BOND BY ID
    // =====================================================

    public Bond getBondById(
            Long bondId,
            String customerEmail) {

        Customer customer =
                customerRepository
                        .findByEmail(customerEmail.trim())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer account not found"
                                ));

        Bond bond =
                bondRepository
                        .findById(bondId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Bond not found"
                                ));

        if (bond.getCustomer() == null
                || !bond.getCustomer()
                        .getId()
                        .equals(customer.getId())) {

            throw new RuntimeException(
                    "You are not authorized to view this bond"
            );
        }

        return bond;
    }

    // =====================================================
    // CALCULATE EXPECTED INTEREST
    // =====================================================

    public BigDecimal calculateExpectedInterest(
            BigDecimal investmentAmount,
            BigDecimal couponRate,
            Integer tenureMonths) {

        if (investmentAmount == null
                || couponRate == null
                || tenureMonths == null) {

            throw new RuntimeException(
                    "Invalid bond calculation data"
            );
        }

        BigDecimal years =
                BigDecimal.valueOf(tenureMonths)
                        .divide(
                                BigDecimal.valueOf(12),
                                6,
                                RoundingMode.HALF_UP
                        );

        return investmentAmount
                .multiply(couponRate)
                .multiply(years)
                .divide(
                        BigDecimal.valueOf(100),
                        2,
                        RoundingMode.HALF_UP
                );
    }

        // =====================================================
    // PREMATURE SELL BOND
    // =====================================================

    @Transactional
    public Bond sellBond(
            Long bondId,
            String customerEmail) {

        // =================================================
        // FIND CUSTOMER
        // =================================================

        Customer customer =
                customerRepository
                        .findByEmail(customerEmail.trim())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer account not found"
                                ));

        // =================================================
        // FIND BOND
        // =================================================

        Bond bond =
                bondRepository
                        .findById(bondId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Bond not found"
                                ));

        // =================================================
        // OWNERSHIP CHECK
        // =================================================

        if (bond.getCustomer() == null
                || !bond.getCustomer()
                        .getId()
                        .equals(customer.getId())) {

            throw new RuntimeException(
                    "You are not authorized to sell this bond"
            );
        }

        // =================================================
        // STATUS CHECK
        // =================================================

        if (!"ACTIVE".equalsIgnoreCase(
                bond.getStatus())) {

            throw new RuntimeException(
                    "Only active bonds can be sold"
            );
        }

        // =================================================
        // MATURITY CHECK
        // =================================================

        LocalDate today =
                LocalDate.now();

        if (bond.getMaturityDate() != null
                && !today.isBefore(
                        bond.getMaturityDate())) {

            throw new RuntimeException(
                    "Bond has already reached maturity"
            );
        }

        // =================================================
        // ACCOUNT CHECK
        // =================================================

        Account account =
                bond.getAccount();

        if (account == null) {

            throw new RuntimeException(
                    "Bond linked account not found"
            );
        }

        if (!"ACTIVE".equalsIgnoreCase(
                account.getStatus())) {

            throw new RuntimeException(
                    "Linked account is not active"
            );
        }

        // =================================================
        // PRINCIPAL
        // =================================================

        BigDecimal principal =
                bond.getInvestmentAmount();

        if (principal == null
                || principal.compareTo(
                        BigDecimal.ZERO
                ) <= 0) {

            throw new RuntimeException(
                    "Invalid bond investment amount"
            );
        }

        // =================================================
        // TOTAL EARNED INTEREST
        // =================================================

        BigDecimal earnedInterest =
                bond.getTotalInterestEarned();

        if (earnedInterest == null) {

            earnedInterest =
                    BigDecimal.ZERO;
        }

        // =================================================
        // EARLY EXIT ADJUSTMENT
        // =================================================
        /*
         * Premature sale par 1% adjustment
         * earned interest se deduct kiya ja raha hai.
         */

        BigDecimal exitAdjustment =
                earnedInterest
                        .multiply(
                                new BigDecimal("0.01")
                        )
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        BigDecimal saleInterest =
                earnedInterest
                        .subtract(exitAdjustment);

        if (saleInterest.compareTo(
                BigDecimal.ZERO) < 0) {

            saleInterest =
                    BigDecimal.ZERO;
        }

        // =================================================
        // FINAL SALE AMOUNT
        // =================================================

        BigDecimal saleAmount =
                principal
                        .add(saleInterest)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        // =================================================
        // CREDIT ACCOUNT
        // =================================================

        Double currentBalance =
                account.getBalance();

        if (currentBalance == null) {
            currentBalance = 0.0;
        }

        account.setBalance(
                currentBalance
                        + saleAmount.doubleValue()
        );

        accountRepository.save(account);

        // =================================================
        // SYNC CUSTOMER BALANCE
        // =================================================

        customer.setBalance(
                account.getBalance()
        );

        customerRepository.save(customer);

        // =================================================
        // UPDATE BOND
        // =================================================

        bond.setCurrentValue(
                saleAmount
        );

        bond.setStatus(
                "SOLD"
        );

        bondRepository.save(bond);

        // =================================================
        // CREATE SALE TRANSACTION
        // =================================================

        Transaction transaction =
                new Transaction();

        transaction.setSenderAccountNumber(
                "BOND-SALE-" + bond.getId()
        );

        transaction.setReceiverAccountNumber(
                account.getAccountNumber()
        );

        transaction.setAmount(
                saleAmount.doubleValue()
        );

        transaction.setTransactionType(
                "BOND_SALE"
        );

        transaction.setStatus(
                "SUCCESS"
        );

        transactionRepository.save(transaction);

        return bond;
    }

}
