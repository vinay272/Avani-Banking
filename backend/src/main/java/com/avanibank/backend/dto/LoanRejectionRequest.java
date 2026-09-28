package com.avanibank.backend.dto;

public class LoanRejectionRequest {

    private String rejectionReason;

    public LoanRejectionRequest() {
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}