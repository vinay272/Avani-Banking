package com.avanibank.backend.controller;

import com.avanibank.backend.service.FraudAlertNotificationService;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/fraud")
public class FraudAlertNotificationController {

    private final FraudAlertNotificationService
            fraudAlertNotificationService;

    public FraudAlertNotificationController(
            FraudAlertNotificationService fraudAlertNotificationService) {

        this.fraudAlertNotificationService =
                fraudAlertNotificationService;
    }

    @GetMapping(
            value = "/alerts/stream",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribeToFraudAlerts(
            Authentication authentication) {

        String customerEmail = authentication.getName();

        return fraudAlertNotificationService
                .subscribe(customerEmail);
    }
}
