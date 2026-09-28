package com.avanibank.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "accounts",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "account_number")
        }
)
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Customer owning this account
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "customer_id",
            nullable = false
    )
    private Customer customer;

    // Unique bank account number
    @Column(
            name = "account_number",
            nullable = false,
            unique = true
    )
    private String accountNumber;

    // IFSC Code
    @Column(
            name = "ifsc_code",
            nullable = false
    )
    private String ifscCode;

    // SAVINGS / CURRENT / SALARY
    @Column(
            name = "account_type",
            nullable = false
    )
    private String accountType;

    // Current balance
    @Column(
            nullable = false
    )
    private Double balance = 0.0;

    // ACTIVE / FROZEN / CLOSED
    @Column(
            nullable = false
    )
    private String status = "ACTIVE";

    // Interest rate
    @Column(
            nullable = false
    )
    private Double interestRate = 0.0;

    @Column(
            nullable = false
    )
    private LocalDateTime createdAt;

    public Account() {
        this.createdAt = LocalDateTime.now();
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

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getIfscCode() {
        return ifscCode;
    }

    public void setIfscCode(String ifscCode) {
        this.ifscCode = ifscCode;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public Double getBalance() {
        return balance;
    }

    public void setBalance(Double balance) {
        this.balance = balance;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(Double interestRate) {
        this.interestRate = interestRate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}