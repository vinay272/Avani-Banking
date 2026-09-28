package com.avanibank.backend.dto;

public class QrPaymentResponse {

    private String transactionReference;
    private String status;
    private String upiId;
    private String receiverName;
    private Double amount;
    private String currency;
    private String upiUrl;

    public QrPaymentResponse(
            String transactionReference,
            String status,
            String upiId,
            String receiverName,
            Double amount,
            String currency,
            String upiUrl) {

        this.transactionReference = transactionReference;
        this.status = status;
        this.upiId = upiId;
        this.receiverName = receiverName;
        this.amount = amount;
        this.currency = currency;
        this.upiUrl = upiUrl;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public String getStatus() {
        return status;
    }

    public String getUpiId() {
        return upiId;
    }

    public String getReceiverName() {
        return receiverName;
    }

    public Double getAmount() {
        return amount;
    }

    public String getCurrency() {
        return currency;
    }

    public String getUpiUrl() {
        return upiUrl;
    }
}
