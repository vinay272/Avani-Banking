package com.avanibank.backend.dto;

import com.avanibank.backend.entity.DailyClosingReport;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class DailyClosingReportResponse {

    private Long id;
    private String branchCode;
    private LocalDate closingDate;
    private BigDecimal openingCash;
    private BigDecimal cashReceived;
    private BigDecimal cashPaid;
    private BigDecimal closingCash;
    private Integer totalTransactions;
    private String status;
    private String closedByEmployeeCode;
    private LocalDateTime closedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DailyClosingReportResponse(DailyClosingReport report) {

        this.id = report.getId();
        this.branchCode = report.getBranchCode();
        this.closingDate = report.getClosingDate();
        this.openingCash = report.getOpeningCash();
        this.cashReceived = report.getCashReceived();
        this.cashPaid = report.getCashPaid();
        this.closingCash = report.getClosingCash();
        this.totalTransactions = report.getTotalTransactions();
        this.status = report.getStatus();
        this.closedByEmployeeCode = report.getClosedByEmployeeCode();
        this.closedAt = report.getClosedAt();
        this.createdAt = report.getCreatedAt();
        this.updatedAt = report.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getBranchCode() {
        return branchCode;
    }

    public LocalDate getClosingDate() {
        return closingDate;
    }

    public BigDecimal getOpeningCash() {
        return openingCash;
    }

    public BigDecimal getCashReceived() {
        return cashReceived;
    }

    public BigDecimal getCashPaid() {
        return cashPaid;
    }

    public BigDecimal getClosingCash() {
        return closingCash;
    }

    public Integer getTotalTransactions() {
        return totalTransactions;
    }

    public String getStatus() {
        return status;
    }

    public String getClosedByEmployeeCode() {
        return closedByEmployeeCode;
    }

    public LocalDateTime getClosedAt() {
        return closedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}