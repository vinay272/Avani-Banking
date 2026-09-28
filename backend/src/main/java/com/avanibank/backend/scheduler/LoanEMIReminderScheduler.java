package com.avanibank.backend.scheduler;

import com.avanibank.backend.service.LoanEMIReminderService;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class LoanEMIReminderScheduler {

    private final LoanEMIReminderService loanEMIReminderService;

    public LoanEMIReminderScheduler(
            LoanEMIReminderService loanEMIReminderService) {

        this.loanEMIReminderService = loanEMIReminderService;
    }

    @Scheduled(cron = "0 10 9 * * *")
    public void sendLoanEMIReminders() {

        int notificationCount =
                loanEMIReminderService.sendDueDateReminders();

        System.out.println(
                "Loan EMI Reminder Scheduler executed. "
                        + "Notifications sent: "
                        + notificationCount
        );
    }
}