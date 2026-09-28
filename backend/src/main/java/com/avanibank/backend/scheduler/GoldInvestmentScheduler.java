package com.avanibank.backend.scheduler;

import com.avanibank.backend.entity.GoldInvestment;
import com.avanibank.backend.service.GoldPriceService;
import com.avanibank.backend.repository.GoldInvestmentRepository;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Component
public class GoldInvestmentScheduler {

    private final GoldInvestmentRepository goldInvestmentRepository;
    private final GoldPriceService goldPriceService;

    public GoldInvestmentScheduler(
            GoldInvestmentRepository goldInvestmentRepository,
            GoldPriceService goldPriceService) {

        this.goldInvestmentRepository =
                goldInvestmentRepository;

        this.goldPriceService =
                goldPriceService;
    }

    // =====================================================
    // DAILY GOLD VALUATION
    // =====================================================

    @Scheduled(cron = "0 15 1 * * *")
    @Transactional
    public void updateGoldInvestmentValues() {

        System.out.println(
                "========== GOLD VALUATION STARTED =========="
        );

        List<GoldInvestment> investments =
                goldInvestmentRepository.findAll();

        for (GoldInvestment investment : investments) {

            try {

                // -----------------------------------------
                // ONLY ACTIVE INVESTMENTS
                // -----------------------------------------

                if (!"ACTIVE".equalsIgnoreCase(
                        investment.getStatus())) {

                    continue;
                }

                // -----------------------------------------
                // GET CURRENT GOLD PRICE
                // -----------------------------------------

                var goldPrice =
                        goldPriceService.getPriceByPurity(
                                investment.getPurity()
                        );

                BigDecimal currentPricePerGram =
                        goldPrice.getPricePerGram();

                // -----------------------------------------
                // CALCULATE CURRENT VALUE
                // -----------------------------------------

                BigDecimal currentValue =
                        investment.getQuantityGrams()
                                .multiply(
                                        currentPricePerGram
                                )
                                .setScale(
                                        2,
                                        RoundingMode.HALF_UP
                                );

                // -----------------------------------------
                // CALCULATE PROFIT / LOSS
                // -----------------------------------------

                BigDecimal profitLoss =
                        currentValue
                                .subtract(
                                        investment
                                                .getInvestmentAmount()
                                )
                                .setScale(
                                        2,
                                        RoundingMode.HALF_UP
                                );

                // -----------------------------------------
                // UPDATE INVESTMENT
                // -----------------------------------------

                investment.setCurrentPricePerGram(
                        currentPricePerGram
                );

                investment.setCurrentValue(
                        currentValue
                );

                investment.setProfitLoss(
                        profitLoss
                );

                goldInvestmentRepository.save(
                        investment
                );

                System.out.println(
                        "Gold Investment ID "
                                + investment.getId()
                                + " updated | Value: ₹"
                                + currentValue
                                + " | P/L: ₹"
                                + profitLoss
                );

            } catch (Exception e) {

                // -----------------------------------------
                // ONE FAILURE SHOULD NOT STOP SCHEDULER
                // -----------------------------------------

                System.err.println(
                        "Failed to update Gold Investment ID "
                                + investment.getId()
                                + ": "
                                + e.getMessage()
                );
            }
        }

        System.out.println(
                "========== GOLD VALUATION COMPLETED =========="
        );
    }
}