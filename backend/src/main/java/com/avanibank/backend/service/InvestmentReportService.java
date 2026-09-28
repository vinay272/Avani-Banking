package com.avanibank.backend.service;

import com.avanibank.backend.entity.Bond;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.FixedDeposit;
import com.avanibank.backend.entity.GoldInvestment;
import com.avanibank.backend.entity.InvestmentReport;
import com.avanibank.backend.entity.SIP;
import com.avanibank.backend.repository.BondRepository;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.FixedDepositRepository;
import com.avanibank.backend.repository.GoldInvestmentRepository;
import com.avanibank.backend.repository.SIPRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class InvestmentReportService {

    private final CustomerRepository customerRepository;
    private final FixedDepositRepository fixedDepositRepository;
    private final SIPRepository sipRepository;
    private final BondRepository bondRepository;
    private final GoldInvestmentRepository goldInvestmentRepository;

    public InvestmentReportService(
            CustomerRepository customerRepository,
            FixedDepositRepository fixedDepositRepository,
            SIPRepository sipRepository,
            BondRepository bondRepository,
            GoldInvestmentRepository goldInvestmentRepository) {

        this.customerRepository = customerRepository;
        this.fixedDepositRepository = fixedDepositRepository;
        this.sipRepository = sipRepository;
        this.bondRepository = bondRepository;
        this.goldInvestmentRepository = goldInvestmentRepository;
    }

    public InvestmentReport generateReport(String customerEmail) {

        Customer customer = customerRepository
                .findByEmail(customerEmail)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found"));

        Long customerId = customer.getId();

        // =====================================================
        // TOTALS
        // =====================================================

        BigDecimal totalInvested = BigDecimal.ZERO;
        BigDecimal currentValue = BigDecimal.ZERO;

        int totalInvestments = 0;
        int activeInvestments = 0;

        // =====================================================
        // FIXED DEPOSIT
        // =====================================================

        BigDecimal fdInvested = BigDecimal.ZERO;
        BigDecimal fdCurrentValue = BigDecimal.ZERO;
        int fdCount = 0;

        List<FixedDeposit> fixedDeposits =
                fixedDepositRepository
                        .findByCustomerIdOrderByCreatedAtDesc(customerId);

        for (FixedDeposit fd : fixedDeposits) {

            if (!"ACTIVE".equalsIgnoreCase(fd.getStatus())) {
                continue;
            }

            BigDecimal invested = fd.getPrincipalAmount() == null
                    ? BigDecimal.ZERO
                    : BigDecimal.valueOf(fd.getPrincipalAmount());

            BigDecimal value = fd.getMaturityAmount() == null
                    ? BigDecimal.ZERO
                    : BigDecimal.valueOf(fd.getMaturityAmount());

            fdInvested = fdInvested.add(invested);
            fdCurrentValue = fdCurrentValue.add(value);

            totalInvested = totalInvested.add(invested);
            currentValue = currentValue.add(value);

            fdCount++;
            activeInvestments++;
        }

        // =====================================================
        // SIP
        // =====================================================

        BigDecimal sipInvested = BigDecimal.ZERO;
        BigDecimal sipCurrentValue = BigDecimal.ZERO;
        int sipCount = 0;

        List<SIP> sips =
                sipRepository.findByCustomerIdOrderByCreatedAtDesc(
                        customerId
                );

        for (SIP sip : sips) {

            if (!"ACTIVE".equalsIgnoreCase(sip.getStatus())) {
                continue;
            }

            BigDecimal invested = safeValue(
                    sip.getTotalInvested()
            );

            /*
             * SIP entity currently has no currentValue field.
             * Therefore invested amount is used as current
             * portfolio base value.
             */
            BigDecimal value = invested;

            sipInvested = sipInvested.add(invested);
            sipCurrentValue = sipCurrentValue.add(value);

            totalInvested = totalInvested.add(invested);
            currentValue = currentValue.add(value);

            sipCount++;
            activeInvestments++;
        }

        // =====================================================
        // BONDS
        // =====================================================

        BigDecimal bondInvested = BigDecimal.ZERO;
        BigDecimal bondCurrentValue = BigDecimal.ZERO;
        int bondCount = 0;

        List<Bond> bonds =
                bondRepository.findByCustomerIdOrderByCreatedAtDesc(
                        customerId
                );

        for (Bond bond : bonds) {

            if (!"ACTIVE".equalsIgnoreCase(bond.getStatus())) {
                continue;
            }

            BigDecimal invested = safeValue(
                    bond.getInvestmentAmount()
            );

            BigDecimal value = safeValue(
                    bond.getCurrentValue()
            );

            bondInvested = bondInvested.add(invested);
            bondCurrentValue = bondCurrentValue.add(value);

            totalInvested = totalInvested.add(invested);
            currentValue = currentValue.add(value);

            bondCount++;
            activeInvestments++;
        }

        // =====================================================
        // GOLD
        // =====================================================

        BigDecimal goldInvested = BigDecimal.ZERO;
        BigDecimal goldCurrentValue = BigDecimal.ZERO;
        int goldCount = 0;

        List<GoldInvestment> goldInvestments =
                goldInvestmentRepository
                        .findByCustomerIdOrderByCreatedAtDesc(customerId);

        for (GoldInvestment gold : goldInvestments) {

            if (!"ACTIVE".equalsIgnoreCase(gold.getStatus())) {
                continue;
            }

            BigDecimal invested = safeValue(
                    gold.getInvestmentAmount()
            );

            BigDecimal value = safeValue(
                    gold.getCurrentValue()
            );

            goldInvested = goldInvested.add(invested);
            goldCurrentValue = goldCurrentValue.add(value);

            totalInvested = totalInvested.add(invested);
            currentValue = currentValue.add(value);

            goldCount++;
            activeInvestments++;
        }

        // =====================================================
        // MUTUAL FUNDS
        // =====================================================

        /*
         * Current Mutual Fund module contains fund catalogue
         * data only. Customer holdings/investment data is not
         * available yet.
         *
         * Therefore Mutual Fund values remain ZERO instead
         * of using dummy data.
         */

        BigDecimal mutualFundInvested = BigDecimal.ZERO;
        BigDecimal mutualFundCurrentValue = BigDecimal.ZERO;
        int mutualFundCount = 0;

        // =====================================================
        // PROFIT / LOSS
        // =====================================================

        BigDecimal totalProfitLoss =
                currentValue.subtract(totalInvested);

        BigDecimal returnPercentage = BigDecimal.ZERO;

        if (totalInvested.compareTo(BigDecimal.ZERO) > 0) {

            returnPercentage = totalProfitLoss
                    .multiply(BigDecimal.valueOf(100))
                    .divide(
                            totalInvested,
                            2,
                            RoundingMode.HALF_UP
                    );
        }

        // =====================================================
        // BUILD REPORT
        // =====================================================

        InvestmentReport report = new InvestmentReport();

        report.setGeneratedAt(LocalDateTime.now());

        report.setTotalInvested(
                scale(totalInvested)
        );

        report.setCurrentValue(
                scale(currentValue)
        );

        report.setTotalProfitLoss(
                scale(totalProfitLoss)
        );

        report.setReturnPercentage(
                returnPercentage
        );

        report.setTotalInvestments(
                activeInvestments
        );

        report.setActiveInvestments(
                activeInvestments
        );

        // Counts

        report.setFixedDepositCount(fdCount);
        report.setSipCount(sipCount);
        report.setBondCount(bondCount);
        report.setGoldCount(goldCount);
        report.setMutualFundCount(mutualFundCount);

        // Invested amounts

        report.setFixedDepositInvested(
                scale(fdInvested)
        );

        report.setSipInvested(
                scale(sipInvested)
        );

        report.setBondInvested(
                scale(bondInvested)
        );

        report.setGoldInvested(
                scale(goldInvested)
        );

        report.setMutualFundInvested(
                scale(mutualFundInvested)
        );

        // Current values

        report.setFixedDepositCurrentValue(
                scale(fdCurrentValue)
        );

        report.setSipCurrentValue(
                scale(sipCurrentValue)
        );

        report.setBondCurrentValue(
                scale(bondCurrentValue)
        );

        report.setGoldCurrentValue(
                scale(goldCurrentValue)
        );

        report.setMutualFundCurrentValue(
                scale(mutualFundCurrentValue)
        );

        return report;
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private BigDecimal safeValue(BigDecimal value) {

        return value == null
                ? BigDecimal.ZERO
                : value;
    }

    private BigDecimal scale(BigDecimal value) {

        return value.setScale(
                2,
                RoundingMode.HALF_UP
        );
    }
}