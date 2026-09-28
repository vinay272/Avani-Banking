package com.avanibank.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "dividends")
public class Dividend {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(nullable = false)
    private String investmentType;

    @Column(nullable = false)
    private String investmentName;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal dividendAmount;

    @Column(precision = 15, scale = 2)
    private BigDecimal units;

    @Column(precision = 15, scale = 4)
    private BigDecimal dividendPerUnit;

    @Column(nullable = false)
    private LocalDate dividendDate;

    @Column(nullable = false)
    private String status = "RECEIVED";

    private LocalDateTime createdAt;

    public Dividend() {
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (status == null || status.isBlank()) {
            status = "RECEIVED";
        }
    }

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

    public String getInvestmentType() {
        return investmentType;
    }

    public void setInvestmentType(String investmentType) {
        this.investmentType = investmentType;
    }

    public String getInvestmentName() {
        return investmentName;
    }

    public void setInvestmentName(String investmentName) {
        this.investmentName = investmentName;
    }

    public BigDecimal getDividendAmount() {
        return dividendAmount;
    }

    public void setDividendAmount(BigDecimal dividendAmount) {
        this.dividendAmount = dividendAmount;
    }

    public BigDecimal getUnits() {
        return units;
    }

    public void setUnits(BigDecimal units) {
        this.units = units;
    }

    public BigDecimal getDividendPerUnit() {
        return dividendPerUnit;
    }

    public void setDividendPerUnit(BigDecimal dividendPerUnit) {
        this.dividendPerUnit = dividendPerUnit;
    }

    public LocalDate getDividendDate() {
        return dividendDate;
    }

    public void setDividendDate(LocalDate dividendDate) {
        this.dividendDate = dividendDate;
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