package com.avanibank.backend.controller;

import com.avanibank.backend.entity.Notification;
import com.avanibank.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService) {

        this.notificationService = notificationService;
    }

    // =====================================================
    // ALL NOTIFICATIONS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(
            Authentication authentication) {

        return ResponseEntity.ok(
                notificationService.getCustomerNotifications(
                        authentication.getName()
                )
        );
    }

    // =====================================================
    // UNREAD NOTIFICATIONS
    // =====================================================

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(
            Authentication authentication) {

        return ResponseEntity.ok(
                notificationService.getUnreadNotifications(
                        authentication.getName()
                )
        );
    }

    // =====================================================
    // UNREAD COUNT
    // =====================================================

    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            Authentication authentication) {

        Map<String, Long> response =
                new HashMap<>();

        response.put(
                "unreadCount",
                notificationService.getUnreadCount(
                        authentication.getName()
                )
        );

        return ResponseEntity.ok(response);
    }

    // =====================================================
    // MARK ONE AS READ
    // =====================================================

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                notificationService.markAsRead(
                        authentication.getName(),
                        id
                )
        );
    }

    // =====================================================
    // MARK ALL AS READ
    // =====================================================

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(
            Authentication authentication) {

        int count =
                notificationService.markAllAsRead(
                        authentication.getName()
                );

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "message",
                "All notifications marked as read"
        );

        response.put(
                "updatedCount",
                count
        );

        return ResponseEntity.ok(response);
    }

    // =====================================================
// CLEAR ALL NOTIFICATIONS
// =====================================================

@DeleteMapping
public ResponseEntity<Map<String, Object>> clearAllNotifications(
        Authentication authentication) {

    notificationService.clearAllNotifications(
            authentication.getName()
    );

    Map<String, Object> response =
            new HashMap<>();

    response.put(
            "message",
            "All notifications cleared successfully"
    );

    return ResponseEntity.ok(response);
        }
}