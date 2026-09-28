package com.avanibank.backend.dto;

public class CardPinResetRequest {

    private String newPin;

    public CardPinResetRequest() {
    }

    public String getNewPin() {
        return newPin;
    }

    public void setNewPin(String newPin) {
        this.newPin = newPin;
    }
}