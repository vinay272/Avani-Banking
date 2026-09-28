package com.avanibank.backend.dto;

import com.avanibank.backend.entity.Customer;

public class LoginResponse {

    private String message;
    private String token;
    private Customer customer;

    public LoginResponse() {
    }

    public LoginResponse(String message, String token, Customer customer) {
        this.message = message;
        this.token = token;
        this.customer = customer;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }
}