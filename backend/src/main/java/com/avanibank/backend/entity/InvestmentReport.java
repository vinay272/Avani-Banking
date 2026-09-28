package com.avanibank.backend.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class InvestmentReport {

    private LocalDateTime generatedAt;

    private BigDecimal totalInvested;
    private BigDecimal currentValue;
    private BigDecimal totalProfitLoss;
    private BigDecimal returnPercentage;

    private Integer totalInvestments;
    private Integer activeInvestments;

    private Integer fixedDepositCount;
    private Integer sipCount;
    private Integer bondCount;
    private Integer goldCount;
    private Integer mutualFundCount;

    private BigDecimal fixedDepositInvested;
    private BigDecimal sipInvested;
    private BigDecimal bondInvested;
    private BigDecimal goldInvested;
    private BigDecimal mutualFundInvested;

    private BigDecimal fixedDepositCurrentValue;
    private BigDecimal sipCurrentValue;
    private BigDecimal bondCurrentValue;
    private BigDecimal goldCurrentValue;
    private BigDecimal mutualFundCurrentValue;

    public InvestmentReport() {
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
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

    public Integer getTotalInvestments() {
        return totalInvestments;
    }

    public void setTotalInvestments(Integer totalInvestments) {
        this.totalInvestments = totalInvestments;
    }

    public Integer getActiveInvestments() {
        return activeInvestments;
    }

    public void setActiveInvestments(Integer activeInvestments) {
        this.activeInvestments = activeInvestments;
    }

    public Integer getFixedDepositCount() {
        return fixedDepositCount;
    }

    public void setFixedDepositCount(Integer fixedDepositCount) {
        this.fixedDepositCount = fixedDepositCount;
    }

    public Integer getSipCount() {
        return sipCount;
    }

    public void setSipCount(Integer sipCount) {
        this.sipCount = sipCount;
    }

    public Integer getBondCount() {
        return bondCount;
    }

    public void setBondCount(Integer bondCount) {
        this.bondCount = bondCount;
    }

    public Integer getGoldCount() {
        return goldCount;
    }

    public void setGoldCount(Integer goldCount) {
        this.goldCount = goldCount;
    }

    public Integer getMutualFundCount() {
        return mutualFundCount;
    }

    public void setMutualFundCount(Integer mutualFundCount) {
        this.mutualFundCount = mutualFundCount;
    }

    public BigDecimal getFixedDepositInvested() {
        return fixedDepositInvested;
    }

    public void setFixedDepositInvested(BigDecimal fixedDepositInvested) {
        this.fixedDepositInvested = fixedDepositInvested;
    }

    public BigDecimal getSipInvested() {
        return sipInvested;
    }

    public void setSipInvested(BigDecimal sipInvested) {
        this.sipInvested = sipInvested;
    }

    public BigDecimal getBondInvested() {
        return bondInvested;
    }

    public void setBondInvested(BigDecimal bondInvested) {
        this.bondInvested = bondInvested;
    }

    public BigDecimal getGoldInvested() {
        return goldInvested;
    }

    public void setGoldInvested(BigDecimal goldInvested) {
        this.goldInvested = goldInvested;
    }

    public BigDecimal getMutualFundInvested() {
        return mutualFundInvested;
    }

    public void setMutualFundInvested(BigDecimal mutualFundInvested) {
        this.mutualFundInvested = mutualFundInvested;
    }

    public BigDecimal getFixedDepositCurrentValue() {
        return fixedDepositCurrentValue;
    }

    public void setFixedDepositCurrentValue(BigDecimal fixedDepositCurrentValue) {
        this.fixedDepositCurrentValue = fixedDepositCurrentValue;
    }

    public BigDecimal getSipCurrentValue() {
        return sipCurrentValue;
    }

    public void setSipCurrentValue(BigDecimal sipCurrentValue) {
        this.sipCurrentValue = sipCurrentValue;
    }

    public BigDecimal getBondCurrentValue() {
        return bondCurrentValue;
    }

    public void setBondCurrentValue(BigDecimal bondCurrentValue) {
        this.bondCurrentValue = bondCurrentValue;
    }

    public BigDecimal getGoldCurrentValue() {
        return goldCurrentValue;
    }

    public void setGoldCurrentValue(BigDecimal goldCurrentValue) {
        this.goldCurrentValue = goldCurrentValue;
    }

    public BigDecimal getMutualFundCurrentValue() {
        return mutualFundCurrentValue;
    }

    public void setMutualFundCurrentValue(BigDecimal mutualFundCurrentValue) {
        this.mutualFundCurrentValue = mutualFundCurrentValue;
    }
}