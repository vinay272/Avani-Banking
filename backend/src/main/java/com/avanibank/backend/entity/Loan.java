package com.avanibank.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "loans")
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =====================================================
    // CUSTOMER
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    // =====================================================
    // DISBURSEMENT ACCOUNT
    // =====================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    // =====================================================
    // LOAN DETAILS
    // =====================================================

    @Column(nullable = false)
    private String loanType;

    @Column(nullable = false)
    private Double requestedAmount;

    @Column(nullable = false)
    private Integer tenureMonths;

    @Column(nullable = false)
    private String purpose;

    // =====================================================
    // APPLICANT DETAILS
    // =====================================================

    @Column(nullable = false)
    private Double monthlyIncome;

    @Column(nullable = false)
    private String employmentType;

    // =====================================================
    // ELIGIBILITY / CREDIT
    // =====================================================

    @Column
    private Integer creditScore;

    @Column
    private String eligibilityStatus;

    // =====================================================
    // APPROVAL DETAILS
    // =====================================================

    @Column
    private Double approvedAmount;

    @Column
    private Double interestRate;

    @Column
    private Double emiAmount;

    // =====================================================
    // DISBURSEMENT
    // =====================================================

    @Column
    private Double disbursedAmount;

    @Column
    private LocalDate disbursementDate;

    // =====================================================
    // LOAN STATUS
    // =====================================================

    @Column(nullable = false)
    private String status;

    @Column
    private Double foreclosureAmount;

    @Column
    private LocalDate foreclosureDate;

    @Column
    private String foreclosureReason;

    /*
     * APPLIED
     * UNDER_REVIEW
     * APPROVED
     * REJECTED
     * DISBURSED
     * ACTIVE
     * FORECLOSED
     * NPA
     * CLOSED
     */

    // =====================================================
    // DATES
    // =====================================================

    @Column(nullable = false)
    private LocalDate applicationDate;

    @Column
    private LocalDateTime approvedAt;

    @Column
    private LocalDateTime createdAt;

    @Column
    private String approvalReason;

    @Column
    private String rejectionReason;

    @Column
    private LocalDate npaDate;

    @Column
    private Integer overdueDays;

    @Column
    private String npaReason;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public Loan() {

        this.applicationDate =
                LocalDate.now();

        this.createdAt =
                LocalDateTime.now();

        this.status =
                "APPLIED";
    }

    // =====================================================
    // GETTERS / SETTERS
    // =====================================================

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

    public String getLoanType() {
        return loanType;
    }

    public void setLoanType(String loanType) {
        this.loanType = loanType;
    }

    public Double getRequestedAmount() {
        return requestedAmount;
    }

    public void setRequestedAmount(Double requestedAmount) {
        this.requestedAmount = requestedAmount;
    }

    public Integer getTenureMonths() {
        return tenureMonths;
    }

    public void setTenureMonths(Integer tenureMonths) {
        this.tenureMonths = tenureMonths;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public Double getMonthlyIncome() {
        return monthlyIncome;
    }

    public void setMonthlyIncome(Double monthlyIncome) {
        this.monthlyIncome = monthlyIncome;
    }

    public String getEmploymentType() {
        return employmentType;
    }

    public void setEmploymentType(String employmentType) {
        this.employmentType = employmentType;
    }

    public Integer getCreditScore() {
        return creditScore;
    }

    public void setCreditScore(Integer creditScore) {
        this.creditScore = creditScore;
    }

    public String getEligibilityStatus() {
        return eligibilityStatus;
    }

    public void setEligibilityStatus(String eligibilityStatus) {
        this.eligibilityStatus = eligibilityStatus;
    }

    public Double getApprovedAmount() {
        return approvedAmount;
    }

    public void setApprovedAmount(Double approvedAmount) {
        this.approvedAmount = approvedAmount;
    }

    public Double getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(Double interestRate) {
        this.interestRate = interestRate;
    }

    public Double getEmiAmount() {
        return emiAmount;
    }

    public void setEmiAmount(Double emiAmount) {
        this.emiAmount = emiAmount;
    }

    public Double getDisbursedAmount() {
        return disbursedAmount;
    }

    public void setDisbursedAmount(Double disbursedAmount) {
        this.disbursedAmount = disbursedAmount;
    }

    public LocalDate getDisbursementDate() {
        return disbursementDate;
    }

    public void setDisbursementDate(LocalDate disbursementDate) {
        this.disbursementDate = disbursementDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getApplicationDate() {
        return applicationDate;
    }

    public void setApplicationDate(LocalDate applicationDate) {
        this.applicationDate = applicationDate;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getApprovalReason() {
    return approvalReason;
    }

    public void setApprovalReason(String approvalReason) {
    this.approvalReason = approvalReason;
    }   

    public String getRejectionReason() {
    return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
    this.rejectionReason = rejectionReason;
    }

    public Double getForeclosureAmount() {
    return foreclosureAmount;
    }

    public void setForeclosureAmount(Double foreclosureAmount) {
    this.foreclosureAmount = foreclosureAmount;
    }

    public LocalDate getForeclosureDate() {
    return foreclosureDate;
    }

    public void setForeclosureDate(LocalDate foreclosureDate) {
    this.foreclosureDate = foreclosureDate;
    }

    public String getForeclosureReason() {
    return foreclosureReason;
    }

    public void setForeclosureReason(String foreclosureReason) {
    this.foreclosureReason = foreclosureReason;
    }

    public LocalDate getNpaDate() {
    return npaDate;
    }

    public void setNpaDate(LocalDate npaDate) {
    this.npaDate = npaDate;
    }

    public Integer getOverdueDays() {
    return overdueDays;
    }

    public void setOverdueDays(Integer overdueDays) {
    this.overdueDays = overdueDays;
    }

    public String getNpaReason() {
    return npaReason;
    }

    public void setNpaReason(String npaReason) {
    this.npaReason = npaReason;
    }
}