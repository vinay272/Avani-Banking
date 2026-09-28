package com.avanibank.backend.controller;

import com.avanibank.backend.dto.QrPaymentRequest;
import com.avanibank.backend.dto.QrPaymentResponse;
import com.avanibank.backend.service.QrPaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class QrPaymentController {

    private final QrPaymentService qrPaymentService;

    public QrPaymentController(QrPaymentService qrPaymentService) {
        this.qrPaymentService = qrPaymentService;
    }

    // =====================================================
    // GENERATE QR PAYMENT
    // =====================================================

    @PostMapping("/qr")
    public ResponseEntity<QrPaymentResponse> generateQrPayment(
            Authentication authentication,
            @RequestBody QrPaymentRequest request) {

        String customerEmail = authentication == null
                ? null
                : authentication.getName();

        QrPaymentResponse response =
                qrPaymentService.generateQrPayment(
                        customerEmail,
                        request
                );

        return ResponseEntity.ok(response);
    }
}
