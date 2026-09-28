package com.avanibank.backend.dto;

public class TransferRequest {

    private String receiverAccountNumber;
    private String receiverIfscCode;
    private Double amount;

    public TransferRequest() {
    }

    public String getReceiverAccountNumber() {
        return receiverAccountNumber;
    }

    public void setReceiverAccountNumber(
            String receiverAccountNumber) {

        this.receiverAccountNumber =
                receiverAccountNumber;
    }

    public String getReceiverIfscCode() {
        return receiverIfscCode;
    }

    public void setReceiverIfscCode(
            String receiverIfscCode) {

        this.receiverIfscCode =
                receiverIfscCode;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }
}