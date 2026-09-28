package com.avanibank.backend.scheduler;

import com.avanibank.backend.entity.FixedDeposit;
import com.avanibank.backend.service.FixedDepositService;
import com.avanibank.backend.service.InvestmentMaturityAlertService;
import com.avanibank.backend.repository.FixedDepositRepository;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class FixedDepositScheduler {

    private final FixedDepositRepository fixedDepositRepository;
    private final InvestmentMaturityAlertService investmentMaturityAlertService;

    public FixedDepositScheduler(
            FixedDepositRepository fixedDepositRepository,
            InvestmentMaturityAlertService investmentMaturityAlertService) {

        this.fixedDepositRepository = fixedDepositRepository;
        this.investmentMaturityAlertService =
                investmentMaturityAlertService;
    }

    // =====================================================
    // INVESTMENT MATURITY ALERT CHECK
    // =====================================================

    @Scheduled(cron = "0 10 0 * * *")
    public void checkInvestmentMaturityAlerts() {

        LocalDateTime now = LocalDateTime.now();

        LocalDateTime alertUntil =
                now.plusDays(365);

        List<FixedDeposit> fixedDeposits =
                fixedDepositRepository
                        .findByStatusAndMaturityDateBetween(
                                "ACTIVE",
                                now,
                                alertUntil
                        );
        System.out.println(
        "FD MATURITY CHECK: Found "
                + fixedDeposits.size()
                + " eligible ACTIVE FD(s)"
        );

        for (FixedDeposit fixedDeposit : fixedDeposits) {


    System.out.println(
            "FD MATURITY ALERT: Processing FD ID = "
                    + fixedDeposit.getId()
                    + ", maturityDate = "
                    + fixedDeposit.getMaturityDate()
    );

            try {

                investmentMaturityAlertService.sendMaturityAlert(
                        fixedDeposit.getCustomer(),
                        fixedDeposit.getId(),
                        "Fixed Deposit",
                        fixedDeposit.getMaturityDate().toLocalDate(),
                        fixedDeposit.getMaturityAmount()
                );

            } catch (Exception e) {

                System.out.println(
                        "Investment maturity alert failed for FD ID "
                                + fixedDeposit.getId()
                                + ": "
                                + e.getMessage()
                );
            }
        }
    }
}