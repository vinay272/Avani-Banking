package com.avanibank.backend.service;

import com.avanibank.backend.dto.BranchAnalyticsResponse;
import com.avanibank.backend.entity.ATM;
import com.avanibank.backend.entity.Branch;
import com.avanibank.backend.entity.CashCounter;
import com.avanibank.backend.entity.DailyClosingReport;
import com.avanibank.backend.entity.Employee;
import com.avanibank.backend.entity.Vault;
import com.avanibank.backend.repository.ATMRepository;
import com.avanibank.backend.repository.BranchRepository;
import com.avanibank.backend.repository.CashCounterRepository;
import com.avanibank.backend.repository.DailyClosingReportRepository;
import com.avanibank.backend.repository.EmployeeRepository;
import com.avanibank.backend.repository.VaultRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class BranchAnalyticsService {

    private final BranchRepository branchRepository;
    private final EmployeeRepository employeeRepository;
    private final CashCounterRepository cashCounterRepository;
    private final ATMRepository atmRepository;
    private final VaultRepository vaultRepository;
    private final DailyClosingReportRepository dailyClosingReportRepository;

    public BranchAnalyticsService(
            BranchRepository branchRepository,
            EmployeeRepository employeeRepository,
            CashCounterRepository cashCounterRepository,
            ATMRepository atmRepository,
            VaultRepository vaultRepository,
            DailyClosingReportRepository dailyClosingReportRepository) {

        this.branchRepository = branchRepository;
        this.employeeRepository = employeeRepository;
        this.cashCounterRepository = cashCounterRepository;
        this.atmRepository = atmRepository;
        this.vaultRepository = vaultRepository;
        this.dailyClosingReportRepository = dailyClosingReportRepository;
    }

    public BranchAnalyticsResponse getBranchAnalytics(String branchCode) {

        Branch branch = branchRepository.findByBranchCode(branchCode)
                .orElseThrow(() -> new RuntimeException("Branch code not found"));

        List<Employee> employees =
                employeeRepository.findByBranchCodeOrderByCreatedAtDesc(branchCode);

        List<CashCounter> cashCounters =
                cashCounterRepository.findByBranchCodeOrderByCreatedAtDesc(branchCode);

        List<ATM> atms =
                atmRepository.findByBranchCodeOrderByCreatedAtDesc(branchCode);

        List<Vault> vaults =
                vaultRepository.findByBranchCodeOrderByCreatedAtDesc(branchCode);

        List<DailyClosingReport> reports =
                dailyClosingReportRepository.findByBranchCodeOrderByClosingDateDesc(branchCode);

        BranchAnalyticsResponse response = new BranchAnalyticsResponse();

        response.setBranchCode(branch.getBranchCode());
        response.setBranchName(branch.getBranchName());
        response.setCity(branch.getCity());
        response.setState(branch.getState());
        response.setStatus(branch.getStatus());

        response.setTotalEmployees(employees.size());
        response.setActiveEmployees(
                employees.stream()
                        .filter(e -> "ACTIVE".equalsIgnoreCase(e.getStatus()))
                        .count()
        );

        response.setTotalCashCounters(cashCounters.size());
        response.setActiveCashCounters(
                cashCounters.stream()
                        .filter(c -> "ACTIVE".equalsIgnoreCase(c.getStatus()))
                        .count()
        );

        response.setTotalATMs(atms.size());
        response.setActiveATMs(
                atms.stream()
                        .filter(a -> "ACTIVE".equalsIgnoreCase(a.getStatus()))
                        .count()
        );

        response.setTotalVaults(vaults.size());
        response.setActiveVaults(
                vaults.stream()
                        .filter(v -> "ACTIVE".equalsIgnoreCase(v.getStatus()))
                        .count()
        );

        BigDecimal totalVaultCapacity = vaults.stream()
                .map(Vault::getTotalCapacity)
                .filter(value -> value != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalVaultBalance = vaults.stream()
                .map(Vault::getCurrentBalance)
                .filter(value -> value != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        response.setTotalVaultCapacity(totalVaultCapacity);
        response.setTotalVaultBalance(totalVaultBalance);

        if (!reports.isEmpty()) {
            DailyClosingReport latestReport = reports.get(0);

            response.setLatestClosingCash(latestReport.getClosingCash());
            response.setLatestTransactionCount(
                    latestReport.getTotalTransactions()
            );
        } else {
            response.setLatestClosingCash(BigDecimal.ZERO);
            response.setLatestTransactionCount(0);
        }

        return response;
    }
}