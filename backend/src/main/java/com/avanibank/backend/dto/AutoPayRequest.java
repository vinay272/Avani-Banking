package com.avanibank.backend.dto;

import java.time.LocalDate;

public class AutoPayRequest {

    private Long accountId;

    private String billerName;

    private String billerReference;

    private Double amount;

    private String frequency;

    private LocalDate startDate;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public AutoPayRequest() {
    }

    // =====================================================
    // GETTERS & SETTERS
    // =====================================================

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public String getBillerName() {
        return billerName;
    }

    public void setBillerName(String billerName) {
        this.billerName = billerName;
    }

    public String getBillerReference() {
        return billerReference;
    }

    public void setBillerReference(String billerReference) {
        this.billerReference = billerReference;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
}