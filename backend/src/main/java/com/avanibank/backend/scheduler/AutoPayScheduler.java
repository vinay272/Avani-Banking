package com.avanibank.backend.scheduler;

import com.avanibank.backend.service.AutoPayService;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AutoPayScheduler {

    private final AutoPayService autoPayService;

    public AutoPayScheduler(
            AutoPayService autoPayService) {

        this.autoPayService =
                autoPayService;
    }

    // =====================================================
    // AUTOMATIC AUTO-PAY PROCESSING
    // =====================================================
    //
    // Runs every day at 00:10 AM
    // and processes all due Auto-Pays.
    //

    @Scheduled(cron = "0 * * * * *")
    public void processAutomaticAutoPays() {

        System.out.println(
                "=========================================="
        );

        System.out.println(
                "Starting automatic Auto-Pay processing..."
        );

        try {

            autoPayService.processDueAutoPays();

            System.out.println(
                    "Automatic Auto-Pay processing completed."
            );

        } catch (Exception e) {

            System.out.println(
                    "Automatic Auto-Pay processing failed: "
                            + e.getMessage()
            );
        }

        System.out.println(
                "=========================================="
        );
    }
}