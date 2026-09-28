package com.avanibank.backend.scheduler;

import com.avanibank.backend.entity.Account;
import com.avanibank.backend.entity.SIP;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.repository.AccountRepository;
import com.avanibank.backend.repository.SIPRepository;
import com.avanibank.backend.repository.TransactionRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Component
public class SIPScheduler {

    private final SIPRepository sipRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    public SIPScheduler(
            SIPRepository sipRepository,
            AccountRepository accountRepository,
            TransactionRepository transactionRepository
    ) {
        this.sipRepository = sipRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
    }

    // =========================
    // SIP INSTALLMENT PROCESSOR
    // =========================
    //
    // Runs every day at 12:30 AM
    //
    @Scheduled(cron = "0 30 0 * * *")
    @Transactional
    public void processSIPInstallments() {

        LocalDate today = LocalDate.now();

        List<SIP> allSIPs = sipRepository.findAll();

        for (SIP sip : allSIPs) {

            try {

                if (!"ACTIVE".equalsIgnoreCase(sip.getStatus())) {
                    continue;
                }

                if (sip.getNextInstallmentDate() == null) {
                    continue;
                }

                if (sip.getNextInstallmentDate().isAfter(today)) {
                    continue;
                }

                processSingleSIPInstallment(sip, today);

            } catch (Exception e) {

                System.err.println(
                        "SIP installment failed for SIP ID "
                                + sip.getId()
                                + ": "
                                + e.getMessage()
                );
            }
        }
    }

    // =========================
    // PROCESS SINGLE SIP
    // =========================

    private void processSingleSIPInstallment(
            SIP sip,
            LocalDate today
    ) {

        Account account = sip.getAccount();

        if (account == null) {
            return;
        }

        // =========================
        // ACCOUNT STATUS CHECK
        // =========================

        if (!"ACTIVE".equalsIgnoreCase(account.getStatus())) {

            System.err.println(
                    "SIP ID " + sip.getId()
                            + " skipped because account is not ACTIVE."
            );

            return;
        }

        BigDecimal monthlyAmount =
                sip.getMonthlyAmount();

        if (monthlyAmount == null ||
                monthlyAmount.compareTo(BigDecimal.ZERO) <= 0) {

            return;
        }

        // =========================
        // BALANCE CHECK
        // =========================

        BigDecimal accountBalance =
                BigDecimal.valueOf(
                        account.getBalance() == null
                                ? 0.0
                                : account.getBalance()
                );

        if (accountBalance.compareTo(monthlyAmount) < 0) {

            /*
             * Insufficient balance:
             * Do not debit the account.
             * Do not increase installmentsPaid.
             * Do not increase totalInvested.
             *
             * Move the installment to next month so that
             * the same installment is not repeatedly attempted
             * every day.
             */

            sip.setNextInstallmentDate(
                    sip.getNextInstallmentDate()
                            .plusMonths(1)
            );

            sipRepository.save(sip);

            System.err.println(
                    "SIP ID " + sip.getId()
                            + " skipped due to insufficient balance."
            );

            return;
        }

        // =========================
        // DEBIT ACCOUNT
        // =========================

        BigDecimal newBalance =
                accountBalance.subtract(monthlyAmount);

        account.setBalance(
                newBalance
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        )
                        .doubleValue()
        );

        accountRepository.save(account);

        // =========================
        // UPDATE SIP
        // =========================

        int currentInstallments =
                sip.getInstallmentsPaid() == null
                        ? 0
                        : sip.getInstallmentsPaid();

        sip.setInstallmentsPaid(
                currentInstallments + 1
        );

        BigDecimal currentTotalInvested =
                sip.getTotalInvested() == null
                        ? BigDecimal.ZERO
                        : sip.getTotalInvested();

        sip.setTotalInvested(
                currentTotalInvested
                        .add(monthlyAmount)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        )
        );

        // =========================
        // MATURITY CHECK
        // =========================

        if (
                sip.getInstallmentsPaid()
                        >= sip.getTenureMonths()
        ) {

            sip.setStatus("MATURED");

            sip.setNextInstallmentDate(
                    sip.getMaturityDate()
            );

        } else {

            sip.setNextInstallmentDate(
                    sip.getNextInstallmentDate()
                            .plusMonths(1)
            );
        }

        sipRepository.save(sip);

        // =========================
        // TRANSACTION RECORD
        // =========================

        Transaction transaction =
                new Transaction();

        transaction.setSenderAccountNumber(
                account.getAccountNumber()
        );

        transaction.setReceiverAccountNumber(
                "SIP-" + sip.getId()
        );

        transaction.setAmount(
                monthlyAmount.doubleValue()
        );

        transaction.setTransactionType(
                "SIP_INSTALLMENT"
        );

        transaction.setStatus(
                "SUCCESS"
        );

        transactionRepository.save(transaction);

        System.out.println(
                "SIP installment processed successfully. "
                        + "SIP ID: "
                        + sip.getId()
                        + ", Amount: ₹"
                        + monthlyAmount
        );
    }
}