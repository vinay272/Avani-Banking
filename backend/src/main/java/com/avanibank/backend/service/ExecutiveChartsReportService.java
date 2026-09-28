package com.avanibank.backend.service;

import com.avanibank.backend.entity.Account;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.FraudAlert;
import com.avanibank.backend.entity.Loan;
import com.avanibank.backend.entity.LoanRepaymentSchedule;
import com.avanibank.backend.entity.Transaction;

import com.avanibank.backend.repository.AccountRepository;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.FraudAlertRepository;
import com.avanibank.backend.repository.LoanRepaymentScheduleRepository;
import com.avanibank.backend.repository.LoanRepository;
import com.avanibank.backend.repository.TransactionRepository;

import com.avanibank.backend.dto.ExecutiveChartsResponse;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExecutiveChartsReportService {

    private final TransactionRepository transactionRepository;
    private final LoanRepository loanRepository;
    private final LoanRepaymentScheduleRepository loanRepaymentScheduleRepository;
    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final FraudAlertRepository fraudAlertRepository;

    public ExecutiveChartsReportService(
            TransactionRepository transactionRepository,
            LoanRepository loanRepository,
            LoanRepaymentScheduleRepository loanRepaymentScheduleRepository,
            AccountRepository accountRepository,
            CustomerRepository customerRepository,
            FraudAlertRepository fraudAlertRepository) {

        this.transactionRepository = transactionRepository;
        this.loanRepository = loanRepository;
        this.loanRepaymentScheduleRepository =
                loanRepaymentScheduleRepository;
        this.accountRepository = accountRepository;
        this.customerRepository = customerRepository;
        this.fraudAlertRepository = fraudAlertRepository;
    }

    public ExecutiveChartsResponse getCharts() {

        return new ExecutiveChartsResponse(
                buildRevenueTrend(),
                buildTransactionVolume(),
                buildLoanDistribution(),
                buildDepositGrowth(),
                buildFraudAnalysis(),
                buildCustomerGrowth()
        );
    }

    // =========================================================
    // REVENUE TREND
    // =========================================================

    private List<Map<String, Object>> buildRevenueTrend() {

        Map<String, Double> monthlyRevenue =
                new LinkedHashMap<>();

        List<LoanRepaymentSchedule> schedules =
                loanRepaymentScheduleRepository.findAll();

        for (LoanRepaymentSchedule schedule : schedules) {

            if (schedule.getPaidDate() == null) {
                continue;
            }

            if (!"PAID".equalsIgnoreCase(schedule.getStatus())) {
                continue;
            }

            LocalDate paidDate =
                    schedule.getPaidDate();

            String month =
                    YearMonth.from(paidDate).toString();

            double interest =
                    schedule.getInterestAmount() == null
                            ? 0.0
                            : schedule.getInterestAmount();

            monthlyRevenue.put(
                    month,
                    monthlyRevenue.getOrDefault(month, 0.0)
                            + interest
            );
        }

        List<Map<String, Object>> result =
                new ArrayList<>();

        monthlyRevenue.forEach((month, amount) -> {

            Map<String, Object> data =
                    new LinkedHashMap<>();

            data.put("month", month);
            data.put("revenue", amount);

            result.add(data);
        });

        return result;
    }

    // =========================================================
    // TRANSACTION VOLUME
    // =========================================================

    private List<Map<String, Object>> buildTransactionVolume() {

        Map<String, Map<String, Object>> monthlyData =
                new LinkedHashMap<>();

        List<Transaction> transactions =
                transactionRepository.findAll();

        for (Transaction transaction : transactions) {

            LocalDateTime transactionDate =
                    transaction.getTransactionDate();

            if (transactionDate == null) {
                continue;
            }

            String month =
                    YearMonth.from(
                            transactionDate.toLocalDate()
                    ).toString();

            Map<String, Object> data =
                    monthlyData.computeIfAbsent(
                            month,
                            key -> {

                                Map<String, Object> map =
                                        new LinkedHashMap<>();

                                map.put("month", month);
                                map.put("transactionCount", 0L);
                                map.put("transactionAmount", 0.0);

                                return map;
                            }
                    );

            long count =
                    (Long) data.get("transactionCount");

            data.put(
                    "transactionCount",
                    count + 1
            );

            double amount =
                    transaction.getAmount() == null
                            ? 0.0
                            : transaction.getAmount();

            double currentAmount =
                    (Double) data.get("transactionAmount");

            data.put(
                    "transactionAmount",
                    currentAmount + amount
            );
        }

        return new ArrayList<>(
                monthlyData.values()
        );
    }

    // =========================================================
    // LOAN DISTRIBUTION
    // =========================================================

    private List<Map<String, Object>> buildLoanDistribution() {

        Map<String, Map<String, Object>> loanMap =
                new LinkedHashMap<>();

        List<Loan> loans =
                loanRepository.findAll();

        for (Loan loan : loans) {

            String rawLoanType =
        loan.getLoanType();

final String loanType =
        rawLoanType == null || rawLoanType.isBlank()
                ? "UNKNOWN"
                : rawLoanType;

            Map<String, Object> data =
                    loanMap.computeIfAbsent(
                            loanType,
                            key -> {

                                Map<String, Object> map =
                                        new LinkedHashMap<>();

                                map.put("loanType", loanType);
                                map.put("loanCount", 0L);
                                map.put("approvedAmount", 0.0);

                                return map;
                            }
                    );

            long count =
                    (Long) data.get("loanCount");

            data.put(
                    "loanCount",
                    count + 1
            );

            double approvedAmount =
                    loan.getApprovedAmount() == null
                            ? 0.0
                            : loan.getApprovedAmount();

            double currentAmount =
                    (Double) data.get("approvedAmount");

            data.put(
                    "approvedAmount",
                    currentAmount + approvedAmount
            );
        }

        return new ArrayList<>(
                loanMap.values()
        );
    }

    // =========================================================
    // DEPOSIT GROWTH
    // =========================================================

    private List<Map<String, Object>> buildDepositGrowth() {

        Map<String, Double> monthlyDeposits =
                new LinkedHashMap<>();

        List<Account> accounts =
                accountRepository.findAll();

        for (Account account : accounts) {

            if (account.getCreatedAt() == null) {
                continue;
            }

            if (!"ACTIVE".equalsIgnoreCase(
                    account.getStatus())) {

                continue;
            }

            String month =
                    YearMonth.from(
                            account.getCreatedAt().toLocalDate()
                    ).toString();

            double balance =
                    account.getBalance() == null
                            ? 0.0
                            : account.getBalance();

            monthlyDeposits.put(
                    month,
                    monthlyDeposits.getOrDefault(month, 0.0)
                            + balance
            );
        }

        List<Map<String, Object>> result =
                new ArrayList<>();

        double cumulativeDeposit = 0.0;

        for (Map.Entry<String, Double> entry :
                monthlyDeposits.entrySet()) {

            cumulativeDeposit += entry.getValue();

            Map<String, Object> data =
                    new LinkedHashMap<>();

            data.put("month", entry.getKey());
            data.put("depositAmount", entry.getValue());
            data.put("cumulativeDeposit", cumulativeDeposit);

            result.add(data);
        }

        return result;
    }

    // =========================================================
    // FRAUD ANALYSIS
    // =========================================================

    private List<Map<String, Object>> buildFraudAnalysis() {

        Map<String, Long> riskMap =
                new LinkedHashMap<>();

        riskMap.put("LOW", 0L);
        riskMap.put("MEDIUM", 0L);
        riskMap.put("HIGH", 0L);
        riskMap.put("CRITICAL", 0L);

        List<FraudAlert> alerts =
                fraudAlertRepository.findAll();

        for (FraudAlert alert : alerts) {

            String riskLevel =
                    alert.getRiskLevel();

            if (riskLevel == null ||
                    riskLevel.isBlank()) {

                riskLevel = "UNKNOWN";
            }

            riskMap.put(
                    riskLevel.toUpperCase(),
                    riskMap.getOrDefault(
                            riskLevel.toUpperCase(),
                            0L
                    ) + 1
            );
        }

        List<Map<String, Object>> result =
                new ArrayList<>();

        for (Map.Entry<String, Long> entry :
                riskMap.entrySet()) {

            Map<String, Object> data =
                    new LinkedHashMap<>();

            data.put("riskLevel", entry.getKey());
            data.put("caseCount", entry.getValue());

            result.add(data);
        }

        return result;
    }

    // =========================================================
    // CUSTOMER GROWTH
    // =========================================================

    private List<Map<String, Object>> buildCustomerGrowth() {

        Map<String, Long> monthlyCustomers =
                new LinkedHashMap<>();

        List<Customer> customers =
                customerRepository.findAll();

        for (Customer customer : customers) {

            if (customer.getCreatedAt() == null) {
                continue;
            }

            String month =
                    YearMonth.from(
                            customer.getCreatedAt().toLocalDate()
                    ).toString();

            monthlyCustomers.put(
                    month,
                    monthlyCustomers.getOrDefault(month, 0L)
                            + 1
            );
        }

        List<Map<String, Object>> result =
                new ArrayList<>();

        long cumulativeCustomers = 0;

        for (Map.Entry<String, Long> entry :
                monthlyCustomers.entrySet()) {

            cumulativeCustomers += entry.getValue();

            Map<String, Object> data =
                    new LinkedHashMap<>();

            data.put("month", entry.getKey());
            data.put("newCustomers", entry.getValue());
            data.put(
                    "totalCustomers",
                    cumulativeCustomers
            );

            result.add(data);
        }

        return result;
    }
}