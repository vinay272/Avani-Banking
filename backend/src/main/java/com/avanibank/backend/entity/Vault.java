package com.avanibank.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vaults")
public class Vault {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String vaultCode;

    @Column(nullable = false)
    private String vaultName;

    @Column(nullable = false)
    private String branchCode;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal totalCapacity = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal currentBalance = BigDecimal.ZERO;

    @Column(nullable = false)
    private String status = "ACTIVE";

    private LocalDateTime lastAuditAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Vault() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }

        if (totalCapacity == null) {
            totalCapacity = BigDecimal.ZERO;
        }

        if (currentBalance == null) {
            currentBalance = BigDecimal.ZERO;
        }

        if (status == null || status.isBlank()) {
            status = "ACTIVE";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

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

    public BigDecimal getCurrentBalance() {
        return currentBalance;
    }

    public void setCurrentBalance(BigDecimal currentBalance) {
        this.currentBalance = currentBalance;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getLastAuditAt() {
        return lastAuditAt;
    }

    public void setLastAuditAt(LocalDateTime lastAuditAt) {
        this.lastAuditAt = lastAuditAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}