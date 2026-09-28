package com.avanibank.backend.dto;

import java.math.BigDecimal;

public class FraudAlertNotification {

    private Long alertId;
    private String alertType;
    private String riskLevel;
    private BigDecimal riskScore;
    private String description;
    private String transactionType;
    private String status;

    public FraudAlertNotification() {
    }

    public FraudAlertNotification(
            Long alertId,
            String alertType,
            String riskLevel,
            BigDecimal riskScore,
            String description,
            String transactionType,
            String status) {

        this.alertId = alertId;
        this.alertType = alertType;
        this.riskLevel = riskLevel;
        this.riskScore = riskScore;
        this.description = description;
        this.transactionType = transactionType;
        this.status = status;
    }

    public Long getAlertId() {
        return alertId;
    }

    public String getAlertType() {
        return alertType;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public BigDecimal getRiskScore() {
        return riskScore;
    }

    public String getDescription() {
        return description;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public String getStatus() {
        return status;
    }
}