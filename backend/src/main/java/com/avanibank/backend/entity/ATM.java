package com.avanibank.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "atms")
public class ATM {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String atmCode;

    @Column(nullable = false)
    private String atmName;

    @Column(nullable = false)
    private String branchCode;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private BigDecimal cashBalance = BigDecimal.ZERO;

    @Column(nullable = false)
    private String status = "ACTIVE";

    private LocalDateTime lastMaintenanceAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public ATM() {
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

        if (cashBalance == null) {
            cashBalance = BigDecimal.ZERO;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getLastMaintenanceAt() {
        return lastMaintenanceAt;
    }

    public void setLastMaintenanceAt(LocalDateTime lastMaintenanceAt) {
        this.lastMaintenanceAt = lastMaintenanceAt;
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