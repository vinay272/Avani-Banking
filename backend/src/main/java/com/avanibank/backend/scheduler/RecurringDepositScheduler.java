package com.avanibank.backend.scheduler;

import com.avanibank.backend.service.RecurringDepositService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RecurringDepositScheduler {

    private final RecurringDepositService recurringDepositService;

    public RecurringDepositScheduler(
            RecurringDepositService recurringDepositService) {

        this.recurringDepositService =
                recurringDepositService;
    }

    // =========================
    // AUTOMATIC RD INSTALLMENT
    // =========================
    //
    // Runs every day at 00:05 AM
    // and processes all due RD installments.
    //

    @Scheduled(cron = "0 5 0 * * *")
    public void processMonthlyInstallments() {

        System.out.println(
                "Starting automatic RD installment processing..."
        );

        recurringDepositService
                .processDueInstallments();

        System.out.println(
                "Automatic RD installment processing completed."
        );
    }
}