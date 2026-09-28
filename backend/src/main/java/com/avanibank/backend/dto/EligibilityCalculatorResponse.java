package com.avanibank.backend.dto;

public class EligibilityCalculatorResponse {

    private String loanType;

    private Double requestedAmount;

    private Integer tenureMonths;

    private Double monthlyIncome;

    private Double interestRate;

    private Double maximumEligibleEmi;

    private Double maximumEligibleAmount;

    private Double estimatedEmi;

    private String eligibilityStatus;

    private String message;

    // =====================================================
    // GETTERS / SETTERS
    // =====================================================

    public String getLoanType() {
        return loanType;
    }

    public void setLoanType(String loanType) {
        this.loanType = loanType;
    }

    public Double getRequestedAmount() {
        return requestedAmount;
    }

    public void setRequestedAmount(Double requestedAmount) {
        this.requestedAmount = requestedAmount;
    }

    public Integer getTenureMonths() {
        return tenureMonths;
    }

    public void setTenureMonths(Integer tenureMonths) {
        this.tenureMonths = tenureMonths;
    }

    public Double getMonthlyIncome() {
        return monthlyIncome;
    }

    public void setMonthlyIncome(Double monthlyIncome) {
        this.monthlyIncome = monthlyIncome;
    }

    public Double getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(Double interestRate) {
        this.interestRate = interestRate;
    }

    public Double getMaximumEligibleEmi() {
        return maximumEligibleEmi;
    }

    public void setMaximumEligibleEmi(
            Double maximumEligibleEmi) {
        this.maximumEligibleEmi =
                maximumEligibleEmi;
    }

    public Double getMaximumEligibleAmount() {
        return maximumEligibleAmount;
    }

    public void setMaximumEligibleAmount(
            Double maximumEligibleAmount) {
        this.maximumEligibleAmount =
                maximumEligibleAmount;
    }

    public Double getEstimatedEmi() {
        return estimatedEmi;
    }

    public void setEstimatedEmi(
            Double estimatedEmi) {
        this.estimatedEmi = estimatedEmi;
    }

    public String getEligibilityStatus() {
        return eligibilityStatus;
    }

    public void setEligibilityStatus(
            String eligibilityStatus) {
        this.eligibilityStatus =
                eligibilityStatus;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}