package com.avanibank.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "cards",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = "card_number_hash")
    }
)
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "card_type", nullable = false)
    private String cardType; // DEBIT / CREDIT

    @Column(name = "card_network", nullable = false)
    private String cardNetwork; // VISA / MASTERCARD

    @Column(name = "card_number_hash", nullable = false, unique = true)
    private String cardNumberHash;

    @Column(name = "masked_card_number", nullable = false)
    private String maskedCardNumber;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "status", nullable = false)
    private String status; // ISSUED / ACTIVE / BLOCKED / REPLACED

    @Column(name = "pin_hash")
    private String pinHash;

    @Column(name = "pin_set", nullable = false)
    private Boolean pinSet = false;

    @Column(name = "international_usage_enabled", nullable = false)
    private Boolean internationalUsageEnabled = false;

    @Column(name = "daily_transaction_limit", nullable = false)
    private Double dailyTransactionLimit;

    @Column(name = "monthly_transaction_limit", nullable = false)
    private Double monthlyTransactionLimit;

    @Column(name = "reward_points", nullable = false)
    private Long rewardPoints = 0L;

    @Column(name = "credit_limit")
    private Double creditLimit;

    @Column(name = "issued_at", nullable = false)
    private LocalDateTime issuedAt;

    @Column(name = "activated_at")
    private LocalDateTime activatedAt;

    @Column(name = "blocked_at")
    private LocalDateTime blockedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Card() {
        this.createdAt = LocalDateTime.now();
        this.issuedAt = LocalDateTime.now();
        this.status = "ISSUED";
        this.pinSet = false;
        this.internationalUsageEnabled = false;
        this.rewardPoints = 0L;
    }

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

    public String getCardType() {
        return cardType;
    }

    public void setCardType(String cardType) {
        this.cardType = cardType;
    }

    public String getCardNetwork() {
        return cardNetwork;
    }

    public void setCardNetwork(String cardNetwork) {
        this.cardNetwork = cardNetwork;
    }

    public String getCardNumberHash() {
        return cardNumberHash;
    }

    public void setCardNumberHash(String cardNumberHash) {
        this.cardNumberHash = cardNumberHash;
    }

    public String getMaskedCardNumber() {
        return maskedCardNumber;
    }

    public void setMaskedCardNumber(String maskedCardNumber) {
        this.maskedCardNumber = maskedCardNumber;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPinHash() {
        return pinHash;
    }

    public void setPinHash(String pinHash) {
        this.pinHash = pinHash;
    }

    public Boolean getPinSet() {
        return pinSet;
    }

    public void setPinSet(Boolean pinSet) {
        this.pinSet = pinSet;
    }

    public Boolean getInternationalUsageEnabled() {
        return internationalUsageEnabled;
    }

    public void setInternationalUsageEnabled(Boolean internationalUsageEnabled) {
        this.internationalUsageEnabled = internationalUsageEnabled;
    }

    public Double getDailyTransactionLimit() {
        return dailyTransactionLimit;
    }

    public void setDailyTransactionLimit(Double dailyTransactionLimit) {
        this.dailyTransactionLimit = dailyTransactionLimit;
    }

    public Double getMonthlyTransactionLimit() {
        return monthlyTransactionLimit;
    }

    public void setMonthlyTransactionLimit(Double monthlyTransactionLimit) {
        this.monthlyTransactionLimit = monthlyTransactionLimit;
    }

    public Long getRewardPoints() {
        return rewardPoints;
    }

    public void setRewardPoints(Long rewardPoints) {
        this.rewardPoints = rewardPoints;
    }

    public Double getCreditLimit() {
        return creditLimit;
    }

    public void setCreditLimit(Double creditLimit) {
        this.creditLimit = creditLimit;
    }

    public LocalDateTime getIssuedAt() {
        return issuedAt;
    }

    public void setIssuedAt(LocalDateTime issuedAt) {
        this.issuedAt = issuedAt;
    }

    public LocalDateTime getActivatedAt() {
        return activatedAt;
    }

    public void setActivatedAt(LocalDateTime activatedAt) {
        this.activatedAt = activatedAt;
    }

    public LocalDateTime getBlockedAt() {
        return blockedAt;
    }

    public void setBlockedAt(LocalDateTime blockedAt) {
        this.blockedAt = blockedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}