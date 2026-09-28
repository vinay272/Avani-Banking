package com.avanibank.backend.dto;

import java.time.LocalDateTime;

public class CardStatementResponse {

    private Long transactionId;
    private String maskedCardNumber;
    private String transactionType;
    private String senderAccountNumber;
    private String receiverAccountNumber;
    private Double amount;
    private String status;
    private LocalDateTime transactionDate;

    public CardStatementResponse() {
    }

    public CardStatementResponse(
            Long transactionId,
            String maskedCardNumber,
            String transactionType,
            String senderAccountNumber,
            String receiverAccountNumber,
            Double amount,
            String status,
            LocalDateTime transactionDate) {

        this.transactionId = transactionId;
        this.maskedCardNumber = maskedCardNumber;
        this.transactionType = transactionType;
        this.senderAccountNumber = senderAccountNumber;
        this.receiverAccountNumber = receiverAccountNumber;
        this.amount = amount;
        this.status = status;
        this.transactionDate = transactionDate;
    }

    public Long getTransactionId() {
        return transactionId;
    }

    public String getMaskedCardNumber() {
        return maskedCardNumber;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public String getSenderAccountNumber() {
        return senderAccountNumber;
    }

    public String getReceiverAccountNumber() {
        return receiverAccountNumber;
    }

    public Double getAmount() {
        return amount;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }
}