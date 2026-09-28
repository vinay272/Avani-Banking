package com.avanibank.backend.dto;

import com.avanibank.backend.entity.Customer;

import java.time.LocalDateTime;

public class CustomerProfileResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String accountNumber;
    private String accountType;
    private Double balance;
    private String status;
    private LocalDateTime createdAt;

    public CustomerProfileResponse() {
    }

    public CustomerProfileResponse(Customer customer) {
        this.id = customer.getId();
        this.fullName = customer.getFullName();
        this.email = customer.getEmail();
        this.phone = customer.getPhone();
        this.accountNumber = customer.getAccountNumber();
        this.accountType = customer.getAccountType();
        this.balance = customer.getBalance();
        this.status = customer.getStatus();
        this.createdAt = customer.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public String getAccountType() {
        return accountType;
    }

    public Double getBalance() {
        return balance;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}