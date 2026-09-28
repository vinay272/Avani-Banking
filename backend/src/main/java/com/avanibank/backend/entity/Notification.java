package com.avanibank.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonIgnore
    private Customer customer;

    @Column(nullable = false, length = 50)
    private String notificationType;

    @Column(nullable = false, length = 20)
    private String channel;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 5000)
    private String message;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(length = 20)
    private String deliveryStatus;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime readAt;
    @Column
    private String referenceType;

    @Column
    private Long referenceId;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (deliveryStatus == null) {
            deliveryStatus = "CREATED";
        }
    }
}