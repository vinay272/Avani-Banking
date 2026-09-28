package com.avanibank.backend.dto;

import java.math.BigDecimal;

public class BondPlanResponse {

    private String planCode;
    private String bondName;
    private String bondType;
    private BigDecimal faceValue;
    private BigDecimal couponRate;
    private Integer tenureMonths;
    private BigDecimal minimumInvestment;
    private String interestFrequency;
    private String description;

    public BondPlanResponse() {
    }

    public BondPlanResponse(
            String planCode,
            String bondName,
            String bondType,
            BigDecimal faceValue,
            BigDecimal couponRate,
            Integer tenureMonths,
            BigDecimal minimumInvestment,
            String interestFrequency,
            String description
    ) {
        this.planCode = planCode;
        this.bondName = bondName;
        this.bondType = bondType;
        this.faceValue = faceValue;
        this.couponRate = couponRate;
        this.tenureMonths = tenureMonths;
        this.minimumInvestment = minimumInvestment;
        this.interestFrequency = interestFrequency;
        this.description = description;
    }

    public String getPlanCode() {
        return planCode;
    }

    public void setPlanCode(String planCode) {
        this.planCode = planCode;
    }

    public String getBondName() {
        return bondName;
    }

    public void setBondName(String bondName) {
        this.bondName = bondName;
    }

    public String getBondType() {
        return bondType;
    }

    public void setBondType(String bondType) {
        this.bondType = bondType;
    }

    public BigDecimal getFaceValue() {
        return faceValue;
    }

    public void setFaceValue(BigDecimal faceValue) {
        this.faceValue = faceValue;
    }

    public BigDecimal getCouponRate() {
        return couponRate;
    }

    public void setCouponRate(BigDecimal couponRate) {
        this.couponRate = couponRate;
    }

    public Integer getTenureMonths() {
        return tenureMonths;
    }

    public void setTenureMonths(Integer tenureMonths) {
        this.tenureMonths = tenureMonths;
    }

    public BigDecimal getMinimumInvestment() {
        return minimumInvestment;
    }

    public void setMinimumInvestment(BigDecimal minimumInvestment) {
        this.minimumInvestment = minimumInvestment;
    }

    public String getInterestFrequency() {
        return interestFrequency;
    }

    public void setInterestFrequency(String interestFrequency) {
        this.interestFrequency = interestFrequency;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}