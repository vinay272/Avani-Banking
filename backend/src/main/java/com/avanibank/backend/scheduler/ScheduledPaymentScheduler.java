package com.avanibank.backend.scheduler;

import com.avanibank.backend.service.ScheduledPaymentService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ScheduledPaymentScheduler {

    private final ScheduledPaymentService scheduledPaymentService;

    public ScheduledPaymentScheduler(
            ScheduledPaymentService scheduledPaymentService) {

        this.scheduledPaymentService =
                scheduledPaymentService;
    }

    // =====================================================
    // AUTOMATIC SCHEDULED PAYMENT PROCESSING
    // =====================================================

    @Scheduled(cron = "0 20 0 * * *")
    public void processScheduledPayments() {

        System.out.println(
                "========================================"
        );

        System.out.println(
                "Starting automatic Scheduled Payment processing..."
        );

        try {

            scheduledPaymentService
                    .processDueScheduledPayments();

            System.out.println(
                    "Automatic Scheduled Payment processing completed."
            );

        } catch (Exception e) {

            System.out.println(
                    "Automatic Scheduled Payment processing failed."
            );

            System.out.println(
                    "Reason: " + e.getMessage()
            );
        }

        System.out.println(
                "========================================"
        );
    }
    
}