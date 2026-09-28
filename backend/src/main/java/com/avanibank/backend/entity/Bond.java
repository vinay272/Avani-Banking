package com.avanibank.backend.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bonds")
public class Bond {

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
    // LINKED ACCOUNT
    // =========================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    // =========================
    // BOND DETAILS
    // =========================

    @Column(nullable = false)
    private String bondName;

    @Column(nullable = false)
    private String bondType;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal faceValue;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal investmentAmount;

    @Column(nullable = false, precision = 6, scale = 3)
    private BigDecimal couponRate;

    @Column(nullable = false)
    private Integer tenureMonths;

    @Column(nullable = false)
    private LocalDate purchaseDate;

    @Column(nullable = false)
    private LocalDate maturityDate;

    @Column(nullable = false)
    private LocalDate nextInterestDate;

    // =========================
    // INTEREST / INCOME
    // =========================

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal totalInterestEarned = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal currentValue = BigDecimal.ZERO;

    // =========================
    // STATUS
    // =========================

    // ACTIVE / MATURED / SOLD / CANCELLED
    @Column(nullable = false)
    private String status = "ACTIVE";

    // =========================
    // AUDIT
    // =========================

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public Bond() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }

        if (totalInterestEarned == null) {
            totalInterestEarned = BigDecimal.ZERO;
        }

        if (currentValue == null) {
            currentValue = BigDecimal.ZERO;
        }

        if (status == null) {
            status = "ACTIVE";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
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

    public String getBondName() {
        return bondName;
    }

    public void setBondName(String bondName) {
        this.bondName = bondName;
    }

    public String getBondType() {
        return bondType;
    }

    public void setBondType(String bondType) {
        this.bondType = bondType;
    }

    public BigDecimal getFaceValue() {
        return faceValue;
    }

    public void setFaceValue(BigDecimal faceValue) {
        this.faceValue = faceValue;
    }

    public BigDecimal getInvestmentAmount() {
        return investmentAmount;
    }

    public void setInvestmentAmount(BigDecimal investmentAmount) {
        this.investmentAmount = investmentAmount;
    }

    public BigDecimal getCouponRate() {
        return couponRate;
    }

    public void setCouponRate(BigDecimal couponRate) {
        this.couponRate = couponRate;
    }

    public Integer getTenureMonths() {
        return tenureMonths;
    }

    public void setTenureMonths(Integer tenureMonths) {
        this.tenureMonths = tenureMonths;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public LocalDate getMaturityDate() {
        return maturityDate;
    }

    public void setMaturityDate(LocalDate maturityDate) {
        this.maturityDate = maturityDate;
    }

    public LocalDate getNextInterestDate() {
        return nextInterestDate;
    }

    public void setNextInterestDate(LocalDate nextInterestDate) {
        this.nextInterestDate = nextInterestDate;
    }

    public BigDecimal getTotalInterestEarned() {
        return totalInterestEarned;
    }

    public void setTotalInterestEarned(BigDecimal totalInterestEarned) {
        this.totalInterestEarned = totalInterestEarned;
    }

    public BigDecimal getCurrentValue() {
        return currentValue;
    }

    public void setCurrentValue(BigDecimal currentValue) {
        this.currentValue = currentValue;
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