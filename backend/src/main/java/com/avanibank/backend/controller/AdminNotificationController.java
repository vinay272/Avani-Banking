package com.avanibank.backend.controller;

import com.avanibank.backend.dto.NotificationRequest;
import com.avanibank.backend.entity.Notification;
import com.avanibank.backend.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/notifications")
public class AdminNotificationController {

    private final NotificationService notificationService;

    public AdminNotificationController(
            NotificationService notificationService) {

        this.notificationService = notificationService;
    }

    // =====================================================
    // CREATE NOTIFICATION
    // =====================================================

    @PostMapping
    public ResponseEntity<Notification> createNotification(
            @Valid @RequestBody NotificationRequest request) {

        return ResponseEntity.ok(
                notificationService.createNotification(request)
        );
    }

    // =====================================================
    // GET ALL NOTIFICATIONS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {

        return ResponseEntity.ok(
                notificationService.getAllNotifications()
        );
    }
}