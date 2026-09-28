package com.avanibank.backend.scheduler;

import com.avanibank.backend.service.LoanNpaService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class LoanNpaScheduler {

    private final LoanNpaService loanNpaService;

    public LoanNpaScheduler(LoanNpaService loanNpaService) {
        this.loanNpaService = loanNpaService;
    }

    /**
     * Runs every day at 12:30 AM.
     */
    @Scheduled(cron = "0 30 0 * * *")
    public void monitorLoansForNpa() {

        int npaCount = loanNpaService.monitorAllActiveLoans();

        System.out.println(
                "Loan NPA monitoring completed. "
                        + "NPA loans detected: "
                        + npaCount
        );
    }
}