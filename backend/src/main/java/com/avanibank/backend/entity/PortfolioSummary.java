package com.avanibank.backend.entity;

import java.math.BigDecimal;

public class PortfolioSummary {

    private BigDecimal totalInvested;
    private BigDecimal currentValue;
    private BigDecimal totalProfitLoss;
    private BigDecimal returnPercentage;
    private Integer activeInvestments;

    private BigDecimal mutualFundValue;
    private BigDecimal fixedDepositValue;
    private BigDecimal sipValue;
    private BigDecimal bondValue;
    private BigDecimal goldValue;

    public PortfolioSummary() {
    }

    public BigDecimal getTotalInvested() {
        return totalInvested;
    }

    public void setTotalInvested(BigDecimal totalInvested) {
        this.totalInvested = totalInvested;
    }

    public BigDecimal getCurrentValue() {
        return currentValue;
    }

    public void setCurrentValue(BigDecimal currentValue) {
        this.currentValue = currentValue;
    }

    public BigDecimal getTotalProfitLoss() {
        return totalProfitLoss;
    }

    public void setTotalProfitLoss(BigDecimal totalProfitLoss) {
        this.totalProfitLoss = totalProfitLoss;
    }

    public BigDecimal getReturnPercentage() {
        return returnPercentage;
    }

    public void setReturnPercentage(BigDecimal returnPercentage) {
        this.returnPercentage = returnPercentage;
    }

    public Integer getActiveInvestments() {
        return activeInvestments;
    }

    public void setActiveInvestments(Integer activeInvestments) {
        this.activeInvestments = activeInvestments;
    }

    public BigDecimal getMutualFundValue() {
        return mutualFundValue;
    }

    public void setMutualFundValue(BigDecimal mutualFundValue) {
        this.mutualFundValue = mutualFundValue;
    }

    public BigDecimal getFixedDepositValue() {
        return fixedDepositValue;
    }

    public void setFixedDepositValue(BigDecimal fixedDepositValue) {
        this.fixedDepositValue = fixedDepositValue;
    }

    public BigDecimal getSipValue() {
        return sipValue;
    }

    public void setSipValue(BigDecimal sipValue) {
        this.sipValue = sipValue;
    }

    public BigDecimal getBondValue() {
        return bondValue;
    }

    public void setBondValue(BigDecimal bondValue) {
        this.bondValue = bondValue;
    }

    public BigDecimal getGoldValue() {
        return goldValue;
    }

    public void setGoldValue(BigDecimal goldValue) {
        this.goldValue = goldValue;
    }
}