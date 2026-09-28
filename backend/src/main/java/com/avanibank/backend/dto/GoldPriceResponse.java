package com.avanibank.backend.dto;

import java.math.BigDecimal;

public class GoldPriceResponse {

    private String goldType;
    private String purity;
    private BigDecimal pricePerGram;
    private BigDecimal minimumInvestment;

    public GoldPriceResponse() {
    }

    public GoldPriceResponse(
            String goldType,
            String purity,
            BigDecimal pricePerGram,
            BigDecimal minimumInvestment) {

        this.goldType = goldType;
        this.purity = purity;
        this.pricePerGram = pricePerGram;
        this.minimumInvestment = minimumInvestment;
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

    public BigDecimal getPricePerGram() {
        return pricePerGram;
    }

    public void setPricePerGram(BigDecimal pricePerGram) {
        this.pricePerGram = pricePerGram;
    }

    public BigDecimal getMinimumInvestment() {
        return minimumInvestment;
    }

    public void setMinimumInvestment(
            BigDecimal minimumInvestment) {

        this.minimumInvestment = minimumInvestment;
    }
}