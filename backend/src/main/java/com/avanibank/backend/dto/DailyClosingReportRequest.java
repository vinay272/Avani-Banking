package com.avanibank.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class DailyClosingReportRequest {

    @NotBlank(message = "Branch code is required")
    private String branchCode;

    @NotNull(message = "Closing date is required")
    private LocalDate closingDate;

    @NotNull(message = "Opening cash is required")
    @DecimalMin(value = "0.00", message = "Opening cash cannot be negative")
    private BigDecimal openingCash;

    @NotNull(message = "Cash received is required")
    @DecimalMin(value = "0.00", message = "Cash received cannot be negative")
    private BigDecimal cashReceived;

    @NotNull(message = "Cash paid is required")
    @DecimalMin(value = "0.00", message = "Cash paid cannot be negative")
    private BigDecimal cashPaid;

    @NotNull(message = "Total transactions is required")
    @DecimalMin(value = "0", message = "Total transactions cannot be negative")
    private Integer totalTransactions;

    private String closedByEmployeeCode;

    // =========================
    // GETTERS & SETTERS
    // =========================

    public String getBranchCode() {
        return branchCode;
    }

    public void setBranchCode(String branchCode) {
        this.branchCode = branchCode;
    }

    public LocalDate getClosingDate() {
        return closingDate;
    }

    public void setClosingDate(LocalDate closingDate) {
        this.closingDate = closingDate;
    }

    public BigDecimal getOpeningCash() {
        return openingCash;
    }

    public void setOpeningCash(BigDecimal openingCash) {
        this.openingCash = openingCash;
    }

    public BigDecimal getCashReceived() {
        return cashReceived;
    }

    public void setCashReceived(BigDecimal cashReceived) {
        this.cashReceived = cashReceived;
    }

    public BigDecimal getCashPaid() {
        return cashPaid;
    }

    public void setCashPaid(BigDecimal cashPaid) {
        this.cashPaid = cashPaid;
    }

    public Integer getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(Integer totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public String getClosedByEmployeeCode() {
        return closedByEmployeeCode;
    }

    public void setClosedByEmployeeCode(String closedByEmployeeCode) {
        this.closedByEmployeeCode = closedByEmployeeCode;
    }
}