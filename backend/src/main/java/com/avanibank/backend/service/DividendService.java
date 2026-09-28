package com.avanibank.backend.service;

import com.avanibank.backend.entity.Account;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.Dividend;
import com.avanibank.backend.entity.DividendSummary;
import com.avanibank.backend.repository.AccountRepository;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.DividendRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class DividendService {

    private final DividendRepository dividendRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;

    public DividendService(
            DividendRepository dividendRepository,
            CustomerRepository customerRepository,
            AccountRepository accountRepository) {

        this.dividendRepository = dividendRepository;
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
    }

    // =====================================================
    // RECORD DIVIDEND
    // =====================================================

    @Transactional
    public Dividend recordDividend(
            String customerEmail,
            Long accountId,
            String investmentType,
            String investmentName,
            BigDecimal dividendAmount,
            BigDecimal units,
            BigDecimal dividendPerUnit,
            LocalDate dividendDate) {

        // =================================================
        // VALIDATE BASIC INPUT
        // =================================================

        if (investmentType == null
                || investmentType.trim().isEmpty()) {

            throw new RuntimeException(
                    "Investment type is required"
            );
        }

        if (investmentName == null
                || investmentName.trim().isEmpty()) {

            throw new RuntimeException(
                    "Investment name is required"
            );
        }

        if (dividendAmount == null
                || dividendAmount.compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Dividend amount must be greater than zero"
            );
        }

        if (dividendDate == null) {
            dividendDate = LocalDate.now();
        }

        // =================================================
        // VALIDATE INVESTMENT TYPE
        // =================================================

        String type = investmentType.trim().toUpperCase();

        if (!type.equals("MUTUAL_FUND")
                && !type.equals("SIP")
                && !type.equals("BOND")
                && !type.equals("GOLD")
                && !type.equals("FIXED_DEPOSIT")) {

            throw new RuntimeException(
                    "Invalid investment type"
            );
        }

        // =================================================
        // FIND CUSTOMER
        // =================================================

        Customer customer =
                customerRepository
                        .findByEmail(customerEmail)
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
        // CALCULATE DIVIDEND PER UNIT IF POSSIBLE
        // =================================================

        BigDecimal calculatedPerUnit =
                dividendPerUnit;

        if (calculatedPerUnit == null
                && units != null
                && units.compareTo(BigDecimal.ZERO) > 0) {

            calculatedPerUnit =
                    dividendAmount.divide(
                            units,
                            4,
                            java.math.RoundingMode.HALF_UP
                    );
        }

        // =================================================
        // CREATE DIVIDEND
        // =================================================

        Dividend dividend = new Dividend();

        dividend.setCustomer(customer);
        dividend.setAccount(account);
        dividend.setInvestmentType(type);
        dividend.setInvestmentName(
                investmentName.trim()
        );
        dividend.setDividendAmount(dividendAmount);
        dividend.setUnits(units);
        dividend.setDividendPerUnit(calculatedPerUnit);
        dividend.setDividendDate(dividendDate);
        dividend.setStatus("RECEIVED");

        // =================================================
        // CREDIT DIVIDEND TO ACCOUNT
        // =================================================

        if (account.getBalance() == null) {
            account.setBalance(0.0);
        }

        account.setBalance(
                account.getBalance()
                        + dividendAmount.doubleValue()
        );

        // =================================================
        // SAVE ACCOUNT
        // =================================================

        accountRepository.save(account);

        // =================================================
        // SYNC CUSTOMER BALANCE
        // =================================================

        customer.setBalance(
                account.getBalance()
        );

        customerRepository.save(customer);

        // =================================================
        // SAVE DIVIDEND
        // =================================================

        return dividendRepository.save(dividend);
    }

    // =====================================================
    // GET ALL MY DIVIDENDS
    // =====================================================

    public List<Dividend> getMyDividends(
            String customerEmail) {

        Customer customer =
                customerRepository
                        .findByEmail(customerEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found"
                                )
                        );

        return dividendRepository
                .findByCustomerIdOrderByDividendDateDesc(
                        customer.getId()
                );
    }

    // =====================================================
    // GET RECEIVED DIVIDENDS
    // =====================================================

    public List<Dividend> getReceivedDividends(
            String customerEmail) {

        Customer customer =
                customerRepository
                        .findByEmail(customerEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found"
                                )
                        );

        return dividendRepository
                .findByCustomerIdAndStatusOrderByDividendDateDesc(
                        customer.getId(),
                        "RECEIVED"
                );
    }

    // =====================================================
    // GET DIVIDENDS BY INVESTMENT TYPE
    // =====================================================

    public List<Dividend> getDividendsByInvestmentType(
            String customerEmail,
            String investmentType) {

        Customer customer =
                customerRepository
                        .findByEmail(customerEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found"
                                )
                        );

        if (investmentType == null
                || investmentType.trim().isEmpty()) {

            throw new RuntimeException(
                    "Investment type is required"
            );
        }

        return dividendRepository
                .findByCustomerIdAndInvestmentTypeOrderByDividendDateDesc(
                        customer.getId(),
                        investmentType.trim().toUpperCase()
                );
    }

    // =====================================================
    // TOTAL DIVIDEND RECEIVED
    // =====================================================

    public BigDecimal getTotalDividendReceived(
            String customerEmail) {

        List<Dividend> dividends =
                getReceivedDividends(customerEmail);

        return dividends.stream()
                .map(Dividend::getDividendAmount)
                .filter(amount -> amount != null)
                .reduce(
                        BigDecimal.ZERO,
                        BigDecimal::add
                );
    }

    public DividendSummary getDividendSummary(
        String customerEmail) {

    Customer customer =
            customerRepository
                    .findByEmail(customerEmail)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Customer not found"
                            ));

    List<Dividend> dividends =
            dividendRepository
                    .findByCustomerIdAndStatusOrderByDividendDateDesc(
                            customer.getId(),
                            "RECEIVED"
                    );

    LocalDate today = LocalDate.now();

    BigDecimal totalDividend = BigDecimal.ZERO;
    BigDecimal currentMonthDividend = BigDecimal.ZERO;
    BigDecimal currentYearDividend = BigDecimal.ZERO;

    BigDecimal mutualFundDividend = BigDecimal.ZERO;
    BigDecimal sipDividend = BigDecimal.ZERO;
    BigDecimal bondDividend = BigDecimal.ZERO;
    BigDecimal goldDividend = BigDecimal.ZERO;
    BigDecimal fixedDepositDividend = BigDecimal.ZERO;

    for (Dividend dividend : dividends) {

        BigDecimal amount =
                dividend.getDividendAmount();

        if (amount == null) {
            continue;
        }

        totalDividend =
                totalDividend.add(amount);

        LocalDate dividendDate =
                dividend.getDividendDate();

        if (dividendDate != null) {

            if (dividendDate.getYear()
                    == today.getYear()) {

                currentYearDividend =
                        currentYearDividend.add(amount);
            }

            if (dividendDate.getYear()
                    == today.getYear()
                    && dividendDate.getMonth()
                    == today.getMonth()) {

                currentMonthDividend =
                        currentMonthDividend.add(amount);
            }
        }

        String type =
                dividend.getInvestmentType();

        if (type == null) {
            continue;
        }

        switch (type.toUpperCase()) {

            case "MUTUAL_FUND":
                mutualFundDividend =
                        mutualFundDividend.add(amount);
                break;

            case "SIP":
                sipDividend =
                        sipDividend.add(amount);
                break;

            case "BOND":
                bondDividend =
                        bondDividend.add(amount);
                break;

            case "GOLD":
                goldDividend =
                        goldDividend.add(amount);
                break;

            case "FIXED_DEPOSIT":
                fixedDepositDividend =
                        fixedDepositDividend.add(amount);
                break;

            default:
                break;
        }
    }

    DividendSummary summary =
            new DividendSummary();

    summary.setGeneratedAt(
            java.time.LocalDateTime.now()
    );

    summary.setTotalDividend(
            totalDividend
    );

    summary.setCurrentMonthDividend(
            currentMonthDividend
    );

    summary.setCurrentYearDividend(
            currentYearDividend
    );

    summary.setTotalRecords(
            dividends.size()
    );

    summary.setMutualFundDividend(
            mutualFundDividend
    );

    summary.setSipDividend(
            sipDividend
    );

    summary.setBondDividend(
            bondDividend
    );

    summary.setGoldDividend(
            goldDividend
    );

    summary.setFixedDepositDividend(
            fixedDepositDividend
    );

    return summary;
}

}