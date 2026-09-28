package com.avanibank.backend.dto;

public class BillPaymentRequest {

    private String billerCategory;
    private String billerName;
    private String consumerNumber;
    private Double amount;

    public BillPaymentRequest() {
    }

    public String getBillerCategory() {
        return billerCategory;
    }

    public void setBillerCategory(String billerCategory) {
        this.billerCategory = billerCategory;
    }

    public String getBillerName() {
        return billerName;
    }

    public void setBillerName(String billerName) {
        this.billerName = billerName;
    }

    public String getConsumerNumber() {
        return consumerNumber;
    }

    public void setConsumerNumber(String consumerNumber) {
        this.consumerNumber = consumerNumber;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }
}