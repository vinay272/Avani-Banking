package com.avanibank.backend.service;

import com.avanibank.backend.entity.Bond;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.FixedDeposit;
import com.avanibank.backend.entity.GoldInvestment;
import com.avanibank.backend.entity.ProfitLossAnalysis;
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
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class ProfitLossAnalysisService {

    private final CustomerRepository customerRepository;
    private final FixedDepositRepository fixedDepositRepository;
    private final SIPRepository sipRepository;
    private final BondRepository bondRepository;
    private final GoldInvestmentRepository goldInvestmentRepository;

    public ProfitLossAnalysisService(
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

    public ProfitLossAnalysis analyzePortfolio(String customerEmail) {

        Customer customer = customerRepository
                .findByEmail(customerEmail)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found"));

        Long customerId = customer.getId();

        // =====================================================
        // TOTAL PORTFOLIO
        // =====================================================

        BigDecimal totalInvested = BigDecimal.ZERO;
        BigDecimal currentValue = BigDecimal.ZERO;

        // =====================================================
        // PRODUCT-WISE VALUES
        // =====================================================

        BigDecimal fdInvested = BigDecimal.ZERO;
        BigDecimal fdCurrentValue = BigDecimal.ZERO;

        BigDecimal sipInvested = BigDecimal.ZERO;
        BigDecimal sipCurrentValue = BigDecimal.ZERO;

        BigDecimal bondInvested = BigDecimal.ZERO;
        BigDecimal bondCurrentValue = BigDecimal.ZERO;

        BigDecimal goldInvested = BigDecimal.ZERO;
        BigDecimal goldCurrentValue = BigDecimal.ZERO;

        BigDecimal mutualFundInvested = BigDecimal.ZERO;
        BigDecimal mutualFundCurrentValue = BigDecimal.ZERO;

        // Used to determine best / lowest performer
        List<InvestmentPerformance> performances =
                new ArrayList<>();

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
        }

        addPerformance(
                performances,
                "Fixed Deposits",
                fdInvested,
                fdCurrentValue
        );

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

            BigDecimal invested =
                    safeValue(sip.getTotalInvested());

            /*
             * SIP entity currently does not contain a separate
             * currentValue field.
             *
             * Therefore current value is based on total invested
             * amount until an actual SIP valuation field/API
             * is introduced.
             */
            BigDecimal value = invested;

            sipInvested = sipInvested.add(invested);
            sipCurrentValue = sipCurrentValue.add(value);

            totalInvested = totalInvested.add(invested);
            currentValue = currentValue.add(value);
        }

        addPerformance(
                performances,
                "SIPs",
                sipInvested,
                sipCurrentValue
        );

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

            BigDecimal invested =
                    safeValue(bond.getInvestmentAmount());

            BigDecimal value =
                    safeValue(bond.getCurrentValue());

            bondInvested = bondInvested.add(invested);
            bondCurrentValue = bondCurrentValue.add(value);

            totalInvested = totalInvested.add(invested);
            currentValue = currentValue.add(value);
        }

        addPerformance(
                performances,
                "Bonds",
                bondInvested,
                bondCurrentValue
        );

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

            BigDecimal invested =
                    safeValue(gold.getInvestmentAmount());

            BigDecimal value =
                    safeValue(gold.getCurrentValue());

            goldInvested = goldInvested.add(invested);
            goldCurrentValue = goldCurrentValue.add(value);

            totalInvested = totalInvested.add(invested);
            currentValue = currentValue.add(value);
        }

        addPerformance(
                performances,
                "Gold",
                goldInvested,
                goldCurrentValue
        );

        // =====================================================
        // MUTUAL FUNDS
        // =====================================================

        /*
         * Current Mutual Fund module contains fund catalogue
         * data only. Customer holdings are not available yet.
         *
         * Therefore no dummy P/L is generated.
         */

        addPerformance(
                performances,
                "Mutual Funds",
                mutualFundInvested,
                mutualFundCurrentValue
        );

        // =====================================================
        // OVERALL PROFIT / LOSS
        // =====================================================

        BigDecimal totalProfitLoss =
                currentValue.subtract(totalInvested);

        BigDecimal returnPercentage =
                calculateReturn(
                        totalInvested,
                        totalProfitLoss
                );

        String overallStatus;

        if (totalProfitLoss.compareTo(BigDecimal.ZERO) > 0) {
            overallStatus = "PROFIT";
        } else if (totalProfitLoss.compareTo(BigDecimal.ZERO) < 0) {
            overallStatus = "LOSS";
        } else {
            overallStatus = "NO_CHANGE";
        }

        // =====================================================
        // BEST PERFORMER
        // =====================================================

        InvestmentPerformance best =
                performances.stream()
                        .filter(p ->
                                p.getInvested()
                                        .compareTo(BigDecimal.ZERO) > 0)
                        .max(
                                Comparator.comparing(
                                        InvestmentPerformance::getReturnPercentage
                                )
                        )
                        .orElse(null);

        // =====================================================
        // LOWEST PERFORMER
        // =====================================================

        InvestmentPerformance lowest =
                performances.stream()
                        .filter(p ->
                                p.getInvested()
                                        .compareTo(BigDecimal.ZERO) > 0)
                        .min(
                                Comparator.comparing(
                                        InvestmentPerformance::getReturnPercentage
                                )
                        )
                        .orElse(null);

        // =====================================================
        // BUILD RESPONSE
        // =====================================================

        ProfitLossAnalysis analysis =
                new ProfitLossAnalysis();

        analysis.setGeneratedAt(
                LocalDateTime.now()
        );

        analysis.setTotalInvested(
                scale(totalInvested)
        );

        analysis.setCurrentValue(
                scale(currentValue)
        );

        analysis.setTotalProfitLoss(
                scale(totalProfitLoss)
        );

        analysis.setReturnPercentage(
                returnPercentage
        );

        analysis.setOverallStatus(
                overallStatus
        );

        // Best performer

        if (best != null) {

            analysis.setBestPerformingInvestment(
                    best.getName()
            );

            analysis.setBestPerformingProfitLoss(
                    scale(best.getProfitLoss())
            );

            analysis.setBestPerformingReturn(
                    best.getReturnPercentage()
            );

        } else {

            analysis.setBestPerformingInvestment(
                    "No active investment"
            );

            analysis.setBestPerformingProfitLoss(
                    BigDecimal.ZERO.setScale(2)
            );

            analysis.setBestPerformingReturn(
                    BigDecimal.ZERO
            );
        }

        // Lowest performer

        if (lowest != null) {

            analysis.setLowestPerformingInvestment(
                    lowest.getName()
            );

            analysis.setLowestPerformingProfitLoss(
                    scale(lowest.getProfitLoss())
            );

            analysis.setLowestPerformingReturn(
                    lowest.getReturnPercentage()
            );

        } else {

            analysis.setLowestPerformingInvestment(
                    "No active investment"
            );

            analysis.setLowestPerformingProfitLoss(
                    BigDecimal.ZERO.setScale(2)
            );

            analysis.setLowestPerformingReturn(
                    BigDecimal.ZERO
            );
        }

        // =====================================================
        // PRODUCT-WISE P/L
        // =====================================================

        analysis.setFixedDepositProfitLoss(
                scale(
                        fdCurrentValue.subtract(fdInvested)
                )
        );

        analysis.setFixedDepositReturn(
                calculateReturn(
                        fdInvested,
                        fdCurrentValue.subtract(fdInvested)
                )
        );

        analysis.setSipProfitLoss(
                scale(
                        sipCurrentValue.subtract(sipInvested)
                )
        );

        analysis.setSipReturn(
                calculateReturn(
                        sipInvested,
                        sipCurrentValue.subtract(sipInvested)
                )
        );

        analysis.setBondProfitLoss(
                scale(
                        bondCurrentValue.subtract(bondInvested)
                )
        );

        analysis.setBondReturn(
                calculateReturn(
                        bondInvested,
                        bondCurrentValue.subtract(bondInvested)
                )
        );

        analysis.setGoldProfitLoss(
                scale(
                        goldCurrentValue.subtract(goldInvested)
                )
        );

        analysis.setGoldReturn(
                calculateReturn(
                        goldInvested,
                        goldCurrentValue.subtract(goldInvested)
                )
        );

        analysis.setMutualFundProfitLoss(
                BigDecimal.ZERO.setScale(2)
        );

        analysis.setMutualFundReturn(
                BigDecimal.ZERO
        );

        return analysis;
    }

    // =========================================================
    // ADD PERFORMANCE
    // =========================================================

    private void addPerformance(
            List<InvestmentPerformance> performances,
            String name,
            BigDecimal invested,
            BigDecimal currentValue) {

        BigDecimal profitLoss =
                currentValue.subtract(invested);

        BigDecimal returnPercentage =
                calculateReturn(
                        invested,
                        profitLoss
                );

        performances.add(
                new InvestmentPerformance(
                        name,
                        invested,
                        currentValue,
                        profitLoss,
                        returnPercentage
                )
        );
    }

    // =========================================================
    // CALCULATE RETURN
    // =========================================================

    private BigDecimal calculateReturn(
            BigDecimal invested,
            BigDecimal profitLoss) {

        if (invested == null ||
                invested.compareTo(BigDecimal.ZERO) <= 0) {

            return BigDecimal.ZERO;
        }

        return profitLoss
                .multiply(BigDecimal.valueOf(100))
                .divide(
                        invested,
                        2,
                        RoundingMode.HALF_UP
                );
    }

    // =========================================================
    // SAFE VALUE
    // =========================================================

    private BigDecimal safeValue(BigDecimal value) {

        return value == null
                ? BigDecimal.ZERO
                : value;
    }

    // =========================================================
    // SCALE
    // =========================================================

    private BigDecimal scale(BigDecimal value) {

        return value.setScale(
                2,
                RoundingMode.HALF_UP
        );
    }

    // =========================================================
    // INTERNAL PERFORMANCE OBJECT
    // =========================================================

    private static class InvestmentPerformance {

        private final String name;
        private final BigDecimal invested;
        private final BigDecimal currentValue;
        private final BigDecimal profitLoss;
        private final BigDecimal returnPercentage;

        public InvestmentPerformance(
                String name,
                BigDecimal invested,
                BigDecimal currentValue,
                BigDecimal profitLoss,
                BigDecimal returnPercentage) {

            this.name = name;
            this.invested = invested;
            this.currentValue = currentValue;
            this.profitLoss = profitLoss;
            this.returnPercentage = returnPercentage;
        }

        public String getName() {
            return name;
        }

        public BigDecimal getInvested() {
            return invested;
        }

        public BigDecimal getCurrentValue() {
            return currentValue;
        }

        public BigDecimal getProfitLoss() {
            return profitLoss;
        }

        public BigDecimal getReturnPercentage() {
            return returnPercentage;
        }
    }
}