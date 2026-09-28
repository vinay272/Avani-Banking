package com.avanibank.backend.dto;

import com.avanibank.backend.entity.Card;

import java.time.LocalDate;

public class CardResponse {

    private Long id;
    private String cardType;
    private String cardNetwork;
    private String maskedCardNumber;
    private LocalDate expiryDate;
    private String status;

    private Boolean pinSet;
    private Boolean internationalUsageEnabled;

    private Double dailyTransactionLimit;
    private Double monthlyTransactionLimit;

    private Long rewardPoints;
    private Double creditLimit;

    public CardResponse(Card card) {
        this.id = card.getId();
        this.cardType = card.getCardType();
        this.cardNetwork = card.getCardNetwork();
        this.maskedCardNumber = card.getMaskedCardNumber();
        this.expiryDate = card.getExpiryDate();
        this.status = card.getStatus();

        this.pinSet = card.getPinSet();
        this.internationalUsageEnabled =
                card.getInternationalUsageEnabled();

        this.dailyTransactionLimit =
                card.getDailyTransactionLimit();

        this.monthlyTransactionLimit =
                card.getMonthlyTransactionLimit();

        this.rewardPoints = card.getRewardPoints();
        this.creditLimit = card.getCreditLimit();
    }

    public Long getId() {
        return id;
    }

    public String getCardType() {
        return cardType;
    }

    public String getCardNetwork() {
        return cardNetwork;
    }

    public String getMaskedCardNumber() {
        return maskedCardNumber;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public String getStatus() {
        return status;
    }

    public Boolean getPinSet() {
        return pinSet;
    }

    public Boolean getInternationalUsageEnabled() {
        return internationalUsageEnabled;
    }

    public Double getDailyTransactionLimit() {
        return dailyTransactionLimit;
    }

    public Double getMonthlyTransactionLimit() {
        return monthlyTransactionLimit;
    }

    public Long getRewardPoints() {
        return rewardPoints;
    }

    public Double getCreditLimit() {
        return creditLimit;
    }
}