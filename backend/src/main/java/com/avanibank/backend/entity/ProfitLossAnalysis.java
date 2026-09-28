package com.avanibank.backend.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProfitLossAnalysis {

    private LocalDateTime generatedAt;

    private BigDecimal totalInvested;
    private BigDecimal currentValue;
    private BigDecimal totalProfitLoss;
    private BigDecimal returnPercentage;

    private String overallStatus;

    private String bestPerformingInvestment;
    private BigDecimal bestPerformingProfitLoss;
    private BigDecimal bestPerformingReturn;

    private String lowestPerformingInvestment;
    private BigDecimal lowestPerformingProfitLoss;
    private BigDecimal lowestPerformingReturn;

    private BigDecimal fixedDepositProfitLoss;
    private BigDecimal fixedDepositReturn;

    private BigDecimal sipProfitLoss;
    private BigDecimal sipReturn;

    private BigDecimal bondProfitLoss;
    private BigDecimal bondReturn;

    private BigDecimal goldProfitLoss;
    private BigDecimal goldReturn;

    private BigDecimal mutualFundProfitLoss;
    private BigDecimal mutualFundReturn;

    public ProfitLossAnalysis() {
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

    public String getOverallStatus() {
        return overallStatus;
    }

    public void setOverallStatus(String overallStatus) {
        this.overallStatus = overallStatus;
    }

    public String getBestPerformingInvestment() {
        return bestPerformingInvestment;
    }

    public void setBestPerformingInvestment(String bestPerformingInvestment) {
        this.bestPerformingInvestment = bestPerformingInvestment;
    }

    public BigDecimal getBestPerformingProfitLoss() {
        return bestPerformingProfitLoss;
    }

    public void setBestPerformingProfitLoss(BigDecimal bestPerformingProfitLoss) {
        this.bestPerformingProfitLoss = bestPerformingProfitLoss;
    }

    public BigDecimal getBestPerformingReturn() {
        return bestPerformingReturn;
    }

    public void setBestPerformingReturn(BigDecimal bestPerformingReturn) {
        this.bestPerformingReturn = bestPerformingReturn;
    }

    public String getLowestPerformingInvestment() {
        return lowestPerformingInvestment;
    }

    public void setLowestPerformingInvestment(String lowestPerformingInvestment) {
        this.lowestPerformingInvestment = lowestPerformingInvestment;
    }

    public BigDecimal getLowestPerformingProfitLoss() {
        return lowestPerformingProfitLoss;
    }

    public void setLowestPerformingProfitLoss(BigDecimal lowestPerformingProfitLoss) {
        this.lowestPerformingProfitLoss = lowestPerformingProfitLoss;
    }

    public BigDecimal getLowestPerformingReturn() {
        return lowestPerformingReturn;
    }

    public void setLowestPerformingReturn(BigDecimal lowestPerformingReturn) {
        this.lowestPerformingReturn = lowestPerformingReturn;
    }

    public BigDecimal getFixedDepositProfitLoss() {
        return fixedDepositProfitLoss;
    }

    public void setFixedDepositProfitLoss(BigDecimal fixedDepositProfitLoss) {
        this.fixedDepositProfitLoss = fixedDepositProfitLoss;
    }

    public BigDecimal getFixedDepositReturn() {
        return fixedDepositReturn;
    }

    public void setFixedDepositReturn(BigDecimal fixedDepositReturn) {
        this.fixedDepositReturn = fixedDepositReturn;
    }

    public BigDecimal getSipProfitLoss() {
        return sipProfitLoss;
    }

    public void setSipProfitLoss(BigDecimal sipProfitLoss) {
        this.sipProfitLoss = sipProfitLoss;
    }

    public BigDecimal getSipReturn() {
        return sipReturn;
    }

    public void setSipReturn(BigDecimal sipReturn) {
        this.sipReturn = sipReturn;
    }

    public BigDecimal getBondProfitLoss() {
        return bondProfitLoss;
    }

    public void setBondProfitLoss(BigDecimal bondProfitLoss) {
        this.bondProfitLoss = bondProfitLoss;
    }

    public BigDecimal getBondReturn() {
        return bondReturn;
    }

    public void setBondReturn(BigDecimal bondReturn) {
        this.bondReturn = bondReturn;
    }

    public BigDecimal getGoldProfitLoss() {
        return goldProfitLoss;
    }

    public void setGoldProfitLoss(BigDecimal goldProfitLoss) {
        this.goldProfitLoss = goldProfitLoss;
    }

    public BigDecimal getGoldReturn() {
        return goldReturn;
    }

    public void setGoldReturn(BigDecimal goldReturn) {
        this.goldReturn = goldReturn;
    }

    public BigDecimal getMutualFundProfitLoss() {
        return mutualFundProfitLoss;
    }

    public void setMutualFundProfitLoss(BigDecimal mutualFundProfitLoss) {
        this.mutualFundProfitLoss = mutualFundProfitLoss;
    }

    public BigDecimal getMutualFundReturn() {
        return mutualFundReturn;
    }

    public void setMutualFundReturn(BigDecimal mutualFundReturn) {
        this.mutualFundReturn = mutualFundReturn;
    }
}