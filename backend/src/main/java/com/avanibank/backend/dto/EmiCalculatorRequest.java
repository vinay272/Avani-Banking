package com.avanibank.backend.dto;

public class EmiCalculatorRequest {

    private Double loanAmount;

    private Double annualInterestRate;

    private Integer tenureMonths;

    // =====================================================
    // GETTERS / SETTERS
    // =====================================================

    public Double getLoanAmount() {
        return loanAmount;
    }

    public void setLoanAmount(Double loanAmount) {
        this.loanAmount = loanAmount;
    }

    public Double getAnnualInterestRate() {
        return annualInterestRate;
    }

    public void setAnnualInterestRate(
            Double annualInterestRate) {

        this.annualInterestRate =
                annualInterestRate;
    }

    public Integer getTenureMonths() {
        return tenureMonths;
    }

    public void setTenureMonths(
            Integer tenureMonths) {

        this.tenureMonths =
                tenureMonths;
    }
}