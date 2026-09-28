package com.avanibank.backend.service;

import com.avanibank.backend.entity.Account;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.GoldInvestment;
import com.avanibank.backend.repository.AccountRepository;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.GoldInvestmentRepository;
import com.avanibank.backend.repository.TransactionRepository;
import com.avanibank.backend.entity.Transaction;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class GoldInvestmentService {

    private final GoldInvestmentRepository goldInvestmentRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final GoldPriceService goldPriceService;

    public GoldInvestmentService(
            GoldInvestmentRepository goldInvestmentRepository,
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            TransactionRepository transactionRepository,
            GoldPriceService goldPriceService) {

        this.goldInvestmentRepository = goldInvestmentRepository;
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.goldPriceService = goldPriceService;
    }

    // =====================================================
    // PURCHASE GOLD
    // =====================================================

    @Transactional
    public GoldInvestment purchaseGold(
            String customerEmail,
            Long accountId,
            String goldType,
            String purity,
            BigDecimal investmentAmount) {

        // -------------------------------------------------
        // BASIC VALIDATION
        // -------------------------------------------------

        if (goldType == null
                || goldType.trim().isEmpty()) {

            throw new RuntimeException(
                    "Gold type is required"
            );
        }

        if (purity == null
                || purity.trim().isEmpty()) {

            throw new RuntimeException(
                    "Gold purity is required"
            );
        }

        if (investmentAmount == null
                || investmentAmount.compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Investment amount must be greater than zero"
            );
        }

        // -------------------------------------------------
        // FIND CUSTOMER
        // -------------------------------------------------

        Customer customer = customerRepository
                .findByEmail(customerEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found"
                        ));

        // -------------------------------------------------
        // FIND ACCOUNT
        // -------------------------------------------------

        Account account = accountRepository
                .findById(accountId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Account not found"
                        ));

        // -------------------------------------------------
        // ACCOUNT OWNERSHIP CHECK
        // -------------------------------------------------

        if (account.getCustomer() == null
                || !account.getCustomer()
                        .getId()
                        .equals(customer.getId())) {

            throw new RuntimeException(
                    "Account does not belong to this customer"
            );
        }

        // -------------------------------------------------
        // ACCOUNT STATUS CHECK
        // -------------------------------------------------

        if (account.getStatus() == null
                || !"ACTIVE".equalsIgnoreCase(
                        account.getStatus())) {

            throw new RuntimeException(
                    "Account is not active"
            );
        }

        // -------------------------------------------------
        // GET GOLD PRICE
        // -------------------------------------------------

        var goldPrice =
                goldPriceService.getPriceByPurity(purity);

        // -------------------------------------------------
        // GOLD TYPE VALIDATION
        // -------------------------------------------------

        if (!goldPrice.getGoldType()
                .equalsIgnoreCase(goldType.trim())) {

            throw new RuntimeException(
                    "Unsupported gold type"
            );
        }

        // -------------------------------------------------
        // MINIMUM INVESTMENT CHECK
        // -------------------------------------------------

        if (investmentAmount.compareTo(
                goldPrice.getMinimumInvestment()) < 0) {

            throw new RuntimeException(
                    "Minimum investment for "
                            + purity
                            + " gold is ₹"
                            + goldPrice.getMinimumInvestment()
            );
        }

        // -------------------------------------------------
        // BALANCE CHECK
        // -------------------------------------------------

        if (account.getBalance() == null
        || Double.compare(
                account.getBalance(),
                investmentAmount.doubleValue()
        ) < 0) {

            throw new RuntimeException(
                    "Insufficient account balance"
            );
        }

        // -------------------------------------------------
        // CALCULATE GOLD QUANTITY
        // -------------------------------------------------

        BigDecimal quantityGrams =
                investmentAmount.divide(
                        goldPrice.getPricePerGram(),
                        4,
                        RoundingMode.DOWN
                );

        if (quantityGrams.compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Investment amount is too small"
            );
        }

        // -------------------------------------------------
        // CREATE GOLD INVESTMENT
        // -------------------------------------------------

        GoldInvestment goldInvestment =
                new GoldInvestment();

        goldInvestment.setCustomer(customer);
        goldInvestment.setAccount(account);

        goldInvestment.setGoldType(
                goldType.trim().toUpperCase()
        );

        goldInvestment.setPurity(
                purity.trim().toUpperCase()
        );

        goldInvestment.setQuantityGrams(
                quantityGrams
        );

        goldInvestment.setPurchasePricePerGram(
                goldPrice.getPricePerGram()
        );

        goldInvestment.setInvestmentAmount(
                investmentAmount
        );

        goldInvestment.setCurrentPricePerGram(
                goldPrice.getPricePerGram()
        );

        goldInvestment.setCurrentValue(
                investmentAmount
        );

        goldInvestment.setProfitLoss(
                BigDecimal.ZERO
        );

        goldInvestment.setPurchaseDate(
                LocalDate.now()
        );

        goldInvestment.setStatus(
                "ACTIVE"
        );

        // -------------------------------------------------
        // SAVE GOLD INVESTMENT
        // -------------------------------------------------

        GoldInvestment savedInvestment =
                goldInvestmentRepository.save(
                        goldInvestment
                );

        // -------------------------------------------------
        // DEBIT ACCOUNT
        // -------------------------------------------------

        account.setBalance(
                account.getBalance()
                       - investmentAmount.doubleValue() 
        );

        accountRepository.save(account);

        // -------------------------------------------------
        // SYNC CUSTOMER BALANCE
        // -------------------------------------------------

        customer.setBalance(
                account.getBalance()
        );

        customerRepository.save(customer);

        // -------------------------------------------------
        // CREATE TRANSACTION
        // -------------------------------------------------

        Transaction transaction =
                new Transaction();

        transaction.setSenderAccountNumber(
                account.getAccountNumber()
        );

        transaction.setReceiverAccountNumber(
                "GOLD-" + savedInvestment.getId()
        );

        transaction.setAmount(
                investmentAmount.doubleValue()
        );

        transaction.setTransactionType(
                "GOLD_PURCHASE"
        );

        transaction.setStatus(
                "SUCCESS"
        );

        transactionRepository.save(transaction);

        return savedInvestment;
    }

    // =====================================================
    // GET CUSTOMER GOLD INVESTMENTS
    // =====================================================

    public List<GoldInvestment> getCustomerGoldInvestments(
            String customerEmail) {

        Customer customer = customerRepository
                .findByEmail(customerEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found"
                        ));

        return goldInvestmentRepository
                .findByCustomerIdOrderByCreatedAtDesc(
                        customer.getId()
                );
    }

    // =====================================================
    // GET ACTIVE GOLD INVESTMENTS
    // =====================================================

    public List<GoldInvestment> getActiveGoldInvestments(
            String customerEmail) {

        Customer customer = customerRepository
                .findByEmail(customerEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found"
                        ));

        return goldInvestmentRepository
                .findByCustomerIdAndStatusOrderByCreatedAtDesc(
                        customer.getId(),
                        "ACTIVE"
                );
    }

    // =====================================================
    // GET GOLD INVESTMENT BY ID
    // =====================================================

    public GoldInvestment getGoldInvestmentById(
            Long investmentId,
            String customerEmail) {

        Customer customer = customerRepository
                .findByEmail(customerEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found"
                        ));

        GoldInvestment investment =
                goldInvestmentRepository
                        .findById(investmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Gold investment not found"
                                ));

        // -------------------------------------------------
        // OWNERSHIP CHECK
        // -------------------------------------------------

        if (investment.getCustomer() == null
                || !investment.getCustomer()
                        .getId()
                        .equals(customer.getId())) {

            throw new RuntimeException(
                    "You are not authorized to access this investment"
            );
        }
        return investment;
    }

    // =====================================================
// SELL / REDEEM GOLD
// =====================================================

@Transactional
public GoldInvestment sellGold(
        Long investmentId,
        String customerEmail) {

    // -------------------------------------------------
    // FIND CUSTOMER
    // -------------------------------------------------

    Customer customer = customerRepository
            .findByEmail(customerEmail)
            .orElseThrow(() ->
                    new RuntimeException(
                            "Customer not found"
                    ));

    // -------------------------------------------------
    // FIND GOLD INVESTMENT
    // -------------------------------------------------

    GoldInvestment investment =
            goldInvestmentRepository
                    .findById(investmentId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Gold investment not found"
                            ));

    // -------------------------------------------------
    // OWNERSHIP CHECK
    // -------------------------------------------------

    if (investment.getCustomer() == null
            || !investment.getCustomer()
                    .getId()
                    .equals(customer.getId())) {

        throw new RuntimeException(
                "You are not authorized to sell this investment"
        );
    }

    // -------------------------------------------------
    // STATUS CHECK
    // -------------------------------------------------

    if (!"ACTIVE".equalsIgnoreCase(
            investment.getStatus())) {

        throw new RuntimeException(
                "Only active gold investments can be sold"
        );
    }

    // -------------------------------------------------
    // GET LINKED ACCOUNT
    // -------------------------------------------------

    Account account = investment.getAccount();

    if (account == null) {

        throw new RuntimeException(
                "Linked account not found"
        );
    }

    // -------------------------------------------------
    // ACCOUNT STATUS CHECK
    // -------------------------------------------------

    if (account.getStatus() == null
            || !"ACTIVE".equalsIgnoreCase(
                    account.getStatus())) {

        throw new RuntimeException(
                "Linked account is not active"
        );
    }

    // -------------------------------------------------
    // GET CURRENT GOLD PRICE
    // -------------------------------------------------

    var goldPrice =
            goldPriceService.getPriceByPurity(
                    investment.getPurity()
            );

    // -------------------------------------------------
    // CALCULATE CURRENT VALUE
    // -------------------------------------------------

    BigDecimal currentPricePerGram =
            goldPrice.getPricePerGram();

    BigDecimal currentValue =
            investment.getQuantityGrams()
                    .multiply(currentPricePerGram)
                    .setScale(2, RoundingMode.HALF_UP);

    // -------------------------------------------------
    // CALCULATE PROFIT / LOSS
    // -------------------------------------------------

    BigDecimal profitLoss =
            currentValue
                    .subtract(
                            investment.getInvestmentAmount()
                    )
                    .setScale(
                            2,
                            RoundingMode.HALF_UP
                    );

    // -------------------------------------------------
    // UPDATE INVESTMENT
    // -------------------------------------------------

    investment.setCurrentPricePerGram(
            currentPricePerGram
    );

    investment.setCurrentValue(
            currentValue
    );

    investment.setProfitLoss(
            profitLoss
    );

    investment.setStatus(
            "SOLD"
    );

    // -------------------------------------------------
    // SAVE INVESTMENT
    // -------------------------------------------------

    GoldInvestment savedInvestment =
            goldInvestmentRepository.save(
                    investment
            );

    // -------------------------------------------------
    // CREDIT ACCOUNT
    // -------------------------------------------------

    account.setBalance(
            account.getBalance()
                    + currentValue.doubleValue()
    );

    accountRepository.save(account);

    // -------------------------------------------------
    // SYNC CUSTOMER BALANCE
    // -------------------------------------------------

    customer.setBalance(
            account.getBalance()
    );

    customerRepository.save(customer);

    // -------------------------------------------------
    // CREATE SALE TRANSACTION
    // -------------------------------------------------

    Transaction transaction =
            new Transaction();

    transaction.setSenderAccountNumber(
            "GOLD-SALE-"
                    + savedInvestment.getId()
    );

    transaction.setReceiverAccountNumber(
            account.getAccountNumber()
    );

    transaction.setAmount(
            currentValue.doubleValue()
    );

    transaction.setTransactionType(
            "GOLD_SALE"
    );

    transaction.setStatus(
            "SUCCESS"
    );

    transactionRepository.save(transaction);

    return savedInvestment;
}

}