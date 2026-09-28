package com.avanibank.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "mutual_funds")
public class MutualFund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fund_name", nullable = false, unique = true)
    private String fundName;

    @Column(name = "fund_category", nullable = false)
    private String fundCategory;

    @Column(name = "risk_level", nullable = false)
    private String riskLevel;

    @Column(name = "expected_return_rate", nullable = false)
    private Double expectedReturnRate;

    @Column(name = "minimum_investment", nullable = false)
    private Double minimumInvestment;

    @Column(name = "exit_load")
    private Double exitLoad;

    @Column(name = "status", nullable = false)
    private String status;

    public MutualFund() {
        this.status = "ACTIVE";
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFundName() {
        return fundName;
    }

    public void setFundName(String fundName) {
        this.fundName = fundName;
    }

    public String getFundCategory() {
        return fundCategory;
    }

    public void setFundCategory(String fundCategory) {
        this.fundCategory = fundCategory;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public Double getExpectedReturnRate() {
        return expectedReturnRate;
    }

    public void setExpectedReturnRate(Double expectedReturnRate) {
        this.expectedReturnRate = expectedReturnRate;
    }

    public Double getMinimumInvestment() {
        return minimumInvestment;
    }

    public void setMinimumInvestment(Double minimumInvestment) {
        this.minimumInvestment = minimumInvestment;
    }

    public Double getExitLoad() {
        return exitLoad;
    }

    public void setExitLoad(Double exitLoad) {
        this.exitLoad = exitLoad;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}