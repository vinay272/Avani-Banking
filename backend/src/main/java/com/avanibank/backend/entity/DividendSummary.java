package com.avanibank.backend.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class DividendSummary {

    private LocalDateTime generatedAt;

    private BigDecimal totalDividend;

    private BigDecimal currentMonthDividend;

    private BigDecimal currentYearDividend;

    private Integer totalRecords;

    private BigDecimal mutualFundDividend;

    private BigDecimal sipDividend;

    private BigDecimal bondDividend;

    private BigDecimal goldDividend;

    private BigDecimal fixedDepositDividend;

    public DividendSummary() {
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public BigDecimal getTotalDividend() {
        return totalDividend;
    }

    public void setTotalDividend(BigDecimal totalDividend) {
        this.totalDividend = totalDividend;
    }

    public BigDecimal getCurrentMonthDividend() {
        return currentMonthDividend;
    }

    public void setCurrentMonthDividend(BigDecimal currentMonthDividend) {
        this.currentMonthDividend = currentMonthDividend;
    }

    public BigDecimal getCurrentYearDividend() {
        return currentYearDividend;
    }

    public void setCurrentYearDividend(BigDecimal currentYearDividend) {
        this.currentYearDividend = currentYearDividend;
    }

    public Integer getTotalRecords() {
        return totalRecords;
    }

    public void setTotalRecords(Integer totalRecords) {
        this.totalRecords = totalRecords;
    }

    public BigDecimal getMutualFundDividend() {
        return mutualFundDividend;
    }

    public void setMutualFundDividend(BigDecimal mutualFundDividend) {
        this.mutualFundDividend = mutualFundDividend;
    }

    public BigDecimal getSipDividend() {
        return sipDividend;
    }

    public void setSipDividend(BigDecimal sipDividend) {
        this.sipDividend = sipDividend;
    }

    public BigDecimal getBondDividend() {
        return bondDividend;
    }

    public void setBondDividend(BigDecimal bondDividend) {
        this.bondDividend = bondDividend;
    }

    public BigDecimal getGoldDividend() {
        return goldDividend;
    }

    public void setGoldDividend(BigDecimal goldDividend) {
        this.goldDividend = goldDividend;
    }

    public BigDecimal getFixedDepositDividend() {
        return fixedDepositDividend;
    }

    public void setFixedDepositDividend(
            BigDecimal fixedDepositDividend) {

        this.fixedDepositDividend =
                fixedDepositDividend;
    }
}