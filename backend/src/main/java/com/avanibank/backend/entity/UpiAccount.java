package com.avanibank.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "upi_accounts",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = "upi_id"
                )
        }
)
public class UpiAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================
    // CUSTOMER
    // =========================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "customer_id",
            nullable = false
    )
    private Customer customer;

    // =========================
    // BANK ACCOUNT
    // =========================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "account_id",
            nullable = false
    )
    private Account account;

    // =========================
    // UPI ID / VPA
    // =========================

    @Column(
            name = "upi_id",
            nullable = false,
            unique = true
    )
    private String upiId;

    // =========================
    // STATUS
    // =========================

    // ACTIVE / BLOCKED
    @Column(
            nullable = false
    )
    private String status = "ACTIVE";

    // =========================
    // CREATED DATE
    // =========================

    @Column(
            nullable = false
    )
    private LocalDateTime createdAt;

    // =========================
    // CONSTRUCTOR
    // =========================

    public UpiAccount() {
        this.createdAt = LocalDateTime.now();
        this.status = "ACTIVE";
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

    public Account getAccount() {
        return account;
    }

    public void setAccount(Account account) {
        this.account = account;
    }

    public String getUpiId() {
        return upiId;
    }

    public void setUpiId(String upiId) {
        this.upiId = upiId;
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
}