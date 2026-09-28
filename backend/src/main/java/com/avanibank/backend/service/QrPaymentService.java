package com.avanibank.backend.service;

import com.avanibank.backend.dto.QrPaymentRequest;
import com.avanibank.backend.dto.QrPaymentResponse;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.UUID;

@Service
public class QrPaymentService {

    // =====================================================
    // GENERATE QR PAYMENT DATA
    // =====================================================

    public QrPaymentResponse generateQrPayment(
            String customerEmail,
            QrPaymentRequest request) {

        if (request == null) {
            throw new RuntimeException(
                    "QR payment request cannot be empty"
            );
        }

        String upiId = request.getUpiId() == null
                ? ""
                : request.getUpiId().trim().toLowerCase(Locale.ROOT);

        String receiverName = request.getReceiverName() == null
                ? ""
                : request.getReceiverName().trim();

        Double amount = request.getAmount();

        if (upiId.isEmpty()) {
            throw new RuntimeException("UPI ID is required");
        }

        // Basic UPI ID validation.
        // Example: username@bank
        if (!upiId.matches("^[a-z0-9._-]{2,256}@[a-z0-9.-]{2,64}$")) {
            throw new RuntimeException("Invalid UPI ID format");
        }

        if (receiverName.isEmpty()) {
            throw new RuntimeException("Receiver name is required");
        }

        if (amount == null || !Double.isFinite(amount) || amount <= 0) {
            throw new RuntimeException(
                    "Payment amount must be greater than 0"
            );
        }

        if (amount > 1000000.00) {
            throw new RuntimeException(
                    "Payment amount exceeds the allowed QR limit"
            );
        }

        if (customerEmail == null || customerEmail.isBlank()) {
            throw new RuntimeException("Authenticated customer not found");
        }

        String reference = "QR" +
                UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        .substring(0, 16)
                        .toUpperCase(Locale.ROOT);

        String upiUrl =
                "upi://pay" +
                "?pa=" + encode(upiId) +
                "&pn=" + encode(receiverName) +
                "&am=" + encode(String.format(Locale.US, "%.2f", amount)) +
                "&cu=INR" +
                "&tr=" + encode(reference);

        return new QrPaymentResponse(
                reference,
                "PENDING",
                upiId,
                receiverName,
                amount,
                "INR",
                upiUrl
        );
    }

    private String encode(String value) {
        return URLEncoder.encode(
                value,
                StandardCharsets.UTF_8
        );
    }
}
