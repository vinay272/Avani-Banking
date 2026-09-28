package com.avanibank.backend.service;

import com.avanibank.backend.dto.NotificationRequest;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class InvestmentMaturityAlertService {

    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;

    public InvestmentMaturityAlertService(
            NotificationRepository notificationRepository,
            NotificationService notificationService) {

        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
    }

    public void sendMaturityAlert(
            Customer customer,
            Long investmentId,
            String investmentName,
            LocalDate maturityDate,
            Double maturityAmount) {

        if (customer == null || investmentId == null
                || maturityDate == null) {
            return;
        }

        boolean alreadyNotified = notificationRepository
                .existsByCustomerIdAndNotificationTypeAndReferenceTypeAndReferenceId(
                        customer.getId(),
                        "INVESTMENT_MATURITY_ALERT",
                        "FIXED_DEPOSIT",
                        investmentId);

        if (alreadyNotified) {
            System.out.println(
                    "FD MATURITY ALERT: Already notified for FD ID = "
                            + investmentId);
            return;
        }

        System.out.println(
                "FD MATURITY ALERT: Creating notification for FD ID = "
                        + investmentId);

        NotificationRequest request = new NotificationRequest();

        request.setCustomerId(customer.getId());

        request.setNotificationType(
                "INVESTMENT_MATURITY_ALERT");

        request.setChannel("IN_APP");

        request.setTitle(
                "Investment Maturity Alert");

        String message = investmentName
                + " is maturing on "
                + maturityDate
                + ".";

        if (maturityAmount != null) {
            message += " Expected maturity amount: ₹"
                    + maturityAmount + ".";
        }

        request.setMessage(message);

        request.setReferenceType(
                "FIXED_DEPOSIT");

        request.setReferenceId(
                investmentId);

        notificationService.createNotification(
                request);

        System.out.println(
                "FD MATURITY ALERT: Notification created for FD ID = "
                        + investmentId);
    }
}