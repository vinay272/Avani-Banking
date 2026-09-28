package com.avanibank.backend.controller;

import com.avanibank.backend.entity.Loan;
import com.avanibank.backend.service.LoanNpaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
@CrossOrigin(origins = "*")
public class LoanNpaController {

    private final LoanNpaService loanNpaService;

    public LoanNpaController(LoanNpaService loanNpaService) {
        this.loanNpaService = loanNpaService;
    }

    /**
     * Manually check a particular loan for NPA.
     */
    @PostMapping("/{loanId}/npa-check")
    public ResponseEntity<Loan> checkLoanForNpa(
            @PathVariable Long loanId
    ) {

        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        Loan loan = loanNpaService.checkLoanForNpa(
                email,
                loanId
        );

        return ResponseEntity.ok(loan);
    }

    /**
     * Get customer's NPA loans.
     */
    @GetMapping("/npa")
    public ResponseEntity<List<Loan>> getMyNpaLoans() {

        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        return ResponseEntity.ok(
                loanNpaService.getMyNpaLoans(email)
        );
    }
}