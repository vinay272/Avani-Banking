package com.avanibank.backend.service;

import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.Loan;
import com.avanibank.backend.entity.LoanRepaymentSchedule;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.LoanRepaymentScheduleRepository;
import com.avanibank.backend.repository.LoanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class LoanNpaService {

    private final LoanRepository loanRepository;
    private final CustomerRepository customerRepository;
    private final LoanRepaymentScheduleRepository scheduleRepository;

    public LoanNpaService(
            LoanRepository loanRepository,
            CustomerRepository customerRepository,
            LoanRepaymentScheduleRepository scheduleRepository
    ) {
        this.loanRepository = loanRepository;
        this.customerRepository = customerRepository;
        this.scheduleRepository = scheduleRepository;
    }

    /**
     * Checks one loan and marks it NPA if any pending installment
     * is overdue by 90 or more days.
     */
    @Transactional
    public Loan checkLoanForNpa(String customerEmail, Long loanId) {

        Customer customer = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() ->
                        new RuntimeException("Customer account not found"));

        Loan loan = loanRepository.findByIdAndCustomerId(
                        loanId,
                        customer.getId()
                )
                .orElseThrow(() ->
                        new RuntimeException("Loan application not found"));

        return evaluateLoanForNpa(loan);
    }

    /**
     * Checks all ACTIVE loans in the system.
     * This method is used by the daily scheduler.
     */
    @Transactional
    public int monitorAllActiveLoans() {

        List<Loan> activeLoans = loanRepository.findByStatus("ACTIVE");

        int npaCount = 0;

        for (Loan loan : activeLoans) {

            Loan evaluatedLoan = evaluateLoanForNpa(loan);

            if ("NPA".equalsIgnoreCase(evaluatedLoan.getStatus())) {
                npaCount++;
            }
        }

        return npaCount;
    }

    /**
     * Returns customer's NPA loans.
     */
    public List<Loan> getMyNpaLoans(String customerEmail) {

        Customer customer = customerRepository.findByEmail(customerEmail)
                .orElseThrow(() ->
                        new RuntimeException("Customer account not found"));

        List<Loan> allLoans = loanRepository
                .findByCustomerIdOrderByCreatedAtDesc(customer.getId());

        List<Loan> npaLoans = new ArrayList<>();

        for (Loan loan : allLoans) {
            if ("NPA".equalsIgnoreCase(loan.getStatus())) {
                npaLoans.add(loan);
            }
        }

        return npaLoans;
    }

    /**
     * Actual NPA evaluation logic.
     */
    private Loan evaluateLoanForNpa(Loan loan) {

        if (!"ACTIVE".equalsIgnoreCase(loan.getStatus())) {
            return loan;
        }

        List<LoanRepaymentSchedule> pendingInstallments =
                scheduleRepository
                        .findByLoanIdAndStatusOrderByInstallmentNumberAsc(
                                loan.getId(),
                                "PENDING"
                        );

        if (pendingInstallments.isEmpty()) {
            return loan;
        }

        LocalDate today = LocalDate.now();

        LoanRepaymentSchedule oldestOverdueInstallment = null;
        long maximumOverdueDays = 0;

        for (LoanRepaymentSchedule installment : pendingInstallments) {

            if (installment.getDueDate() == null) {
                continue;
            }

            if (installment.getDueDate().isBefore(today)) {

                long overdueDays = ChronoUnit.DAYS.between(
                        installment.getDueDate(),
                        today
                );

                if (overdueDays > maximumOverdueDays) {
                    maximumOverdueDays = overdueDays;
                    oldestOverdueInstallment = installment;
                }
            }
        }

        /*
         * NPA threshold = 90 days overdue.
         */
        if (oldestOverdueInstallment != null
                && maximumOverdueDays >= 90) {

            loan.setStatus("NPA");
            loan.setNpaDate(today);
            loan.setOverdueDays((int) maximumOverdueDays);

            loan.setNpaReason(
                    "Repayment installment overdue for "
                            + maximumOverdueDays
                            + " days"
            );

            return loanRepository.save(loan);
        }

        return loan;
    }
}