package com.avanibank.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class ATMRequest {

    @NotBlank(message = "ATM code is required")
    private String atmCode;

    @NotBlank(message = "ATM name is required")
    private String atmName;

    @NotBlank(message = "Branch code is required")
    private String branchCode;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Cash balance is required")
    @DecimalMin(value = "0.00", message = "Cash balance cannot be negative")
    private BigDecimal cashBalance;

    public String getAtmCode() {
        return atmCode;
    }

    public void setAtmCode(String atmCode) {
        this.atmCode = atmCode;
    }

    public String getAtmName() {
        return atmName;
    }

    public void setAtmName(String atmName) {
        this.atmName = atmName;
    }

    public String getBranchCode() {
        return branchCode;
    }

    public void setBranchCode(String branchCode) {
        this.branchCode = branchCode;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public BigDecimal getCashBalance() {
        return cashBalance;
    }

    public void setCashBalance(BigDecimal cashBalance) {
        this.cashBalance = cashBalance;
    }
}