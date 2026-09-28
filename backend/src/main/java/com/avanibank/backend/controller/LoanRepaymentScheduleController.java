package com.avanibank.backend.controller;

import com.avanibank.backend.entity.LoanRepaymentSchedule;
import com.avanibank.backend.service.LoanRepaymentScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
@CrossOrigin(origins = "*")
public class LoanRepaymentScheduleController {

    private final LoanRepaymentScheduleService scheduleService;

    public LoanRepaymentScheduleController(
            LoanRepaymentScheduleService scheduleService) {

        this.scheduleService = scheduleService;
    }

    @PostMapping("/{loanId}/repayment-schedule")
    public ResponseEntity<List<LoanRepaymentSchedule>>
    generateRepaymentSchedule(
            @PathVariable Long loanId) {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        List<LoanRepaymentSchedule> schedule =
                scheduleService.generateSchedule(
                        email,
                        loanId
                );

        return ResponseEntity.ok(schedule);
    }

    @GetMapping("/{loanId}/repayment-schedule")
    public ResponseEntity<List<LoanRepaymentSchedule>>
    getRepaymentSchedule(
            @PathVariable Long loanId) {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        List<LoanRepaymentSchedule> schedule =
                scheduleService.getSchedule(
                        email,
                        loanId
                );

        return ResponseEntity.ok(schedule);
    }
}
