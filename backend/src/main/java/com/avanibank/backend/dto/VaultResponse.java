package com.avanibank.backend.dto;

import com.avanibank.backend.entity.Vault;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class VaultResponse {

    private Long id;
    private String vaultCode;
    private String vaultName;
    private String branchCode;
    private BigDecimal totalCapacity;
    private BigDecimal currentBalance;
    private String status;
    private LocalDateTime lastAuditAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public VaultResponse(Vault vault) {
        this.id = vault.getId();
        this.vaultCode = vault.getVaultCode();
        this.vaultName = vault.getVaultName();
        this.branchCode = vault.getBranchCode();
        this.totalCapacity = vault.getTotalCapacity();
        this.currentBalance = vault.getCurrentBalance();
        this.status = vault.getStatus();
        this.lastAuditAt = vault.getLastAuditAt();
        this.createdAt = vault.getCreatedAt();
        this.updatedAt = vault.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getVaultCode() {
        return vaultCode;
    }

    public String getVaultName() {
        return vaultName;
    }

    public String getBranchCode() {
        return branchCode;
    }

    public BigDecimal getTotalCapacity() {
        return totalCapacity;
    }

    public BigDecimal getCurrentBalance() {
        return currentBalance;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getLastAuditAt() {
        return lastAuditAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}