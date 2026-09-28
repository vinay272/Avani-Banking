package com.avanibank.backend.controller;

import com.avanibank.backend.dto.AutoPayRequest;
import com.avanibank.backend.entity.AutoPay;
import com.avanibank.backend.service.AutoPayService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/autopay")
@CrossOrigin(origins = "*")
public class AutoPayController {

    private final AutoPayService autoPayService;

    public AutoPayController(
            AutoPayService autoPayService) {

        this.autoPayService = autoPayService;
    }

    // =====================================================
    // GET LOGGED-IN CUSTOMER EMAIL FROM JWT
    // =====================================================

    private String getLoggedInEmail() {

        return SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
    }

    // =====================================================
    // CREATE AUTO-PAY
    // =====================================================

    @PostMapping
    public ResponseEntity<AutoPay> createAutoPay(
            @RequestBody AutoPayRequest request) {

        String email = getLoggedInEmail();

        AutoPay autoPay =
                autoPayService.createAutoPay(
                        email,
                        request
                );

        return ResponseEntity.ok(autoPay);
    }

    // =====================================================
    // GET ALL AUTO-PAYS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<AutoPay>> getAutoPays() {

        String email = getLoggedInEmail();

        return ResponseEntity.ok(
                autoPayService.getCustomerAutoPays(
                        email
                )
        );
    }

    // =====================================================
    // GET ACTIVE AUTO-PAYS
    // =====================================================

    @GetMapping("/active")
    public ResponseEntity<List<AutoPay>> getActiveAutoPays() {

        String email = getLoggedInEmail();

        return ResponseEntity.ok(
                autoPayService.getActiveAutoPays(
                        email
                )
        );
    }

    // =====================================================
    // GET SINGLE AUTO-PAY
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<AutoPay> getAutoPay(
            @PathVariable Long id) {

        String email = getLoggedInEmail();

        return ResponseEntity.ok(
                autoPayService.getAutoPay(
                        email,
                        id
                )
        );
    }

    // =====================================================
    // PAUSE AUTO-PAY
    // =====================================================

    @PutMapping("/{id}/pause")
    public ResponseEntity<AutoPay> pauseAutoPay(
            @PathVariable Long id) {

        String email = getLoggedInEmail();

        return ResponseEntity.ok(
                autoPayService.pauseAutoPay(
                        email,
                        id
                )
        );
    }

    // =====================================================
    // RESUME AUTO-PAY
    // =====================================================

    @PutMapping("/{id}/resume")
    public ResponseEntity<AutoPay> resumeAutoPay(
            @PathVariable Long id) {

        String email = getLoggedInEmail();

        return ResponseEntity.ok(
                autoPayService.resumeAutoPay(
                        email,
                        id
                )
        );
    }

    // =====================================================
    // CANCEL AUTO-PAY
    // =====================================================

    @PutMapping("/{id}/cancel")
    public ResponseEntity<AutoPay> cancelAutoPay(
            @PathVariable Long id) {

        String email = getLoggedInEmail();

        return ResponseEntity.ok(
                autoPayService.cancelAutoPay(
                        email,
                        id
                )
        );
    }

    // =====================================================
    // DELETE AUTO-PAY
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAutoPay(
            @PathVariable Long id) {

        String email = getLoggedInEmail();

        autoPayService.deleteAutoPay(
                email,
                id
        );

        return ResponseEntity.noContent().build();
    }
}