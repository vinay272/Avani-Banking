package com.avanibank.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "recurring_deposits")
public class RecurringDeposit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================
    // CUSTOMER
    // =========================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    // =========================
    // SOURCE ACCOUNT
    // =========================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    // =========================
    // RD DETAILS
    // =========================

    // Fixed amount deducted every month
    @Column(nullable = false)
    private Double monthlyInstallment;

    // Annual interest rate
    @Column(nullable = false)
    private Double interestRate;

    // RD tenure in months
    @Column(nullable = false)
    private Integer tenureMonths;

    // =========================
    // INSTALLMENT TRACKING
    // =========================

    // Number of installments successfully paid
    @Column(nullable = false)
    private Integer installmentsPaid = 0;

    // Total amount deposited so far
    @Column(nullable = false)
    private Double totalDeposited = 0.0;

    // =========================
    // MATURITY
    // =========================

    // Expected maturity amount
    @Column(nullable = false)
    private Double maturityAmount;

    // RD creation date
    @Column(nullable = false)
    private LocalDateTime createdAt;

    // Maturity date
    @Column(nullable = false)
    private LocalDateTime maturityDate;

    // Next installment date
    @Column(nullable = false)
    private LocalDateTime nextInstallmentDate;

    // =========================
    // STATUS
    // =========================

    // ACTIVE / MATURED / CLOSED
    @Column(nullable = false)
    private String status = "ACTIVE";

    // =========================
    // CONSTRUCTOR
    // =========================

    public RecurringDeposit() {
        this.createdAt = LocalDateTime.now();
        this.installmentsPaid = 0;
        this.totalDeposited = 0.0;
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

    public Double getMonthlyInstallment() {
        return monthlyInstallment;
    }

    public void setMonthlyInstallment(Double monthlyInstallment) {
        this.monthlyInstallment = monthlyInstallment;
    }

    public Double getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(Double interestRate) {
        this.interestRate = interestRate;
    }

    public Integer getTenureMonths() {
        return tenureMonths;
    }

    public void setTenureMonths(Integer tenureMonths) {
        this.tenureMonths = tenureMonths;
    }

    public Integer getInstallmentsPaid() {
        return installmentsPaid;
    }

    public void setInstallmentsPaid(Integer installmentsPaid) {
        this.installmentsPaid = installmentsPaid;
    }

    public Double getTotalDeposited() {
        return totalDeposited;
    }

    public void setTotalDeposited(Double totalDeposited) {
        this.totalDeposited = totalDeposited;
    }

    public Double getMaturityAmount() {
        return maturityAmount;
    }

    public void setMaturityAmount(Double maturityAmount) {
        this.maturityAmount = maturityAmount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getMaturityDate() {
        return maturityDate;
    }

    public void setMaturityDate(LocalDateTime maturityDate) {
        this.maturityDate = maturityDate;
    }

    public LocalDateTime getNextInstallmentDate() {
        return nextInstallmentDate;
    }

    public void setNextInstallmentDate(
            LocalDateTime nextInstallmentDate) {
        this.nextInstallmentDate = nextInstallmentDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}