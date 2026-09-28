package com.avanibank.backend.dto;

public class LoanForeclosureRequest {

    private String foreclosureReason;

    public LoanForeclosureRequest() {
    }

    public String getForeclosureReason() {
        return foreclosureReason;
    }

    public void setForeclosureReason(String foreclosureReason) {
        this.foreclosureReason = foreclosureReason;
    }
}