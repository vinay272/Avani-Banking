package com.avanibank.backend.dto;

import com.avanibank.backend.entity.Account;

public class AccountResponse {

    private Long id;
    private String accountNumber;
    private String ifscCode;
    private String accountType;
    private Double balance;
    private Double interestRate;
    private String status;

    public AccountResponse(Account account) {

        this.id = account.getId();
        this.accountNumber = account.getAccountNumber();
        this.ifscCode = account.getIfscCode();
        this.accountType = account.getAccountType();
        this.balance = account.getBalance();
        this.interestRate = account.getInterestRate();
        this.status = account.getStatus();
    }

    // =========================
    // GETTERS
    // =========================

    public Long getId() {
        return id;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public String getIfscCode() {
        return ifscCode;
    }

    public String getAccountType() {
        return accountType;
    }

    public Double getBalance() {
        return balance;
    }

    public Double getInterestRate() {
        return interestRate;
    }

    public String getStatus() {
        return status;
    }
}