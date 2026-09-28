package com.avanibank.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "biometric_verifications")
public class BiometricVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Customer whose biometric verification is being recorded
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    // Type of biometric used
    // Examples: FINGERPRINT, FACE, IRIS
    @Column(nullable = false)
    private String biometricType;

    // Verification result
    // PENDING, VERIFIED, FAILED
    @Column(nullable = false)
    private String status;

    // Optional verification remarks
    @Column(length = 1000)
    private String remarks;

    // Time when verification was performed
    @Column(nullable = false)
    private LocalDateTime verifiedAt;

    // =========================
    // CONSTRUCTOR
    // =========================

    public BiometricVerification() {
    }

    // =========================
    // GETTERS & SETTERS
    // =========================

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

    public String getBiometricType() {
        return biometricType;
    }

    public void setBiometricType(String biometricType) {
        this.biometricType = biometricType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }
}
