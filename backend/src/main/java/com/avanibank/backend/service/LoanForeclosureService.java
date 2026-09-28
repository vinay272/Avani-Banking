package com.avanibank.backend.service;

import com.avanibank.backend.entity.Account;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.Loan;
import com.avanibank.backend.entity.LoanRepaymentSchedule;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.repository.AccountRepository;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.LoanRepaymentScheduleRepository;
import com.avanibank.backend.repository.LoanRepository;
import com.avanibank.backend.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class LoanForeclosureService {

    private final LoanRepository loanRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final LoanRepaymentScheduleRepository scheduleRepository;
    private final TransactionRepository transactionRepository;

    public LoanForeclosureService(
            LoanRepository loanRepository,
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            LoanRepaymentScheduleRepository scheduleRepository,
            TransactionRepository transactionRepository) {

        this.loanRepository = loanRepository;
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.scheduleRepository = scheduleRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public Loan forecloseLoan(
            String customerEmail,
            Long loanId,
            String foreclosureReason) {

        Customer customer = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new RuntimeException(
                        "Customer account not found"
                ));

        Loan loan = loanRepository.findByIdAndCustomerId(
                        loanId,
                        customer.getId()
                )
                .orElseThrow(() -> new RuntimeException(
                        "Loan not found"
                ));

        // Only active loans can be foreclosed
        if (!"ACTIVE".equalsIgnoreCase(loan.getStatus())) {
            throw new RuntimeException(
                    "Only ACTIVE loans can be foreclosed"
            );
        }

        if (loan.getAccount() == null) {
            throw new RuntimeException(
                    "Loan linked account not found"
            );
        }

        Account account = loan.getAccount();

        if (!"ACTIVE".equalsIgnoreCase(account.getStatus())) {
            throw new RuntimeException(
                    "Linked account is not active"
            );
        }

        /*
         * Get all unpaid installments.
         */
        List<LoanRepaymentSchedule> pendingInstallments =
        scheduleRepository.findByLoanIdAndStatusOrderByInstallmentNumberAsc(
                loanId, "PENDING"
        );

double outstandingPrincipal = 0.0;

if (!pendingInstallments.isEmpty()) {

    // First pending installment ka remaining balance
    // us installment ke principal ke baad ka balance hota hai.
    // Isliye current outstanding principal nikalne ke liye
    // principal amount ko wapas add karna hoga.
    LoanRepaymentSchedule firstPending = pendingInstallments.get(0);

    Double remainingBalance = firstPending.getRemainingBalance();
    Double principalAmount = firstPending.getPrincipalAmount();

    remainingBalance = remainingBalance == null ? 0.0 : remainingBalance;
    principalAmount = principalAmount == null ? 0.0 : principalAmount;

    outstandingPrincipal = remainingBalance + principalAmount;

} else if (loan.getApprovedAmount() != null) {

    outstandingPrincipal = loan.getApprovedAmount();
}

        outstandingPrincipal = round(outstandingPrincipal);

        if (outstandingPrincipal <= 0) {
            throw new RuntimeException(
                    "No outstanding loan balance remains"
            );
        }

        /*
         * Check customer's available balance.
         */
        double accountBalance =
                account.getBalance() == null
                        ? 0.0
                        : account.getBalance();

        if (accountBalance < outstandingPrincipal) {
            throw new RuntimeException(
                    "Insufficient account balance for loan foreclosure"
            );
        }

        /*
         * Debit foreclosure amount.
         */
        account.setBalance(
                round(accountBalance - outstandingPrincipal)
        );

        accountRepository.save(account);

        /*
         * Keep legacy customer balance synchronized.
         */
        customer.setBalance(account.getBalance());

        customerRepository.save(customer);

        /*
         * Mark remaining EMI installments as cancelled.
         */
        for (LoanRepaymentSchedule installment :
                pendingInstallments) {

            installment.setStatus("CANCELLED");
        }

        if (!pendingInstallments.isEmpty()) {
            scheduleRepository.saveAll(
                    pendingInstallments
            );
        }

        /*
         * Update loan.
         */
        loan.setForeclosureAmount(
                outstandingPrincipal
        );

        loan.setForeclosureDate(
                LocalDate.now()
        );

        loan.setForeclosureReason(
                foreclosureReason == null
                        || foreclosureReason.trim().isEmpty()
                        ? "Loan foreclosed by customer"
                        : foreclosureReason.trim()
        );

        loan.setStatus("FORECLOSED");

        Loan savedLoan = loanRepository.save(loan);

        /*
         * Create transaction history record.
         */
        Transaction transaction = new Transaction();

        transaction.setSenderAccountNumber(
                account.getAccountNumber()
        );

        transaction.setReceiverAccountNumber(
                "AVANI_BANK_LOAN_" + loan.getId()
        );

        transaction.setAmount(
                outstandingPrincipal
        );

        transaction.setTransactionType(
                "LOAN_FORECLOSURE"
        );

        transaction.setStatus(
                "SUCCESS"
        );

        transactionRepository.save(transaction);

        return savedLoan;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
