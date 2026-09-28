package com.avanibank.backend.dto;

public class FixedDepositPlanResponse {

    private String planCode;
    private String planName;
    private Integer tenureMonths;
    private Double interestRate;
    private String description;

    public FixedDepositPlanResponse() {
    }

    public FixedDepositPlanResponse(
            String planCode,
            String planName,
            Integer tenureMonths,
            Double interestRate,
            String description) {

        this.planCode = planCode;
        this.planName = planName;
        this.tenureMonths = tenureMonths;
        this.interestRate = interestRate;
        this.description = description;
    }

    public String getPlanCode() {
        return planCode;
    }

    public void setPlanCode(String planCode) {
        this.planCode = planCode;
    }

    public String getPlanName() {
        return planName;
    }

    public void setPlanName(String planName) {
        this.planName = planName;
    }

    public Integer getTenureMonths() {
        return tenureMonths;
    }

    public void setTenureMonths(Integer tenureMonths) {
        this.tenureMonths = tenureMonths;
    }

    public Double getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(Double interestRate) {
        this.interestRate = interestRate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}