package com.avanibank.backend.service;

import com.avanibank.backend.dto.NotificationRequest;
import com.avanibank.backend.entity.Account;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.repository.NotificationRepository;

import org.springframework.stereotype.Service;

@Service
public class LowBalanceAlertService {

    private static final double LOW_BALANCE_THRESHOLD = 1000.0;

    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;
    
    public LowBalanceAlertService(
            NotificationService notificationService,
            NotificationRepository notificationRepository) {
            this.notificationService = notificationService;
            this.notificationRepository = notificationRepository;
    }

    public void checkAndNotify(
            Customer customer,
            Account account) {

        if (customer == null || account == null) {
            return;
        }

        Double balance = account.getBalance();

        if (balance == null || balance > LOW_BALANCE_THRESHOLD) {
            return;
        }

        boolean alreadyNotified =
        notificationRepository
                .existsByCustomerIdAndNotificationTypeAndReferenceTypeAndReferenceId(
                        customer.getId(),
                        "LOW_BALANCE_ALERT",
                        "LOW_BALANCE",
                        account.getId()
                );

if (alreadyNotified) {
    return;
}

        NotificationRequest request =
                new NotificationRequest();

        request.setCustomerId(customer.getId());
        request.setReferenceType("LOW_BALANCE");
        request.setReferenceId(account.getId());
        request.setNotificationType("LOW_BALANCE_ALERT");
        request.setChannel("IN_APP");
        request.setTitle("Low Balance Alert");
        request.setMessage(
                "Your account balance is ₹"
                        + balance
                        + ". Please maintain sufficient balance "
                        + "to avoid transaction failures.");

        notificationService.createNotification(request);
    }
}