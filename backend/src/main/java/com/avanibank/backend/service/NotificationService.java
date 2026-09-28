package com.avanibank.backend.service;

import com.avanibank.backend.dto.NotificationRequest;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.Notification;
import com.avanibank.backend.repository.NotificationRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class NotificationService {

        private final NotificationRepository notificationRepository;
        private final CustomerService customerService;

        private static final Set<String> NOTIFICATION_TYPES = Set.of(
                        "LOGIN_ALERT",
                        "DEBIT_ALERT",
                        "CREDIT_ALERT",
                        "LOAN_EMI_REMINDER",
                        "LOW_BALANCE_ALERT",
                        "CARD_USAGE_ALERT",
                        "SUSPICIOUS_ACTIVITY_ALERT",
                        "INVESTMENT_MATURITY_ALERT");

        private static final Set<String> CHANNELS = Set.of(
                        "SMS",
                        "EMAIL",
                        "PUSH",
                        "IN_APP");

        public NotificationService(
                        NotificationRepository notificationRepository,
                        CustomerService customerService) {

                this.notificationRepository = notificationRepository;
                this.customerService = customerService;
        }

        // =====================================================
        // CREATE NOTIFICATION
        // =====================================================

        @Transactional
        public Notification createNotification(
                        NotificationRequest request) {

                validateRequest(request);

                Customer customer = customerService.getCustomerById(
                                request.getCustomerId());

                Notification notification = new Notification();

                notification.setCustomer(customer);

                notification.setNotificationType(
                                request.getNotificationType()
                                                .trim()
                                                .toUpperCase(Locale.ROOT));

                notification.setChannel(
                                request.getChannel()
                                                .trim()
                                                .toUpperCase(Locale.ROOT));

                notification.setTitle(
                                request.getTitle().trim());

                notification.setMessage(
                                request.getMessage().trim());

                if ("IN_APP".equals(notification.getChannel())) {
                        notification.setDeliveryStatus("DELIVERED");
                } else {
                        notification.setDeliveryStatus("PENDING");
                }

                notification.setReferenceType(
                                request.getReferenceType());

                notification.setReferenceId(
                                request.getReferenceId());

                return notificationRepository.save(notification);
        }

        // =====================================================
        // GET ALL CUSTOMER NOTIFICATIONS
        // =====================================================

        public List<Notification> getCustomerNotifications(
                        String email) {

                Customer customer = customerService.getCustomerByEmail(email);

                return notificationRepository
                                .findByCustomerIdOrderByCreatedAtDesc(
                                                customer.getId());
        }

        // =====================================================
        // GET UNREAD NOTIFICATIONS
        // =====================================================

        public List<Notification> getUnreadNotifications(
                        String email) {

                Customer customer = customerService.getCustomerByEmail(email);

                return notificationRepository
                                .findByCustomerIdAndReadFalseOrderByCreatedAtDesc(
                                                customer.getId());
        }

        // =====================================================
        // UNREAD COUNT
        // =====================================================

        public long getUnreadCount(String email) {

                Customer customer = customerService.getCustomerByEmail(email);

                return notificationRepository
                                .countByCustomerIdAndReadFalse(
                                                customer.getId());
        }

        // =====================================================
        // MARK SINGLE NOTIFICATION AS READ
        // =====================================================

        @Transactional
        public Notification markAsRead(
                        String email,
                        Long notificationId) {

                Customer customer = customerService.getCustomerByEmail(email);

                Notification notification = notificationRepository
                                .findByIdAndCustomerId(
                                                notificationId,
                                                customer.getId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Notification not found"));

                if (!notification.isRead()) {
                        notification.setRead(true);
                        notification.setReadAt(LocalDateTime.now());

                        notification = notificationRepository.save(notification);
                }

                return notification;
        }

        // =====================================================
        // MARK ALL AS READ
        // =====================================================

        @Transactional
        public int markAllAsRead(String email) {

                Customer customer = customerService.getCustomerByEmail(email);

                List<Notification> notifications = notificationRepository
                                .findByCustomerIdAndReadFalseOrderByCreatedAtDesc(
                                                customer.getId());

                LocalDateTime now = LocalDateTime.now();

                for (Notification notification : notifications) {
                        notification.setRead(true);
                        notification.setReadAt(now);
                }

                notificationRepository.saveAll(notifications);

                return notifications.size();
        }

        // =====================================================
        // CLEAR ALL CUSTOMER NOTIFICATIONS
        // =====================================================
        @Transactional
        public void clearAllNotifications(String email) {

                Customer customer = customerService.getCustomerByEmail(email);

                notificationRepository.deleteByCustomerId(
                                customer.getId());
        }

        // =====================================================
        // ADMIN / SYSTEM NOTIFICATIONS
        // =====================================================

        public List<Notification> getAllNotifications() {
                return notificationRepository
                                .findAllByOrderByCreatedAtDesc();
        }

        // =====================================================
        // VALIDATION
        // =====================================================

        private void validateRequest(
                        NotificationRequest request) {

                if (request == null) {
                        throw new RuntimeException(
                                        "Notification request cannot be empty");
                }

                if (request.getNotificationType() == null
                                || !NOTIFICATION_TYPES.contains(
                                                request.getNotificationType()
                                                                .trim()
                                                                .toUpperCase(Locale.ROOT))) {

                        throw new RuntimeException(
                                        "Invalid notification type");
                }

                if (request.getChannel() == null
                                || !CHANNELS.contains(
                                                request.getChannel()
                                                                .trim()
                                                                .toUpperCase(Locale.ROOT))) {

                        throw new RuntimeException(
                                        "Invalid notification channel");
                }
        }
}