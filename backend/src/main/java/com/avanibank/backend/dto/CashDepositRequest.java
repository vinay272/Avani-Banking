package com.avanibank.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class CashDepositRequest {

    @NotBlank(message = "Account number is required")
    private String accountNumber;

    @NotBlank(message = "Cash counter code is required")
    private String counterCode;

    @NotNull(message = "Deposit amount is required")
    @DecimalMin(
            value = "0.01",
            message = "Deposit amount must be greater than 0"
    )
    private BigDecimal amount;

    public CashDepositRequest() {
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getCounterCode() {
        return counterCode;
    }

    public void setCounterCode(String counterCode) {
        this.counterCode = counterCode;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}