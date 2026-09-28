package com.avanibank.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "auto_payments")
public class AutoPay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Customer who created this Auto-Pay
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "customer_id",
            nullable = false
    )
    private Customer customer;

    // Account from which Auto-Pay amount will be debited
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "account_id",
            nullable = false
    )
    private Account account;

    // Name of biller / merchant / service
    @Column(nullable = false)
    private String billerName;

    // Biller's account / consumer / reference number
    @Column(nullable = false)
    private String billerReference;

    // Auto-Pay amount
    @Column(nullable = false)
    private Double amount;

    // DAILY / WEEKLY / MONTHLY / YEARLY
    @Column(nullable = false)
    private String frequency;

    // First Auto-Pay date
    @Column(nullable = false)
    private LocalDate startDate;

    // Next date on which Auto-Pay should execute
    @Column(nullable = false)
    private LocalDate nextDueDate;

    // ACTIVE / PAUSED / COMPLETED / CANCELLED
    @Column(nullable = false)
    private String status = "ACTIVE";

    // Creation timestamp
    @Column(nullable = false)
    private LocalDateTime createdAt;

    // Last execution timestamp
    private LocalDateTime lastExecutedAt;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public AutoPay() {
        this.createdAt = LocalDateTime.now();
    }

    // =====================================================
    // GETTERS & SETTERS
    // =====================================================

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

    public String getBillerName() {
        return billerName;
    }

    public void setBillerName(String billerName) {
        this.billerName = billerName;
    }

    public String getBillerReference() {
        return billerReference;
    }

    public void setBillerReference(String billerReference) {
        this.billerReference = billerReference;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getNextDueDate() {
        return nextDueDate;
    }

    public void setNextDueDate(LocalDate nextDueDate) {
        this.nextDueDate = nextDueDate;
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

    public LocalDateTime getLastExecutedAt() {
        return lastExecutedAt;
    }

    public void setLastExecutedAt(LocalDateTime lastExecutedAt) {
        this.lastExecutedAt = lastExecutedAt;
    }
}