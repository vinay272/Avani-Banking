package com.avanibank.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "scheduled_payments")
public class ScheduledPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // CUSTOMER
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    // =====================================================
    // PAYMENT ACCOUNT
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    // =====================================================
    // PAYMENT TYPE
    // UPI / NEFT / RTGS / IMPS
    // =====================================================

    @Column(nullable = false)
    private String paymentType;

    // =====================================================
    // RECEIVER DETAILS
    // =====================================================

    @Column(nullable = false)
    private String receiverAccountNumber;

    @Column(nullable = false)
    private String receiverIfscCode;

    @Column
    private String receiverUpiId;

    // =====================================================
    // AMOUNT
    // =====================================================

    @Column(nullable = false)
    private Double amount;

    // =====================================================
    // SCHEDULE DATE
    // =====================================================

    @Column(nullable = false)
    private LocalDate scheduledDate;

    // =====================================================
    // STATUS
    // SCHEDULED / PAUSED / CANCELLED / COMPLETED / FAILED
    // =====================================================

    @Column(nullable = false)
    private String status;

    // =====================================================
    // CREATED / EXECUTED TIME
    // =====================================================

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime executedAt;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public ScheduledPayment() {
        this.createdAt = LocalDateTime.now();
        this.status = "SCHEDULED";
    }

    // =====================================================
    // GETTERS & SETTERS
    // =====================================================

    public Long getId() {
        return id;
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

    public String getPaymentType() {
        return paymentType;
    }

    public void setPaymentType(String paymentType) {
        this.paymentType = paymentType;
    }

    public String getReceiverAccountNumber() {
        return receiverAccountNumber;
    }

    public void setReceiverAccountNumber(String receiverAccountNumber) {
        this.receiverAccountNumber = receiverAccountNumber;
    }

    public String getReceiverIfscCode() {
        return receiverIfscCode;
    }

    public void setReceiverIfscCode(String receiverIfscCode) {
        this.receiverIfscCode = receiverIfscCode;
    }

    public String getReceiverUpiId() {
        return receiverUpiId;
    }

    public void setReceiverUpiId(String receiverUpiId) {
        this.receiverUpiId = receiverUpiId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public LocalDate getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDate scheduledDate) {
        this.scheduledDate = scheduledDate;
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

    public LocalDateTime getExecutedAt() {
        return executedAt;
    }

    public void setExecutedAt(LocalDateTime executedAt) {
        this.executedAt = executedAt;
    }
}