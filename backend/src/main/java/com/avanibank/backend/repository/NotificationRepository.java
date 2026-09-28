package com.avanibank.backend.repository;

import com.avanibank.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;



public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByCustomerIdOrderByCreatedAtDesc(
            Long customerId
    );

    List<Notification> findByCustomerIdAndReadFalseOrderByCreatedAtDesc(
            Long customerId
    );

    long countByCustomerIdAndReadFalse(
            Long customerId
    );

    Optional<Notification> findByIdAndCustomerId(
            Long id,
            Long customerId
    );

    List<Notification> findAllByOrderByCreatedAtDesc();

    List<Notification> findByNotificationTypeOrderByCreatedAtDesc(
            String notificationType
    );

    List<Notification> findByChannelOrderByCreatedAtDesc(
            String channel
    );
    void deleteByCustomerId(Long customerId);
    boolean existsByCustomerIdAndNotificationTypeAndReferenceTypeAndReferenceId(
        Long customerId,
        String notificationType,
        String referenceType,
        Long referenceId
);

}