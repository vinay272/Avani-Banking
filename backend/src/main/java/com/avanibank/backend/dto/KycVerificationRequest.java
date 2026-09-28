package com.avanibank.backend.dto;

public class KycVerificationRequest {

    private String status;
    private String remarks;

    public KycVerificationRequest() {
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}