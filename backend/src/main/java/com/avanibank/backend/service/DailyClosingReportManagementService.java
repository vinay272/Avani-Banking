package com.avanibank.backend.service;

import com.avanibank.backend.dto.DailyClosingReportRequest;
import com.avanibank.backend.dto.DailyClosingReportResponse;
import com.avanibank.backend.entity.DailyClosingReport;
import com.avanibank.backend.repository.BranchRepository;
import com.avanibank.backend.repository.DailyClosingReportRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DailyClosingReportManagementService {

    private final DailyClosingReportRepository reportRepository;
    private final BranchRepository branchRepository;

    public DailyClosingReportManagementService(
            DailyClosingReportRepository reportRepository,
            BranchRepository branchRepository
    ) {
        this.reportRepository = reportRepository;
        this.branchRepository = branchRepository;
    }

    // =========================
    // CREATE DAILY CLOSING REPORT
    // =========================

    public DailyClosingReportResponse createReport(
            DailyClosingReportRequest request
    ) {

        if (!branchRepository.existsByBranchCode(request.getBranchCode())) {
            throw new RuntimeException("Branch code not found");
        }

        if (reportRepository.existsByBranchCodeAndClosingDate(
                request.getBranchCode(),
                request.getClosingDate()
        )) {
            throw new RuntimeException(
                    "Daily closing report already exists for this branch and date"
            );
        }

        if (request.getClosingDate().isAfter(LocalDate.now())) {
            throw new RuntimeException(
                    "Closing date cannot be in the future"
            );
        }

        if (request.getCashReceived().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException(
                    "Cash received cannot be negative"
            );
        }

        if (request.getCashPaid().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException(
                    "Cash paid cannot be negative"
            );
        }

        if (request.getOpeningCash().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException(
                    "Opening cash cannot be negative"
            );
        }

        if (request.getTotalTransactions() < 0) {
            throw new RuntimeException(
                    "Total transactions cannot be negative"
            );
        }

        BigDecimal closingCash = request.getOpeningCash()
                .add(request.getCashReceived())
                .subtract(request.getCashPaid());

        if (closingCash.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException(
                    "Closing cash cannot be negative"
            );
        }

        DailyClosingReport report = new DailyClosingReport();

        report.setBranchCode(request.getBranchCode());
        report.setClosingDate(request.getClosingDate());
        report.setOpeningCash(request.getOpeningCash());
        report.setCashReceived(request.getCashReceived());
        report.setCashPaid(request.getCashPaid());
        report.setClosingCash(closingCash);
        report.setTotalTransactions(request.getTotalTransactions());
        report.setStatus("CLOSED");
        report.setClosedByEmployeeCode(
                request.getClosedByEmployeeCode()
        );
        report.setClosedAt(LocalDateTime.now());

        DailyClosingReport savedReport =
                reportRepository.save(report);

        return new DailyClosingReportResponse(savedReport);
    }

    // =========================
    // GET ALL REPORTS
    // =========================

    public List<DailyClosingReportResponse> getAllReports() {

        return reportRepository.findAll()
                .stream()
                .map(DailyClosingReportResponse::new)
                .toList();
    }

    // =========================
    // GET REPORT BY ID
    // =========================

    public DailyClosingReportResponse getReportById(Long id) {

        DailyClosingReport report = reportRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Daily closing report not found"
                        )
                );

        return new DailyClosingReportResponse(report);
    }

    // =========================
    // GET REPORT BY BRANCH
    // =========================

    public List<DailyClosingReportResponse> getReportsByBranch(
            String branchCode
    ) {

        if (!branchRepository.existsByBranchCode(branchCode)) {
            throw new RuntimeException("Branch code not found");
        }

        return reportRepository
                .findByBranchCodeOrderByClosingDateDesc(branchCode)
                .stream()
                .map(DailyClosingReportResponse::new)
                .toList();
    }

    // =========================
    // GET REPORT BY STATUS
    // =========================

    public List<DailyClosingReportResponse> getReportsByStatus(
            String status
    ) {

        if (!"OPEN".equalsIgnoreCase(status)
                && !"CLOSED".equalsIgnoreCase(status)) {

            throw new RuntimeException(
                    "Invalid status. Use OPEN or CLOSED"
            );
        }

        return reportRepository
                .findByStatusOrderByClosingDateDesc(
                        status.toUpperCase()
                )
                .stream()
                .map(DailyClosingReportResponse::new)
                .toList();
    }

    // =========================
    // GET REPORT BY BRANCH + DATE
    // =========================

    public DailyClosingReportResponse getReportByBranchAndDate(
            String branchCode,
            LocalDate closingDate
    ) {

        DailyClosingReport report =
                reportRepository
                        .findByBranchCodeAndClosingDate(
                                branchCode,
                                closingDate
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Daily closing report not found"
                                )
                        );

        return new DailyClosingReportResponse(report);
    }
}