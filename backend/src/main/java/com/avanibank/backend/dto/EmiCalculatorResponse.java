package com.avanibank.backend.dto;

public class EmiCalculatorResponse {

    private Double loanAmount;

    private Double annualInterestRate;

    private Integer tenureMonths;

    private Double monthlyEmi;

    private Double totalInterest;

    private Double totalRepayment;

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

    public Double getMonthlyEmi() {
        return monthlyEmi;
    }

    public void setMonthlyEmi(
            Double monthlyEmi) {

        this.monthlyEmi =
                monthlyEmi;
    }

    public Double getTotalInterest() {
        return totalInterest;
    }

    public void setTotalInterest(
            Double totalInterest) {

        this.totalInterest =
                totalInterest;
    }

    public Double getTotalRepayment() {
        return totalRepayment;
    }

    public void setTotalRepayment(
            Double totalRepayment) {

        this.totalRepayment =
                totalRepayment;
    }
}