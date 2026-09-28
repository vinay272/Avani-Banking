package com.avanibank.backend.controller;

import com.avanibank.backend.service.LoanEMIReminderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/loan-emi")
@CrossOrigin(origins = "*")
public class LoanEMIReminderController {

    private final LoanEMIReminderService loanEMIReminderService;

    public LoanEMIReminderController(
            LoanEMIReminderService loanEMIReminderService) {

        this.loanEMIReminderService = loanEMIReminderService;
    }

    @PostMapping("/send-reminders")
    public ResponseEntity<Map<String, Object>> sendReminders() {

        int count =
                loanEMIReminderService.sendDueDateReminders();

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Loan EMI reminder process executed successfully",
                        "notificationsSent",
                        count
                )
        );
    }
}