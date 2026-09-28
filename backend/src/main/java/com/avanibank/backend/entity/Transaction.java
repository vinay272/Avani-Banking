package com.avanibank.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = true)
    private String senderAccountNumber;

    @Column(nullable = false)
    private String receiverAccountNumber;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String transactionType;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private LocalDateTime transactionDate;

    @Column(unique = true)
    private String transactionReference;

    private String branchCode;

    private String cashCounterCode;

    private String cashierEmployeeCode;

    public Transaction() {
        this.transactionDate = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSenderAccountNumber() {
        return senderAccountNumber;
    }

    public void setSenderAccountNumber(String senderAccountNumber) {
        this.senderAccountNumber = senderAccountNumber;
    }

    public String getReceiverAccountNumber() {
        return receiverAccountNumber;
    }

    public void setReceiverAccountNumber(String receiverAccountNumber) {
        this.receiverAccountNumber = receiverAccountNumber;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }

    public String getTransactionReference() {
    return transactionReference;
}

public void setTransactionReference(String transactionReference) {
    this.transactionReference = transactionReference;
}

public String getBranchCode() {
    return branchCode;
}

public void setBranchCode(String branchCode) {
    this.branchCode = branchCode;
}

public String getCashCounterCode() {
    return cashCounterCode;
}

public void setCashCounterCode(String cashCounterCode) {
    this.cashCounterCode = cashCounterCode;
}

public String getCashierEmployeeCode() {
    return cashierEmployeeCode;
}

public void setCashierEmployeeCode(String cashierEmployeeCode) {
    this.cashierEmployeeCode = cashierEmployeeCode;
}
}