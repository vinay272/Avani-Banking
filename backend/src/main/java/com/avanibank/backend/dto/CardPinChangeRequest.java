package com.avanibank.backend.dto;

public class CardPinChangeRequest {

    private String currentPin;
    private String newPin;

    public CardPinChangeRequest() {
    }

    public String getCurrentPin() {
        return currentPin;
    }

    public void setCurrentPin(String currentPin) {
        this.currentPin = currentPin;
    }

    public String getNewPin() {
        return newPin;
    }

    public void setNewPin(String newPin) {
        this.newPin = newPin;
    }
}