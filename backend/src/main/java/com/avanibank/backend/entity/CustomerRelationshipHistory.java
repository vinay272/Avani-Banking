package com.avanibank.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "customer_relationship_history")
public class CustomerRelationshipHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Customer whose relationship history is being recorded
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    // Type of relationship/event
    @Column(nullable = false)
    private String relationshipType;

    // Description of the event
    @Column(length = 1000)
    private String description;

    // Optional reference to related customer
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_customer_id")
    private Customer relatedCustomer;

    // When this relationship/event was created
    @Column(nullable = false)
    private LocalDateTime createdAt;

    // =========================
    // CONSTRUCTOR
    // =========================

    public CustomerRelationshipHistory() {
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

    public String getRelationshipType() {
        return relationshipType;
    }

    public void setRelationshipType(String relationshipType) {
        this.relationshipType = relationshipType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Customer getRelatedCustomer() {
        return relatedCustomer;
    }

    public void setRelatedCustomer(Customer relatedCustomer) {
        this.relatedCustomer = relatedCustomer;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}