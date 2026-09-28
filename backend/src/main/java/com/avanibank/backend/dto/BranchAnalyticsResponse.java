package com.avanibank.backend.dto;

import java.math.BigDecimal;

public class BranchAnalyticsResponse {

    private String branchCode;
    private String branchName;
    private String city;
    private String state;
    private String status;

    private long totalEmployees;
    private long activeEmployees;

    private long totalCashCounters;
    private long activeCashCounters;

    private long totalATMs;
    private long activeATMs;

    private long totalVaults;
    private long activeVaults;

    private BigDecimal totalVaultCapacity;
    private BigDecimal totalVaultBalance;

    private BigDecimal latestClosingCash;
    private Integer latestTransactionCount;

    public BranchAnalyticsResponse() {
    }

    public String getBranchCode() {
        return branchCode;
    }

    public void setBranchCode(String branchCode) {
        this.branchCode = branchCode;
    }

    public String getBranchName() {
        return branchName;
    }

    public void setBranchName(String branchName) {
        this.branchName = branchName;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public long getTotalEmployees() {
        return totalEmployees;
    }

    public void setTotalEmployees(long totalEmployees) {
        this.totalEmployees = totalEmployees;
    }

    public long getActiveEmployees() {
        return activeEmployees;
    }

    public void setActiveEmployees(long activeEmployees) {
        this.activeEmployees = activeEmployees;
    }

    public long getTotalCashCounters() {
        return totalCashCounters;
    }

    public void setTotalCashCounters(long totalCashCounters) {
        this.totalCashCounters = totalCashCounters;
    }

    public long getActiveCashCounters() {
        return activeCashCounters;
    }

    public void setActiveCashCounters(long activeCashCounters) {
        this.activeCashCounters = activeCashCounters;
    }

    public long getTotalATMs() {
        return totalATMs;
    }

    public void setTotalATMs(long totalATMs) {
        this.totalATMs = totalATMs;
    }

    public long getActiveATMs() {
        return activeATMs;
    }

    public void setActiveATMs(long activeATMs) {
        this.activeATMs = activeATMs;
    }

    public long getTotalVaults() {
        return totalVaults;
    }

    public void setTotalVaults(long totalVaults) {
        this.totalVaults = totalVaults;
    }

    public long getActiveVaults() {
        return activeVaults;
    }

    public void setActiveVaults(long activeVaults) {
        this.activeVaults = activeVaults;
    }

    public BigDecimal getTotalVaultCapacity() {
        return totalVaultCapacity;
    }

    public void setTotalVaultCapacity(BigDecimal totalVaultCapacity) {
        this.totalVaultCapacity = totalVaultCapacity;
    }

    public BigDecimal getTotalVaultBalance() {
        return totalVaultBalance;
    }

    public void setTotalVaultBalance(BigDecimal totalVaultBalance) {
        this.totalVaultBalance = totalVaultBalance;
    }

    public BigDecimal getLatestClosingCash() {
        return latestClosingCash;
    }

    public void setLatestClosingCash(BigDecimal latestClosingCash) {
        this.latestClosingCash = latestClosingCash;
    }

    public Integer getLatestTransactionCount() {
        return latestTransactionCount;
    }

    public void setLatestTransactionCount(Integer latestTransactionCount) {
        this.latestTransactionCount = latestTransactionCount;
    }
}