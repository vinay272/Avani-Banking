package com.avanibank.backend.service;

import com.avanibank.backend.dto.LoanApplicationRequest;
import com.avanibank.backend.entity.Account;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.Loan;
import com.avanibank.backend.repository.AccountRepository;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.LoanRepository;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.repository.TransactionRepository;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Service
public class LoanService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final LoanRepository loanRepository;
    private final TransactionRepository transactionRepository;

    public LoanService(
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            LoanRepository loanRepository,
            TransactionRepository transactionRepository) {

        this.customerRepository =
                customerRepository;

        this.accountRepository =
                accountRepository;

        this.loanRepository =
                loanRepository;
    
        this.transactionRepository = transactionRepository;        
    }

    // =====================================================
    // APPLY FOR LOAN
    // =====================================================

    @Transactional
    public Loan applyForLoan(
            String customerEmail,
            LoanApplicationRequest request) {

        validateApplication(request);

        // =================================================
        // FIND CUSTOMER
        // =================================================

        Customer customer =
                customerRepository
                        .findByEmail(customerEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer account not found"
                                ));

        // =================================================
        // FIND CUSTOMER ACCOUNT
        // =================================================

        Account account =
                accountRepository
                        .findByIdAndCustomerId(
                                request.getAccountId(),
                                customer.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Loan account not found"
                                ));

        // =================================================
        // ACCOUNT STATUS
        // =================================================

        if (!"ACTIVE".equalsIgnoreCase(
                account.getStatus())) {

            throw new RuntimeException(
                    "Loan account is not active"
            );
        }

        // =================================================
        // CREATE LOAN
        // =================================================

        Loan loan =
                new Loan();

        loan.setCustomer(customer);

        loan.setAccount(account);

        loan.setLoanType(
                request.getLoanType()
                        .trim()
                        .toUpperCase()
        );

        loan.setRequestedAmount(
                request.getRequestedAmount()
        );

        loan.setTenureMonths(
                request.getTenureMonths()
        );

        loan.setPurpose(
                request.getPurpose().trim()
        );

        loan.setMonthlyIncome(
                request.getMonthlyIncome()
        );

        loan.setEmploymentType(
                request.getEmploymentType()
                        .trim()
                        .toUpperCase()
        );

        loan.setStatus(
                "APPLIED"
        );

        return loanRepository.save(loan);
    }

    // =====================================================
    // GET MY LOANS
    // =====================================================

    public List<Loan> getMyLoans(
            String customerEmail) {

        Customer customer =
                customerRepository
                        .findByEmail(customerEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer account not found"
                                ));

        return loanRepository
                .findByCustomerIdOrderByCreatedAtDesc(
                        customer.getId()
                );
    }

    // =====================================================
    // GET SINGLE LOAN
    // =====================================================

    public Loan getLoan(
            String customerEmail,
            Long loanId) {

        Customer customer =
                customerRepository
                        .findByEmail(customerEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer account not found"
                                ));

        return loanRepository
                .findByIdAndCustomerId(
                        loanId,
                        customer.getId()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Loan not found"
                        ));
    }

    // =====================================================
    // VALIDATE APPLICATION
    // =====================================================

    private void validateApplication(
            LoanApplicationRequest request) {

        if (request == null) {

            throw new RuntimeException(
                    "Loan application cannot be empty"
            );
        }

        if (request.getAccountId() == null) {

            throw new RuntimeException(
                    "Account is required"
            );
        }

        if (request.getLoanType() == null
                || request.getLoanType()
                        .trim()
                        .isEmpty()) {

            throw new RuntimeException(
                    "Loan type is required"
            );
        }

        String loanType =
                request.getLoanType()
                        .trim()
                        .toUpperCase();

        if (!loanType.equals("PERSONAL")
                && !loanType.equals("HOME")
                && !loanType.equals("CAR")
                && !loanType.equals("EDUCATION")
                && !loanType.equals("BUSINESS")
                && !loanType.equals("GOLD")) {

            throw new RuntimeException(
                    "Invalid loan type"
            );
        }

        if (request.getRequestedAmount() == null
                || request.getRequestedAmount() <= 0) {

            throw new RuntimeException(
                    "Loan amount must be greater than 0"
            );
        }

        if (request.getTenureMonths() == null
                || request.getTenureMonths() <= 0) {

            throw new RuntimeException(
                    "Loan tenure must be greater than 0"
            );
        }

        if (request.getPurpose() == null
                || request.getPurpose()
                        .trim()
                        .isEmpty()) {

            throw new RuntimeException(
                    "Loan purpose is required"
            );
        }

        if (request.getMonthlyIncome() == null
                || request.getMonthlyIncome() <= 0) {

            throw new RuntimeException(
                    "Monthly income must be greater than 0"
            );
        }

        if (request.getEmploymentType() == null
                || request.getEmploymentType()
                        .trim()
                        .isEmpty()) {

            throw new RuntimeException(
                    "Employment type is required"
            );
        }
    }

    public Loan submitForReview(String customerEmail, Long loanId) {

    Customer customer = customerRepository.findByEmail(customerEmail)
            .orElseThrow(() -> new RuntimeException("Customer account not found"));

    Loan loan = loanRepository.findByIdAndCustomerId(loanId, customer.getId())
            .orElseThrow(() -> new RuntimeException("Loan application not found"));

    if (!"APPLIED".equalsIgnoreCase(loan.getStatus())) {
        throw new RuntimeException(
                "Only APPLIED loan applications can be moved to UNDER_REVIEW"
        );
    }

    loan.setStatus("UNDER_REVIEW");

    return loanRepository.save(loan);
    }

    // Approvel loan
    public Loan approveLoan(
        Long loanId,
        Double approvedAmount,
        Double interestRate,
        String approvalReason) {

    Loan loan = loanRepository.findById(loanId)
            .orElseThrow(() -> new RuntimeException("Loan application not found"));

    if (!"UNDER_REVIEW".equalsIgnoreCase(loan.getStatus())) {
        throw new RuntimeException(
                "Only UNDER_REVIEW loans can be approved"
        );
    }

    if (approvedAmount == null || approvedAmount <= 0) {
        throw new RuntimeException(
                "Approved amount must be greater than 0"
        );
    }

    if (loan.getRequestedAmount() != null
            && approvedAmount > loan.getRequestedAmount()) {
        throw new RuntimeException(
                "Approved amount cannot exceed requested amount"
        );
    }

    if (interestRate == null || interestRate <= 0) {
        throw new RuntimeException(
                "Interest rate must be greater than 0"
        );
    }

    loan.setApprovedAmount(approvedAmount);
    loan.setInterestRate(interestRate);

    double monthlyRate = interestRate / 12.0 / 100.0;
    int tenure = loan.getTenureMonths();

    double emi;

    if (monthlyRate == 0) {
        emi = approvedAmount / tenure;
    } else {
        emi = approvedAmount
                * monthlyRate
                * Math.pow(1 + monthlyRate, tenure)
                / (Math.pow(1 + monthlyRate, tenure) - 1);
    }

    loan.setEmiAmount(
            Math.round(emi * 100.0) / 100.0
    );

    loan.setApprovalReason(
            approvalReason == null || approvalReason.trim().isEmpty()
                    ? "Loan approved"
                    : approvalReason.trim()
    );

    loan.setRejectionReason(null);
    loan.setApprovedAt(LocalDateTime.now());
    loan.setEligibilityStatus("ELIGIBLE");
    loan.setStatus("APPROVED");

    return loanRepository.save(loan);
    }

    // Reject Loan
    public Loan rejectLoan(Long loanId, String rejectionReason) {

    Loan loan = loanRepository.findById(loanId)
            .orElseThrow(() -> new RuntimeException("Loan application not found"));

    if (!"UNDER_REVIEW".equalsIgnoreCase(loan.getStatus())) {
        throw new RuntimeException(
                "Only UNDER_REVIEW loans can be rejected"
        );
    }

    if (rejectionReason == null || rejectionReason.trim().isEmpty()) {
        throw new RuntimeException(
                "Rejection reason is required"
        );
    }

    loan.setStatus("REJECTED");
    loan.setRejectionReason(rejectionReason.trim());
    loan.setApprovalReason(null);
    loan.setApprovedAmount(null);
    loan.setInterestRate(null);
    loan.setEmiAmount(null);

    return loanRepository.save(loan);
    }

    @Transactional
public Loan disburseLoan(String customerEmail, Long loanId) {

    Customer customer = customerRepository.findByEmail(customerEmail)
            .orElseThrow(() -> new RuntimeException(
                    "Customer account not found"
            ));

    Loan loan = loanRepository.findByIdAndCustomerId(
                    loanId,
                    customer.getId()
            )
            .orElseThrow(() -> new RuntimeException(
                    "Loan application not found"
            ));

    // Loan must be approved before disbursement
    if (!"APPROVED".equalsIgnoreCase(loan.getStatus())) {
        throw new RuntimeException(
                "Only APPROVED loans can be disbursed"
        );
    }

    // Prevent duplicate disbursement
    if (loan.getDisbursedAmount() != null
            || loan.getDisbursementDate() != null) {

        throw new RuntimeException(
                "Loan has already been disbursed"
        );
    }

    if (loan.getApprovedAmount() == null
            || loan.getApprovedAmount() <= 0) {

        throw new RuntimeException(
                "Approved loan amount is invalid"
        );
    }

    Account account = loan.getAccount();

    if (account == null) {
        throw new RuntimeException(
                "Loan linked account not found"
        );
    }

    if (!"ACTIVE".equalsIgnoreCase(account.getStatus())) {
        throw new RuntimeException(
                "Loan linked account is not active"
        );
    }

    Double disbursementAmount = loan.getApprovedAmount();

    /*
     * Credit approved loan amount
     * directly into customer's linked account.
     */
    Double currentBalance = account.getBalance() == null
            ? 0.0
            : account.getBalance();

    account.setBalance(
            currentBalance + disbursementAmount
    );

    accountRepository.save(account);

    // Keep legacy Customer balance synchronized
    customer.setBalance(account.getBalance());
    customerRepository.save(customer);

    // Update loan disbursement details
    loan.setDisbursedAmount(disbursementAmount);
    loan.setDisbursementDate(LocalDate.now());
    loan.setStatus("ACTIVE");

    Loan savedLoan = loanRepository.save(loan);

    // Create transaction record for loan disbursement
    Transaction transaction = new Transaction();

    transaction.setSenderAccountNumber("AVANI_BANK");
    transaction.setReceiverAccountNumber(
            account.getAccountNumber()
    );
    transaction.setAmount(disbursementAmount);
    transaction.setTransactionType("LOAN_DISBURSEMENT");
    transaction.setStatus("SUCCESS");

    transactionRepository.save(transaction);

    return savedLoan;
}
}