package com.avanibank.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class VaultRequest {

    @NotBlank(message = "Vault code is required")
    private String vaultCode;

    @NotBlank(message = "Vault name is required")
    private String vaultName;

    @NotBlank(message = "Branch code is required")
    private String branchCode;

    @NotNull(message = "Total capacity is required")
    @DecimalMin(value = "0.00", message = "Total capacity cannot be negative")
    private BigDecimal totalCapacity;

    // Getters and Setters

    public String getVaultCode() {
        return vaultCode;
    }

    public void setVaultCode(String vaultCode) {
        this.vaultCode = vaultCode;
    }

    public String getVaultName() {
        return vaultName;
    }

    public void setVaultName(String vaultName) {
        this.vaultName = vaultName;
    }

    public String getBranchCode() {
        return branchCode;
    }

    public void setBranchCode(String branchCode) {
        this.branchCode = branchCode;
    }

    public BigDecimal getTotalCapacity() {
        return totalCapacity;
    }

    public void setTotalCapacity(BigDecimal totalCapacity) {
        this.totalCapacity = totalCapacity;
    }
}