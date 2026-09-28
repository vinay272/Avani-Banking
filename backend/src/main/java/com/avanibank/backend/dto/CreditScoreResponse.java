package com.avanibank.backend.dto;

public class CreditScoreResponse {

    private Integer creditScore;

    private String category;

    private String riskLevel;

    private String message;

    // =====================================================
    // GETTERS / SETTERS
    // =====================================================

    public Integer getCreditScore() {
        return creditScore;
    }

    public void setCreditScore(Integer creditScore) {
        this.creditScore = creditScore;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}