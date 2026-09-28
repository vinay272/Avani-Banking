package com.avanibank.backend.service;

import com.avanibank.backend.entity.Bond;
import com.avanibank.backend.entity.FixedDeposit;
import com.avanibank.backend.entity.GoldInvestment;
import com.avanibank.backend.entity.SIP;

import com.avanibank.backend.repository.BondRepository;
import com.avanibank.backend.repository.FixedDepositRepository;
import com.avanibank.backend.repository.GoldInvestmentRepository;
import com.avanibank.backend.repository.SIPRepository;

import com.avanibank.backend.dto.InvestmentReportResponse;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExecutiveInvestmentReportService {

    private final FixedDepositRepository fixedDepositRepository;
    private final SIPRepository sipRepository;
    private final BondRepository bondRepository;
    private final GoldInvestmentRepository goldInvestmentRepository;

    public ExecutiveInvestmentReportService(
            FixedDepositRepository fixedDepositRepository,
            SIPRepository sipRepository,
            BondRepository bondRepository,
            GoldInvestmentRepository goldInvestmentRepository) {

        this.fixedDepositRepository = fixedDepositRepository;
        this.sipRepository = sipRepository;
        this.bondRepository = bondRepository;
        this.goldInvestmentRepository = goldInvestmentRepository;
    }

    public InvestmentReportResponse getInvestmentReport() {

        List<Map<String, Object>> investments =
                new ArrayList<>();

        Map<String, Long> investmentTypeSummary =
                new LinkedHashMap<>();

        Map<String, Long> investmentStatusSummary =
                new LinkedHashMap<>();

        double totalInvestedAmount = 0.0;
        double totalCurrentValue = 0.0;
        double totalProfitLoss = 0.0;

        long totalInvestments = 0;

        // =====================================================
        // FIXED DEPOSITS
        // =====================================================

        List<FixedDeposit> fixedDeposits =
                fixedDepositRepository.findAll();

        for (FixedDeposit fd : fixedDeposits) {

            totalInvestments++;

            double invested =
                    fd.getPrincipalAmount() != null
                            ? fd.getPrincipalAmount()
                            : 0.0;

            double currentValue =
                    fd.getMaturityAmount() != null
                            ? fd.getMaturityAmount()
                            : invested;

            double profitLoss =
                    currentValue - invested;

            totalInvestedAmount += invested;
            totalCurrentValue += currentValue;
            totalProfitLoss += profitLoss;

            addTypeCount(
                    investmentTypeSummary,
                    "FIXED_DEPOSIT"
            );

            addStatusCount(
                    investmentStatusSummary,
                    fd.getStatus()
            );

            Map<String, Object> data =
                    new LinkedHashMap<>();

            data.put("id", fd.getId());
            data.put("type", "FIXED_DEPOSIT");
            data.put(
                    "customerId",
                    fd.getCustomer() != null
                            ? fd.getCustomer().getId()
                            : null
            );
            data.put("principalAmount", invested);
            data.put("currentValue", currentValue);
            data.put("profitLoss", profitLoss);
            data.put("interestRate", fd.getInterestRate());
            data.put("tenureMonths", fd.getTenureMonths());
            data.put("maturityDate", fd.getMaturityDate());
            data.put("status", fd.getStatus());

            investments.add(data);
        }

        // =====================================================
        // SIP
        // =====================================================

        List<SIP> sips =
                sipRepository.findAll();

        for (SIP sip : sips) {

            totalInvestments++;

            double invested =
                    sip.getTotalInvested() != null
                            ? sip.getTotalInvested().doubleValue()
                            : 0.0;

            /*
             * SIP entity does not contain currentValue.
             * Therefore current value is represented by
             * total invested amount for this report.
             */
            double currentValue = invested;

            double profitLoss = 0.0;

            totalInvestedAmount += invested;
            totalCurrentValue += currentValue;
            totalProfitLoss += profitLoss;

            addTypeCount(
                    investmentTypeSummary,
                    "SIP"
            );

            addStatusCount(
                    investmentStatusSummary,
                    sip.getStatus()
            );

            Map<String, Object> data =
                    new LinkedHashMap<>();

            data.put("id", sip.getId());
            data.put("type", "SIP");
            data.put(
                    "customerId",
                    sip.getCustomer() != null
                            ? sip.getCustomer().getId()
                            : null
            );
            data.put(
                    "monthlyAmount",
                    sip.getMonthlyAmount()
            );
            data.put(
                    "totalInvested",
                    sip.getTotalInvested()
            );
            data.put(
                    "currentValue",
                    currentValue
            );
            data.put(
                    "profitLoss",
                    profitLoss
            );
            data.put(
                    "expectedReturnRate",
                    sip.getExpectedReturnRate()
            );
            data.put(
                    "tenureMonths",
                    sip.getTenureMonths()
            );
            data.put(
                    "installmentsPaid",
                    sip.getInstallmentsPaid()
            );
            data.put(
                    "startDate",
                    sip.getStartDate()
            );
            data.put(
                    "maturityDate",
                    sip.getMaturityDate()
            );
            data.put(
                    "status",
                    sip.getStatus()
            );

            investments.add(data);
        }

        // =====================================================
        // BONDS
        // =====================================================

        List<Bond> bonds =
                bondRepository.findAll();

        for (Bond bond : bonds) {

            totalInvestments++;

            double invested =
                    bond.getInvestmentAmount() != null
                            ? bond.getInvestmentAmount().doubleValue()
                            : 0.0;

            double currentValue =
                    bond.getCurrentValue() != null
                            ? bond.getCurrentValue().doubleValue()
                            : invested;

            double profitLoss =
                    currentValue - invested;

            totalInvestedAmount += invested;
            totalCurrentValue += currentValue;
            totalProfitLoss += profitLoss;

            addTypeCount(
                    investmentTypeSummary,
                    "BOND"
            );

            addStatusCount(
                    investmentStatusSummary,
                    bond.getStatus()
            );

            Map<String, Object> data =
                    new LinkedHashMap<>();

            data.put("id", bond.getId());
            data.put("type", "BOND");
            data.put(
                    "customerId",
                    bond.getCustomer() != null
                            ? bond.getCustomer().getId()
                            : null
            );
            data.put(
                    "bondName",
                    bond.getBondName()
            );
            data.put(
                    "bondType",
                    bond.getBondType()
            );
            data.put(
                    "investmentAmount",
                    bond.getInvestmentAmount()
            );
            data.put(
                    "currentValue",
                    bond.getCurrentValue()
            );
            data.put(
                    "totalInterestEarned",
                    bond.getTotalInterestEarned()
            );
            data.put(
                    "profitLoss",
                    profitLoss
            );
            data.put(
                    "couponRate",
                    bond.getCouponRate()
            );
            data.put(
                    "purchaseDate",
                    bond.getPurchaseDate()
            );
            data.put(
                    "maturityDate",
                    bond.getMaturityDate()
            );
            data.put(
                    "status",
                    bond.getStatus()
            );

            investments.add(data);
        }

        // =====================================================
        // GOLD INVESTMENTS
        // =====================================================

        List<GoldInvestment> goldInvestments =
                goldInvestmentRepository.findAll();

        for (GoldInvestment gold : goldInvestments) {

            totalInvestments++;

            double invested =
                    gold.getInvestmentAmount() != null
                            ? gold.getInvestmentAmount().doubleValue()
                            : 0.0;

            double currentValue =
                    gold.getCurrentValue() != null
                            ? gold.getCurrentValue().doubleValue()
                            : invested;

            double profitLoss =
                    gold.getProfitLoss() != null
                            ? gold.getProfitLoss().doubleValue()
                            : currentValue - invested;

            totalInvestedAmount += invested;
            totalCurrentValue += currentValue;
            totalProfitLoss += profitLoss;

            addTypeCount(
                    investmentTypeSummary,
                    "GOLD"
            );

            addStatusCount(
                    investmentStatusSummary,
                    gold.getStatus()
            );

            Map<String, Object> data =
                    new LinkedHashMap<>();

            data.put("id", gold.getId());
            data.put("type", "GOLD");
            data.put(
                    "customerId",
                    gold.getCustomer() != null
                            ? gold.getCustomer().getId()
                            : null
            );
            data.put(
                    "goldType",
                    gold.getGoldType()
            );
            data.put(
                    "purity",
                    gold.getPurity()
            );
            data.put(
                    "quantityGrams",
                    gold.getQuantityGrams()
            );
            data.put(
                    "investmentAmount",
                    gold.getInvestmentAmount()
            );
            data.put(
                    "currentValue",
                    gold.getCurrentValue()
            );
            data.put(
                    "profitLoss",
                    gold.getProfitLoss()
            );
            data.put(
                    "purchaseDate",
                    gold.getPurchaseDate()
            );
            data.put(
                    "status",
                    gold.getStatus()
            );

            investments.add(data);
        }

        // =====================================================
        // RESPONSE
        // =====================================================

        return new InvestmentReportResponse(
                totalInvestments,
                round(totalInvestedAmount),
                round(totalCurrentValue),
                round(totalProfitLoss),
                fixedDeposits.size(),
                sips.size(),
                bonds.size(),
                goldInvestments.size(),
                investmentTypeSummary,
                investmentStatusSummary,
                investments
        );
    }

    // =====================================================
    // TYPE COUNT
    // =====================================================

    private void addTypeCount(
            Map<String, Long> map,
            String type) {

        map.put(
                type,
                map.getOrDefault(type, 0L) + 1
        );
    }

    // =====================================================
    // STATUS COUNT
    // =====================================================

    private void addStatusCount(
            Map<String, Long> map,
            String status) {

        if (status == null || status.isBlank()) {
            status = "UNKNOWN";
        }

        map.put(
                status.toUpperCase(),
                map.getOrDefault(
                        status.toUpperCase(),
                        0L
                ) + 1
        );
    }

    // =====================================================
    // ROUNDING
    // =====================================================

    private double round(double value) {

        return BigDecimal
                .valueOf(value)
                .setScale(
                        2,
                        java.math.RoundingMode.HALF_UP
                )
                .doubleValue();
    }
}
