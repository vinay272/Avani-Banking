package com.avanibank.backend.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "gold_investments")
public class GoldInvestment {

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
    // ACCOUNT
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    // =====================================================
    // GOLD DETAILS
    // =====================================================

    @Column(nullable = false)
    private String goldType;

    /*
     * Gold purity:
     * 24K / 22K
     */
    @Column(nullable = false)
    private String purity;

    /*
     * Gold quantity in grams
     */
    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal quantityGrams;

    /*
     * Gold price per gram at purchase time
     */
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal purchasePricePerGram;

    /*
     * Total amount invested
     */
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal investmentAmount;

    /*
     * Current gold price per gram
     */
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal currentPricePerGram;

    /*
     * Current market value
     */
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal currentValue;

    /*
     * Profit / Loss
     */
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal profitLoss = BigDecimal.ZERO;

    // =====================================================
    // DATES
    // =====================================================

    @Column(nullable = false)
    private LocalDate purchaseDate;

    // =====================================================
    // STATUS
    // =====================================================

    // ACTIVE / SOLD / CANCELLED
    @Column(nullable = false)
    private String status = "ACTIVE";

    // =====================================================
    // AUDIT
    // =====================================================

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public GoldInvestment() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // =====================================================
    // JPA CALLBACKS
    // =====================================================

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }

        if (profitLoss == null) {
            profitLoss = BigDecimal.ZERO;
        }

        if (status == null) {
            status = "ACTIVE";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
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

    public String getGoldType() {
        return goldType;
    }

    public void setGoldType(String goldType) {
        this.goldType = goldType;
    }

    public String getPurity() {
        return purity;
    }

    public void setPurity(String purity) {
        this.purity = purity;
    }

    public BigDecimal getQuantityGrams() {
        return quantityGrams;
    }

    public void setQuantityGrams(BigDecimal quantityGrams) {
        this.quantityGrams = quantityGrams;
    }

    public BigDecimal getPurchasePricePerGram() {
        return purchasePricePerGram;
    }

    public void setPurchasePricePerGram(BigDecimal purchasePricePerGram) {
        this.purchasePricePerGram = purchasePricePerGram;
    }

    public BigDecimal getInvestmentAmount() {
        return investmentAmount;
    }

    public void setInvestmentAmount(BigDecimal investmentAmount) {
        this.investmentAmount = investmentAmount;
    }

    public BigDecimal getCurrentPricePerGram() {
        return currentPricePerGram;
    }

    public void setCurrentPricePerGram(BigDecimal currentPricePerGram) {
        this.currentPricePerGram = currentPricePerGram;
    }

    public BigDecimal getCurrentValue() {
        return currentValue;
    }

    public void setCurrentValue(BigDecimal currentValue) {
        this.currentValue = currentValue;
    }

    public BigDecimal getProfitLoss() {
        return profitLoss;
    }

    public void setProfitLoss(BigDecimal profitLoss) {
        this.profitLoss = profitLoss;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
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