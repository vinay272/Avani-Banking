package com.avanibank.backend.dto;

public class CardLimitRequest {

    private Double dailyTransactionLimit;
    private Double monthlyTransactionLimit;

    public Double getDailyTransactionLimit() {
        return dailyTransactionLimit;
    }

    public void setDailyTransactionLimit(Double dailyTransactionLimit) {
        this.dailyTransactionLimit = dailyTransactionLimit;
    }

    public Double getMonthlyTransactionLimit() {
        return monthlyTransactionLimit;
    }

    public void setMonthlyTransactionLimit(Double monthlyTransactionLimit) {
        this.monthlyTransactionLimit = monthlyTransactionLimit;
    }
}