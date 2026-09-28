package com.avanibank.backend.service;

import com.avanibank.backend.entity.Account;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.SIP;
import com.avanibank.backend.repository.AccountRepository;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.SIPRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class SIPService {

    private final SIPRepository sipRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;

    public SIPService(
            SIPRepository sipRepository,
            CustomerRepository customerRepository,
            AccountRepository accountRepository
    ) {
        this.sipRepository = sipRepository;
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
    }

    // =========================
    // CREATE SIP
    // =========================

    @Transactional
    public SIP createSIP(
            String email,
            Long accountId,
            BigDecimal monthlyAmount,
            BigDecimal expectedReturnRate,
            Integer tenureMonths,
            LocalDate startDate
    ) {

        Customer customer = customerRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found")
                );

        Account account = accountRepository
                .findById(accountId)
                .orElseThrow(() ->
                        new RuntimeException("Account not found")
                );

        // =========================
        // ACCOUNT OWNERSHIP CHECK
        // =========================

        if (account.getCustomer() == null ||
                !account.getCustomer().getId().equals(customer.getId())) {

            throw new RuntimeException(
                    "You are not authorized to use this account"
            );
        }

        // =========================
        // VALIDATION
        // =========================

        if (monthlyAmount == null ||
                monthlyAmount.compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Monthly SIP amount must be greater than zero"
            );
        }

        if (expectedReturnRate == null ||
                expectedReturnRate.compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Expected return rate cannot be negative"
            );
        }

        if (tenureMonths == null || tenureMonths <= 0) {

            throw new RuntimeException(
                    "SIP tenure must be greater than zero"
            );
        }

        if (startDate == null) {
            startDate = LocalDate.now();
        }

        if (startDate.isBefore(LocalDate.now())) {

            throw new RuntimeException(
                    "SIP start date cannot be in the past"
            );
        }

        // =========================
        // CREATE SIP
        // =========================

        SIP sip = new SIP();

        sip.setCustomer(customer);
        sip.setAccount(account);

        sip.setMonthlyAmount(
                monthlyAmount.setScale(2, RoundingMode.HALF_UP)
        );

        sip.setExpectedReturnRate(
                expectedReturnRate.setScale(2, RoundingMode.HALF_UP)
        );

        sip.setTenureMonths(tenureMonths);

        sip.setStartDate(startDate);

        sip.setNextInstallmentDate(startDate);

        sip.setMaturityDate(
                startDate.plusMonths(tenureMonths)
        );

        sip.setInstallmentsPaid(0);

        sip.setTotalInvested(BigDecimal.ZERO);

        sip.setFrequency("MONTHLY");

        sip.setStatus("ACTIVE");

        return sipRepository.save(sip);
    }

    // =========================
    // GET ALL CUSTOMER SIPs
    // =========================

    public List<SIP> getCustomerSIPs(String email) {

        Customer customer = customerRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found")
                );

        return sipRepository
                .findByCustomerIdOrderByCreatedAtDesc(
                        customer.getId()
                );
    }

    // =========================
    // GET ACTIVE SIPs
    // =========================

    public List<SIP> getActiveSIPs(String email) {

        Customer customer = customerRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found")
                );

        return sipRepository
                .findByCustomerIdAndStatusOrderByCreatedAtDesc(
                        customer.getId(),
                        "ACTIVE"
                );
    }

    // =========================
    // GET SIP BY ID
    // =========================

    public SIP getSIPById(
            Long sipId,
            String email
    ) {

        Customer customer = customerRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found")
                );

        return sipRepository
                .findByIdAndCustomerId(
                        sipId,
                        customer.getId()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "SIP not found or unauthorized"
                        )
                );
    }

    // =========================
    // PAUSE SIP
    // =========================

    @Transactional
    public SIP pauseSIP(
            Long sipId,
            String email
    ) {

        SIP sip = getSIPById(sipId, email);

        if (!"ACTIVE".equalsIgnoreCase(sip.getStatus())) {

            throw new RuntimeException(
                    "Only active SIP can be paused"
            );
        }

        sip.setStatus("PAUSED");

        return sipRepository.save(sip);
    }

    // =========================
    // RESUME SIP
    // =========================

    @Transactional
    public SIP resumeSIP(
            Long sipId,
            String email
    ) {

        SIP sip = getSIPById(sipId, email);

        if (!"PAUSED".equalsIgnoreCase(sip.getStatus())) {

            throw new RuntimeException(
                    "Only paused SIP can be resumed"
            );
        }

        sip.setStatus("ACTIVE");

        return sipRepository.save(sip);
    }

    // =========================
    // CANCEL SIP
    // =========================

    @Transactional
    public SIP cancelSIP(
            Long sipId,
            String email
    ) {

        SIP sip = getSIPById(sipId, email);

        if ("CANCELLED".equalsIgnoreCase(sip.getStatus())) {

            throw new RuntimeException(
                    "SIP is already cancelled"
            );
        }

        if ("MATURED".equalsIgnoreCase(sip.getStatus())) {

            throw new RuntimeException(
                    "Matured SIP cannot be cancelled"
            );
        }

        sip.setStatus("CANCELLED");

        return sipRepository.save(sip);
    }

    // =========================
    // PROJECTED MATURITY VALUE
    // =========================

    public BigDecimal calculateProjectedValue(
            SIP sip
    ) {

        BigDecimal monthlyInvestment =
                sip.getMonthlyAmount();

        BigDecimal annualRate =
                sip.getExpectedReturnRate();

        int months =
                sip.getTenureMonths();

        if (monthlyInvestment == null ||
                annualRate == null ||
                months <= 0) {

            return BigDecimal.ZERO;
        }

        /*
         * SIP future value formula:
         *
         * FV = P × [((1+r)^n - 1) / r] × (1+r)
         *
         * P = monthly investment
         * r = monthly expected return
         * n = number of months
         */

        BigDecimal monthlyRate =
                annualRate
                        .divide(
                                BigDecimal.valueOf(1200),
                                10,
                                RoundingMode.HALF_UP
                        );

        BigDecimal projectedValue;

        if (monthlyRate.compareTo(BigDecimal.ZERO) == 0) {

            projectedValue =
                    monthlyInvestment.multiply(
                            BigDecimal.valueOf(months)
                    );

        } else {

            double p =
                    monthlyInvestment.doubleValue();

            double r =
                    monthlyRate.doubleValue();

            double n = months;

            double futureValue =
                    p *
                    (
                        (Math.pow(1 + r, n) - 1)
                        / r
                    ) *
                    (1 + r);

            projectedValue =
                    BigDecimal.valueOf(futureValue);
        }

        return projectedValue.setScale(
                2,
                RoundingMode.HALF_UP
        );
    }

    // =========================
    // PROJECTED PROFIT
    // =========================

    public BigDecimal calculateProjectedProfit(
            SIP sip
    ) {

        BigDecimal projectedValue =
                calculateProjectedValue(sip);

        BigDecimal totalInvestment =
                sip.getMonthlyAmount()
                        .multiply(
                                BigDecimal.valueOf(
                                        sip.getTenureMonths()
                                )
                        );

        return projectedValue
                .subtract(totalInvestment)
                .setScale(
                        2,
                        RoundingMode.HALF_UP
                );
    }
}