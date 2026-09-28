package com.avanibank.backend.service;

import com.avanibank.backend.entity.Bond;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.FixedDeposit;
import com.avanibank.backend.entity.GoldInvestment;
import com.avanibank.backend.entity.SIP;
import com.avanibank.backend.repository.BondRepository;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.FixedDepositRepository;
import com.avanibank.backend.repository.GoldInvestmentRepository;
import com.avanibank.backend.repository.SIPRepository;
import com.avanibank.backend.entity.PortfolioSummary;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class PortfolioService {

    private final CustomerRepository customerRepository;
    private final FixedDepositRepository fixedDepositRepository;
    private final SIPRepository sipRepository;
    private final BondRepository bondRepository;
    private final GoldInvestmentRepository goldInvestmentRepository;

    public PortfolioService(
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

    public PortfolioSummary getPortfolioSummary(String customerEmail) {

        Customer customer = customerRepository
                .findByEmail(customerEmail)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found"));

        Long customerId = customer.getId();

        BigDecimal totalInvested = BigDecimal.ZERO;
        BigDecimal currentValue = BigDecimal.ZERO;

        BigDecimal fixedDepositValue = BigDecimal.ZERO;
        BigDecimal sipValue = BigDecimal.ZERO;
        BigDecimal bondValue = BigDecimal.ZERO;
        BigDecimal goldValue = BigDecimal.ZERO;

        int activeInvestments = 0;

        // =====================================================
        // FIXED DEPOSITS
        // =====================================================

        List<FixedDeposit> fixedDeposits =
                fixedDepositRepository
                        .findByCustomerIdOrderByCreatedAtDesc(customerId);

        for (FixedDeposit fd : fixedDeposits) {

            if (!"ACTIVE".equalsIgnoreCase(fd.getStatus())) {
                continue;
            }

            BigDecimal invested = BigDecimal.valueOf(
                    fd.getPrincipalAmount()
            );

            BigDecimal value = BigDecimal.valueOf(
                    fd.getMaturityAmount()
            );

            totalInvested = totalInvested.add(invested);
            currentValue = currentValue.add(value);
            fixedDepositValue = fixedDepositValue.add(value);

            activeInvestments++;
        }

        // =====================================================
        // SIP
        // =====================================================

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
             * SIP entity currently does not have a separate
             * currentValue field.
             *
             * Therefore, for portfolio display we use the
             * invested amount as the current base value.
             */
            BigDecimal value = invested;

            totalInvested = totalInvested.add(invested);
            currentValue = currentValue.add(value);
            sipValue = sipValue.add(value);

            activeInvestments++;
        }

        // =====================================================
        // BONDS
        // =====================================================

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

            totalInvested = totalInvested.add(invested);
            currentValue = currentValue.add(value);
            bondValue = bondValue.add(value);

            activeInvestments++;
        }

        // =====================================================
        // GOLD
        // =====================================================

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

            totalInvested = totalInvested.add(invested);
            currentValue = currentValue.add(value);
            goldValue = goldValue.add(value);

            activeInvestments++;
        }

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
        // RESPONSE
        // =====================================================

        PortfolioSummary summary = new PortfolioSummary();

        summary.setTotalInvested(
                totalInvested.setScale(2, RoundingMode.HALF_UP)
        );

        summary.setCurrentValue(
                currentValue.setScale(2, RoundingMode.HALF_UP)
        );

        summary.setTotalProfitLoss(
                totalProfitLoss.setScale(2, RoundingMode.HALF_UP)
        );

        summary.setReturnPercentage(returnPercentage);

        summary.setActiveInvestments(activeInvestments);

        summary.setMutualFundValue(BigDecimal.ZERO);

        summary.setFixedDepositValue(
                fixedDepositValue.setScale(2, RoundingMode.HALF_UP)
        );

        summary.setSipValue(
                sipValue.setScale(2, RoundingMode.HALF_UP)
        );

        summary.setBondValue(
                bondValue.setScale(2, RoundingMode.HALF_UP)
        );

        summary.setGoldValue(
                goldValue.setScale(2, RoundingMode.HALF_UP)
        );

        return summary;
    }

    // =========================================================
    // SAFE BIGDECIMAL
    // =========================================================

    private BigDecimal safeValue(BigDecimal value) {

        return value == null
                ? BigDecimal.ZERO
                : value;
    }
}