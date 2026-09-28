package com.avanibank.backend.controller;

import com.avanibank.backend.dto.LoanApplicationRequest;
import com.avanibank.backend.entity.Loan;
import com.avanibank.backend.service.LoanService;
import com.avanibank.backend.dto.EligibilityCalculatorRequest;
import com.avanibank.backend.dto.EligibilityCalculatorResponse;
import com.avanibank.backend.service.EligibilityService;
import com.avanibank.backend.dto.CreditScoreResponse;
import com.avanibank.backend.service.CreditScoreService;
import com.avanibank.backend.dto.EmiCalculatorRequest;
import com.avanibank.backend.dto.EmiCalculatorResponse;
import com.avanibank.backend.service.EmiCalculatorService;
import com.avanibank.backend.dto.LoanApprovalRequest;
import com.avanibank.backend.dto.LoanRejectionRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
@CrossOrigin(origins = "*")
public class LoanController {

    private final LoanService loanService;
    private final EligibilityService eligibilityService;
    private final CreditScoreService creditScoreService;
    private final EmiCalculatorService emiCalculatorService;

    public LoanController(
            LoanService loanService,
            EligibilityService eligibilityService,
            CreditScoreService creditScoreService,
            EmiCalculatorService emiCalculatorService){

        this.loanService =loanService;
        this.eligibilityService = eligibilityService;
        this.creditScoreService =creditScoreService;
        this.emiCalculatorService =emiCalculatorService;
    }

    // =====================================================
    // LOAN APPLICATION
    // =====================================================

    @PostMapping("/apply")
    public ResponseEntity<Loan> applyForLoan(
            @RequestBody LoanApplicationRequest request) {

        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        Loan loan =
                loanService.applyForLoan(
                        email,
                        request
                );

        return ResponseEntity.ok(loan);
    }

    // =====================================================
    // GET MY LOANS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Loan>> getMyLoans() {

        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        return ResponseEntity.ok(
                loanService.getMyLoans(email)
        );
    }

    // =====================================================
    // GET SINGLE LOAN
    // =====================================================

    @GetMapping("/{loanId}")
    public ResponseEntity<Loan> getLoan(
            @PathVariable Long loanId) {

        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        return ResponseEntity.ok(
                loanService.getLoan(
                        email,
                        loanId
                )
        );
    }

    // =====================================================
    // LOAN ELIGIBILITY CALCULATOR
    // =====================================================

    @PostMapping("/eligibility")
    public ResponseEntity<EligibilityCalculatorResponse>
    calculateEligibility(
        @RequestBody EligibilityCalculatorRequest request) {

    EligibilityCalculatorResponse response =
            eligibilityService.calculateEligibility(
                    request
            );

    return ResponseEntity.ok(response);
}

   // =====================================================
   // CREDIT SCORE CHECK
   // =====================================================

   @GetMapping("/credit-score")
   public ResponseEntity<CreditScoreResponse>
   checkCreditScore() {

    String email =
            SecurityContextHolder
                    .getContext()
                    .getAuthentication()
                    .getName();

    CreditScoreResponse response =
            creditScoreService.checkCreditScore(
                    email
            );

    return ResponseEntity.ok(response);
   }

    // =====================================================
    // EMI CALCULATOR
    // =====================================================

    @PostMapping("/emi")
    public ResponseEntity<EmiCalculatorResponse>
    calculateEmi(
        @RequestBody EmiCalculatorRequest request) {

    EmiCalculatorResponse response =
            emiCalculatorService.calculateEmi(
                    request
            );

    return ResponseEntity.ok(response);
   }

   @PutMapping("/{loanId}/submit-review")
    public ResponseEntity<Loan> submitForReview(
        @PathVariable Long loanId) {

    String email = SecurityContextHolder
            .getContext()
            .getAuthentication()
            .getName();

    return ResponseEntity.ok(
            loanService.submitForReview(email, loanId)
    );
    }

    @PutMapping("/{loanId}/approve")
    public ResponseEntity<Loan> approveLoan(
        @PathVariable Long loanId,
        @RequestBody LoanApprovalRequest request) {

    Loan loan = loanService.approveLoan(
            loanId,
            request.getApprovedAmount(),
            request.getInterestRate(),
            request.getApprovalReason()
    );

    return ResponseEntity.ok(loan);
    }

    @PutMapping("/{loanId}/reject")
    public ResponseEntity<Loan> rejectLoan(
        @PathVariable Long loanId,
        @RequestBody LoanRejectionRequest request) {

    Loan loan = loanService.rejectLoan(
            loanId,
            request.getRejectionReason()
    );

    return ResponseEntity.ok(loan);
    }

    @PostMapping("/{loanId}/disburse")
public ResponseEntity<Loan> disburseLoan(
        @PathVariable Long loanId) {

    String email = SecurityContextHolder
            .getContext()
            .getAuthentication()
            .getName();

    Loan loan = loanService.disburseLoan(
            email,
            loanId
    );

    return ResponseEntity.ok(loan);
    }
}