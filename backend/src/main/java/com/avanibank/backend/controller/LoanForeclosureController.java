package com.avanibank.backend.controller;

import com.avanibank.backend.dto.LoanForeclosureRequest;
import com.avanibank.backend.entity.Loan;
import com.avanibank.backend.service.LoanForeclosureService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/loans")
@CrossOrigin(origins = "*")
public class LoanForeclosureController {

    private final LoanForeclosureService foreclosureService;

    public LoanForeclosureController(
            LoanForeclosureService foreclosureService) {

        this.foreclosureService = foreclosureService;
    }

    @PostMapping("/{loanId}/foreclose")
    public ResponseEntity<Loan> forecloseLoan(
            @PathVariable Long loanId,
            @RequestBody(required = false)
            LoanForeclosureRequest request) {

        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        String reason = request == null
                ? null
                : request.getForeclosureReason();

        Loan loan = foreclosureService.forecloseLoan(
                email,
                loanId,
                reason
        );

        return ResponseEntity.ok(loan);
    }
}