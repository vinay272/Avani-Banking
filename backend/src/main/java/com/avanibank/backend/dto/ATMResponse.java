package com.avanibank.backend.dto;

import com.avanibank.backend.entity.ATM;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ATMResponse {

    private Long id;
    private String atmCode;
    private String atmName;
    private String branchCode;
    private String location;
    private BigDecimal cashBalance;
    private String status;
    private LocalDateTime lastMaintenanceAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ATMResponse(ATM atm) {
        this.id = atm.getId();
        this.atmCode = atm.getAtmCode();
        this.atmName = atm.getAtmName();
        this.branchCode = atm.getBranchCode();
        this.location = atm.getLocation();
        this.cashBalance = atm.getCashBalance();
        this.status = atm.getStatus();
        this.lastMaintenanceAt = atm.getLastMaintenanceAt();
        this.createdAt = atm.getCreatedAt();
        this.updatedAt = atm.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getAtmCode() {
        return atmCode;
    }

    public String getAtmName() {
        return atmName;
    }

    public String getBranchCode() {
        return branchCode;
    }

    public String getLocation() {
        return location;
    }

    public BigDecimal getCashBalance() {
        return cashBalance;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getLastMaintenanceAt() {
        return lastMaintenanceAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}