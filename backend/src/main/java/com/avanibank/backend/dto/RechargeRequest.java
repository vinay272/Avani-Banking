package com.avanibank.backend.dto;

public class RechargeRequest {

    private String mobileNumber;
    private String operator;
    private Double amount;

    public RechargeRequest() {
    }

    // =========================
    // GETTERS
    // =========================

    public String getMobileNumber() {
        return mobileNumber;
    }

    public String getOperator() {
        return operator;
    }

    public Double getAmount() {
        return amount;
    }

    // =========================
    // SETTERS
    // =========================

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public void setOperator(String operator) {
        this.operator = operator;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }
}