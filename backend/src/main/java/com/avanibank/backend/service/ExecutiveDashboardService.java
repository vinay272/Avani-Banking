package com.avanibank.backend.service;

import com.avanibank.backend.dto.ExecutiveDashboardResponse;
import com.avanibank.backend.entity.Account;
import com.avanibank.backend.entity.Card;
import com.avanibank.backend.entity.FixedDeposit;
import com.avanibank.backend.entity.Loan;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.entity.LoanRepaymentSchedule;
import com.avanibank.backend.entity.BranchAppointment;
import com.avanibank.backend.repository.BranchAppointmentRepository;
import com.avanibank.backend.repository.LoanRepaymentScheduleRepository;
import com.avanibank.backend.repository.AccountRepository;
import com.avanibank.backend.repository.CardRepository;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.FixedDepositRepository;
import com.avanibank.backend.repository.FraudAlertRepository;
import com.avanibank.backend.repository.LoanRepository;
import com.avanibank.backend.repository.TransactionRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExecutiveDashboardService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final LoanRepository loanRepository;
    private final CardRepository cardRepository;
    private final FixedDepositRepository fixedDepositRepository;
    private final FraudAlertRepository fraudAlertRepository;
    private final LoanRepaymentScheduleRepository loanRepaymentScheduleRepository;
    private final BranchAppointmentRepository branchAppointmentRepository;
    public ExecutiveDashboardService(
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            TransactionRepository transactionRepository,
            LoanRepository loanRepository,
            CardRepository cardRepository,
            FixedDepositRepository fixedDepositRepository,
            FraudAlertRepository fraudAlertRepository,
            LoanRepaymentScheduleRepository loanRepaymentScheduleRepository,
            BranchAppointmentRepository branchAppointmentRepository
        ) {

        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.loanRepository = loanRepository;
        this.cardRepository = cardRepository;
        this.fixedDepositRepository = fixedDepositRepository;
        this.fraudAlertRepository = fraudAlertRepository;
        this.loanRepaymentScheduleRepository = loanRepaymentScheduleRepository;
        this.branchAppointmentRepository = branchAppointmentRepository;
    }

    public ExecutiveDashboardResponse getDashboardMetrics() {

        // ==========================================
        // TOTAL CUSTOMERS
        // ==========================================

        long totalCustomers = customerRepository.count();

        // ==========================================
        // TOTAL DEPOSITS
        // ==========================================

        double totalDeposits = accountRepository.findAll()
                .stream()
                .filter(account -> "ACTIVE".equalsIgnoreCase(
                        account.getStatus()))
                .mapToDouble(account -> account.getBalance() == null
                        ? 0.0
                        : account.getBalance())
                .sum();

        // ==========================================
        // TOTAL LOANS
        // ==========================================

        double totalLoans = loanRepository.findAll()
                .stream()
                .filter(loan -> loan.getApprovedAmount() != null)
                .filter(loan -> !"REJECTED".equalsIgnoreCase(
                        loan.getStatus()))
                .filter(loan -> !"FORECLOSED".equalsIgnoreCase(
                        loan.getStatus()))
                .mapToDouble(loan -> loan.getApprovedAmount())
                .sum();

        // ==========================================
        // DAILY TRANSACTIONS
        // ==========================================

        LocalDate today = LocalDate.now();

        long dailyTransactions = transactionRepository.findAll()
                .stream()
                .filter(transaction -> transaction.getTransactionDate() != null)
                .filter(transaction -> transaction.getTransactionDate()
                        .toLocalDate()
                        .equals(today))
                .count();

        // ==========================================
        // FRAUD CASES
        // ==========================================

        long fraudCases = fraudAlertRepository.count();

        // ==========================================
        // ACTIVE CARDS
        // ==========================================

        long activeCards = cardRepository.findAll()
                .stream()
                .filter(card -> "ACTIVE".equalsIgnoreCase(
                        card.getStatus()))
                .count();

        // ==========================================
        // INVESTMENT PORTFOLIO
        // ==========================================

        double investmentPortfolio = fixedDepositRepository.findAll()
                .stream()
                .filter(fd -> !"MATURED".equalsIgnoreCase(
                        fd.getStatus()))
                .mapToDouble(fd -> fd.getMaturityAmount() == null
                        ? 0.0
                        : fd.getMaturityAmount())
                .sum();

        // ==========================================
        // LOAN RECOVERY RATE
        // ==========================================
        //
        // Actual LoanPayment aggregation will be
        // connected after the existing LoanPayment
        // structure is confirmed.
        //

        double totalRelevantAmount = 0.0;
        double totalRecoveredAmount = 0.0;
        double revenue = 0.0;

        List<LoanRepaymentSchedule> repaymentSchedules = loanRepaymentScheduleRepository.findAll();

        for (LoanRepaymentSchedule schedule : repaymentSchedules) {

            double emiAmount = schedule.getEmiAmount() != null
                    ? schedule.getEmiAmount()
                    : 0.0;

            String status = schedule.getStatus();

            if ("PAID".equalsIgnoreCase(status)) {

                totalRelevantAmount += emiAmount;
                totalRecoveredAmount += emiAmount;

                // Realized loan interest income
                if (schedule.getInterestAmount() != null) {
                    revenue += schedule.getInterestAmount();
                }

            } else if ("PENDING".equalsIgnoreCase(status)) {

                totalRelevantAmount += emiAmount;
            }
        }

        double loanRecoveryRate = totalRelevantAmount > 0
                ? (totalRecoveredAmount / totalRelevantAmount) * 100
                : 0.0;

        // ==========================================
        // BRANCH PERFORMANCE
        // ==========================================
        //
        // Will be connected with Branch data in the
        // Branch & Employee Management module.
        //

List<Map<String, Object>> branchPerformance = new ArrayList<>();

List<BranchAppointment> appointments =
        branchAppointmentRepository.findAll();

Map<String, Map<String, Object>> branchMap =
        new LinkedHashMap<>();

for (BranchAppointment appointment : appointments) {

    String branchCode = appointment.getBranchCode();
    String branchName = appointment.getBranchName();

    if (branchCode == null || branchCode.isBlank()) {
        continue;
    }

    Map<String, Object> branchData =
            branchMap.computeIfAbsent(branchCode, key -> {

                Map<String, Object> data =
                        new LinkedHashMap<>();

                data.put("branchCode", branchCode);
                data.put("branchName", branchName);
                data.put("totalAppointments", 0);
                data.put("bookedAppointments", 0);
                data.put("completedAppointments", 0);
                data.put("cancelledAppointments", 0);

                return data;
            });

    int total =
            (Integer) branchData.get("totalAppointments");

    branchData.put(
            "totalAppointments",
            total + 1
    );

    String status = appointment.getStatus();

    if ("BOOKED".equalsIgnoreCase(status)) {

        int booked =
                (Integer) branchData
                        .get("bookedAppointments");

        branchData.put(
                "bookedAppointments",
                booked + 1
        );

    } else if ("COMPLETED".equalsIgnoreCase(status)) {

        int completed =
                (Integer) branchData
                        .get("completedAppointments");

        branchData.put(
                "completedAppointments",
                completed + 1
        );

    } else if ("CANCELLED".equalsIgnoreCase(status)) {

        int cancelled =
                (Integer) branchData
                        .get("cancelledAppointments");

        branchData.put(
                "cancelledAppointments",
                cancelled + 1
        );
    }
}

branchPerformance.addAll(branchMap.values());
        // ==========================================
        // RESPONSE
        // ==========================================

        return new ExecutiveDashboardResponse(
                totalCustomers,
                totalDeposits,
                totalLoans,
                dailyTransactions,
                loanRecoveryRate,
                fraudCases,
                activeCards,
                investmentPortfolio,
                revenue,
                branchPerformance);
    }
}