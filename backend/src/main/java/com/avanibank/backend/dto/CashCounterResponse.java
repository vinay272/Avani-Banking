package com.avanibank.backend.dto;

import com.avanibank.backend.entity.CashCounter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CashCounterResponse {

    private Long id;
    private String counterCode;
    private String counterName;
    private String branchCode;
    private String assignedEmployeeCode;
    private BigDecimal openingBalance;
    private BigDecimal currentBalance;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CashCounterResponse(CashCounter counter) {
        this.id = counter.getId();
        this.counterCode = counter.getCounterCode();
        this.counterName = counter.getCounterName();
        this.branchCode = counter.getBranchCode();
        this.assignedEmployeeCode = counter.getAssignedEmployeeCode();
        this.openingBalance = counter.getOpeningBalance();
        this.currentBalance = counter.getCurrentBalance();
        this.status = counter.getStatus();
        this.createdAt = counter.getCreatedAt();
        this.updatedAt = counter.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getCounterCode() {
        return counterCode;
    }

    public String getCounterName() {
        return counterName;
    }

    public String getBranchCode() {
        return branchCode;
    }

    public String getAssignedEmployeeCode() {
        return assignedEmployeeCode;
    }

    public BigDecimal getOpeningBalance() {
        return openingBalance;
    }

    public BigDecimal getCurrentBalance() {
        return currentBalance;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}