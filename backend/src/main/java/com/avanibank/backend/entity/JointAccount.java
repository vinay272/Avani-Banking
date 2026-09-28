package com.avanibank.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "joint_accounts")
public class JointAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Primary account holder
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "primary_customer_id", nullable = false)
    private Customer primaryCustomer;

    // Joint account holder
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "joint_customer_id", nullable = false)
    private Customer jointCustomer;

    @Column(nullable = false, unique = true)
    private String accountNumber;

    @Column(nullable = false)
    private String ownershipType;

    @Column(nullable = false)
    private String status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // =========================
    // CONSTRUCTOR
    // =========================

    public JointAccount() {
    }

    // =========================
    // GETTERS & SETTERS
    // =========================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Customer getPrimaryCustomer() {
        return primaryCustomer;
    }

    public void setPrimaryCustomer(Customer primaryCustomer) {
        this.primaryCustomer = primaryCustomer;
    }

    public Customer getJointCustomer() {
        return jointCustomer;
    }

    public void setJointCustomer(Customer jointCustomer) {
        this.jointCustomer = jointCustomer;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getOwnershipType() {
        return ownershipType;
    }

    public void setOwnershipType(String ownershipType) {
        this.ownershipType = ownershipType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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