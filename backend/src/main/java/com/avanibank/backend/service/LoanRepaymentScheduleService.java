package com.avanibank.backend.service;

import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.Loan;
import com.avanibank.backend.entity.LoanRepaymentSchedule;
import com.avanibank.backend.repository.LoanRepaymentScheduleRepository;
import com.avanibank.backend.repository.LoanRepository;
import com.avanibank.backend.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class LoanRepaymentScheduleService {

    private final LoanRepository loanRepository;
    private final CustomerRepository customerRepository;
    private final LoanRepaymentScheduleRepository scheduleRepository;

    public LoanRepaymentScheduleService(
            LoanRepository loanRepository,
            CustomerRepository customerRepository,
            LoanRepaymentScheduleRepository scheduleRepository) {

        this.loanRepository = loanRepository;
        this.customerRepository = customerRepository;
        this.scheduleRepository = scheduleRepository;
    }

    @Transactional
    public List<LoanRepaymentSchedule> generateSchedule(
            String customerEmail,
            Long loanId) {

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

        // Schedule can only be generated for an active loan
        if (!"ACTIVE".equalsIgnoreCase(loan.getStatus())) {
            throw new RuntimeException(
                    "Repayment schedule can only be generated for an ACTIVE loan"
            );
        }

        if (loan.getApprovedAmount() == null
                || loan.getApprovedAmount() <= 0) {

            throw new RuntimeException(
                    "Approved loan amount is invalid"
            );
        }

        if (loan.getInterestRate() == null
                || loan.getInterestRate() < 0) {

            throw new RuntimeException(
                    "Loan interest rate is invalid"
            );
        }

        if (loan.getTenureMonths() == null
                || loan.getTenureMonths() <= 0) {

            throw new RuntimeException(
                    "Loan tenure is invalid"
            );
        }

        if (loan.getDisbursementDate() == null) {
            throw new RuntimeException(
                    "Loan disbursement date is not available"
            );
        }

        // Prevent duplicate schedule generation
        if (scheduleRepository.existsByLoanId(loanId)) {
            return scheduleRepository
                    .findByLoanIdOrderByInstallmentNumberAsc(loanId);
        }

        double principal = loan.getApprovedAmount();
        double annualRate = loan.getInterestRate();
        int tenure = loan.getTenureMonths();

        double monthlyRate = annualRate / 12.0 / 100.0;

        double emi;

        if (monthlyRate == 0) {
            emi = principal / tenure;
        } else {
            emi = principal
                    * monthlyRate
                    * Math.pow(1 + monthlyRate, tenure)
                    / (Math.pow(1 + monthlyRate, tenure) - 1);
        }

        emi = round(emi);

        double remainingBalance = principal;

        List<LoanRepaymentSchedule> scheduleList =
                new ArrayList<>();

        for (int i = 1; i <= tenure; i++) {

            double interestAmount =
                    remainingBalance * monthlyRate;

            interestAmount = round(interestAmount);

            double principalAmount =
                    emi - interestAmount;

            principalAmount = round(principalAmount);

            /*
             * Final installment adjustment.
             * This prevents a small rounding balance from
             * remaining after the last EMI.
             */
            if (i == tenure) {
                principalAmount = round(remainingBalance);
                emi = round(
                        principalAmount + interestAmount
                );
            }

            if (principalAmount > remainingBalance) {
                principalAmount = round(remainingBalance);

                emi = round(
                        principalAmount + interestAmount
                );
            }

            remainingBalance =
                    round(
                            remainingBalance - principalAmount
                    );

            if (remainingBalance < 0.01) {
                remainingBalance = 0.0;
            }

            LoanRepaymentSchedule installment =
                    new LoanRepaymentSchedule();

            installment.setLoan(loan);
            installment.setInstallmentNumber(i);

            installment.setDueDate(
                    loan.getDisbursementDate()
                            .plusMonths(i)
            );

            installment.setPrincipalAmount(
                    principalAmount
            );

            installment.setInterestAmount(
                    interestAmount
            );

            installment.setEmiAmount(emi);

            installment.setRemainingBalance(
                    remainingBalance
            );

            installment.setStatus("PENDING");

            scheduleList.add(installment);
        }

        return scheduleRepository.saveAll(scheduleList);
    }

    public List<LoanRepaymentSchedule> getSchedule(
            String customerEmail,
            Long loanId) {

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

        return scheduleRepository
                .findByLoanIdOrderByInstallmentNumberAsc(
                        loan.getId()
                );
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}