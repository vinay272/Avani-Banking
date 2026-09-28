package com.avanibank.backend.dto;

import java.time.LocalDate;

public class ScheduledPaymentRequest {

    private Long accountId;

    private String paymentType;

    private String receiverAccountNumber;

    private String receiverIfscCode;

    private String receiverUpiId;

    private Double amount;

    private LocalDate scheduledDate;

    // =====================================================
    // GETTERS & SETTERS
    // =====================================================

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

    public String getPaymentType() {
        return paymentType;
    }

    public void setPaymentType(String paymentType) {
        this.paymentType = paymentType;
    }

    public String getReceiverAccountNumber() {
        return receiverAccountNumber;
    }

    public void setReceiverAccountNumber(String receiverAccountNumber) {
        this.receiverAccountNumber = receiverAccountNumber;
    }

    public String getReceiverIfscCode() {
        return receiverIfscCode;
    }

    public void setReceiverIfscCode(String receiverIfscCode) {
        this.receiverIfscCode = receiverIfscCode;
    }

    public String getReceiverUpiId() {
        return receiverUpiId;
    }

    public void setReceiverUpiId(String receiverUpiId) {
        this.receiverUpiId = receiverUpiId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public LocalDate getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDate scheduledDate) {
        this.scheduledDate = scheduledDate;
    }
}