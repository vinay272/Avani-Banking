package com.avanibank.backend.dto;

public class UpiTransferRequest {

    private String receiverUpiId;
    private Double amount;

    public UpiTransferRequest() {
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
}