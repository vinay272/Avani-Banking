package com.avanibank.backend.service;

import com.avanibank.backend.entity.Account;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.RecurringDeposit;
import com.avanibank.backend.repository.AccountRepository;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.RecurringDepositRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RecurringDepositService {

    private final RecurringDepositRepository recurringDepositRepository;
    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;

    public RecurringDepositService(
            RecurringDepositRepository recurringDepositRepository,
            CustomerRepository customerRepository,
            AccountRepository accountRepository) {

        this.recurringDepositRepository = recurringDepositRepository;
        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
    }

    // =========================
    // CREATE RECURRING DEPOSIT
    // =========================

    @Transactional
    public RecurringDeposit createRecurringDeposit(
            String email,
            Long accountId,
            Double monthlyInstallment,
            Double interestRate,
            Integer tenureMonths) {

        Customer customer = getCustomerByEmail(email);

        // Validate installment
        if (monthlyInstallment == null
                || monthlyInstallment <= 0) {

            throw new RuntimeException(
                    "Monthly installment must be greater than zero"
            );
        }

        // Validate interest rate
        if (interestRate == null || interestRate < 0) {

            throw new RuntimeException(
                    "Invalid interest rate"
            );
        }

        // Validate tenure
        if (tenureMonths == null || tenureMonths <= 0) {

            throw new RuntimeException(
                    "RD tenure must be greater than zero"
            );
        }

        // Get customer's account
        Account account =
                accountRepository.findByIdAndCustomerId(
                        accountId,
                        customer.getId()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Account not found"
                        )
                );

        // Account must be active
        if (!"ACTIVE".equalsIgnoreCase(
                account.getStatus())) {

            throw new RuntimeException(
                    "Account is not active"
            );
        }

        // First installment must be available
        if (account.getBalance() < monthlyInstallment) {

            throw new RuntimeException(
                    "Insufficient account balance for first installment"
            );
        }

        LocalDateTime createdAt =
                LocalDateTime.now();

        LocalDateTime maturityDate =
                createdAt.plusMonths(tenureMonths);

        LocalDateTime nextInstallmentDate =
                createdAt.plusMonths(1);

        // Calculate total principal
        double totalPrincipal =
                monthlyInstallment * tenureMonths;

        // Approximate simple interest
        double interest =
                totalPrincipal
                        * (interestRate / 100.0)
                        * (tenureMonths / 12.0);

        double maturityAmount =
                totalPrincipal + interest;

        // Deduct first installment immediately
        account.setBalance(
                account.getBalance()
                        - monthlyInstallment
        );

        accountRepository.save(account);

        // Create RD
        RecurringDeposit rd =
                new RecurringDeposit();

        rd.setCustomer(customer);
        rd.setAccount(account);
        rd.setMonthlyInstallment(monthlyInstallment);
        rd.setInterestRate(interestRate);
        rd.setTenureMonths(tenureMonths);

        // First installment already paid
        rd.setInstallmentsPaid(1);

        rd.setTotalDeposited(
                monthlyInstallment
        );

        rd.setMaturityAmount(
                maturityAmount
        );

        rd.setCreatedAt(createdAt);
        rd.setMaturityDate(maturityDate);
        rd.setNextInstallmentDate(
                nextInstallmentDate
        );

        rd.setStatus("ACTIVE");

        return recurringDepositRepository.save(rd);
    }

    // =========================
    // GET MY RDS
    // =========================

    public List<RecurringDeposit> getMyRecurringDeposits(
            String email) {

        Customer customer =
                getCustomerByEmail(email);

        return recurringDepositRepository
                .findByCustomerIdOrderByCreatedAtDesc(
                        customer.getId()
                );
    }

    // =========================
    // GET ACTIVE RDS
    // =========================

    public List<RecurringDeposit> getActiveRecurringDeposits(
            String email) {

        Customer customer =
                getCustomerByEmail(email);

        return recurringDepositRepository
                .findByCustomerIdAndStatusOrderByCreatedAtDesc(
                        customer.getId(),
                        "ACTIVE"
                );
    }

    // =========================
    // GET RD BY ID
    // =========================

    public RecurringDeposit getRecurringDepositById(
            Long rdId,
            String email) {

        Customer customer =
                getCustomerByEmail(email);

        return recurringDepositRepository
                .findByIdAndCustomerId(
                        rdId,
                        customer.getId()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Recurring Deposit not found"
                        )
                );
    }

    // =========================
    // PROCESS MONTHLY INSTALLMENT
    // =========================

    @Transactional
    public RecurringDeposit processInstallment(
            Long rdId) {

        RecurringDeposit rd =
                recurringDepositRepository.findById(rdId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Recurring Deposit not found"
                        )
                );

        // Only active RD can receive installments
        if (!"ACTIVE".equalsIgnoreCase(
                rd.getStatus())) {

            return rd;
        }

        // Check if tenure is already completed
        if (rd.getInstallmentsPaid()
                >= rd.getTenureMonths()) {

            rd.setStatus("MATURED");

            return recurringDepositRepository.save(rd);
        }

        Account account =
        accountRepository.findById(
                rd.getAccount().getId()
        ).orElseThrow(() ->
                new RuntimeException("Source account not found")
        );

        // Account must remain active
        if (!"ACTIVE".equalsIgnoreCase(
                account.getStatus())) {

            throw new RuntimeException(
                    "Source account is not active"
            );
        }

        Double installment =
                rd.getMonthlyInstallment();

        // Check balance
        if (account.getBalance() < installment) {

            throw new RuntimeException(
                    "Insufficient balance for RD installment"
            );
        }

        // Deduct installment
        account.setBalance(
                account.getBalance()
                        - installment
        );

        accountRepository.save(account);

        // Update RD
        rd.setInstallmentsPaid(
                rd.getInstallmentsPaid() + 1
        );

        rd.setTotalDeposited(
                rd.getTotalDeposited()
                        + installment
        );

        // Calculate next installment date
        rd.setNextInstallmentDate(
                rd.getNextInstallmentDate()
                        .plusMonths(1)
        );

        // Maturity check
        if (rd.getInstallmentsPaid()
                >= rd.getTenureMonths()) {

            rd.setStatus("MATURED");

            rd.setNextInstallmentDate(
                    rd.getMaturityDate()
            );
        }

        return recurringDepositRepository.save(rd);
    }

    // =========================
    // PROCESS ALL DUE INSTALLMENTS
    // =========================

    @Transactional
    public void processDueInstallments() {

        LocalDateTime now =
                LocalDateTime.now();

        List<RecurringDeposit> dueRds =
                recurringDepositRepository
                        .findByStatusAndNextInstallmentDateLessThanEqual(
                                "ACTIVE",
                                now
                        );

        for (RecurringDeposit rd : dueRds) {

            try {

                processInstallment(
                        rd.getId()
                );

            } catch (RuntimeException e) {

                // One failed RD should not stop
                // processing of other RDs.
                System.out.println(
                        "RD installment failed for RD ID "
                                + rd.getId()
                                + ": "
                                + e.getMessage()
                );
            }
        }
    }


// =========================
// AUTOMATIC RD PROCESSOR
// =========================

@Scheduled(fixedRate = 60000)
public void autoProcessDueInstallments() {
     System.out.println("========== RD SCHEDULER RUNNING ==========");
    processDueInstallments();
    System.out.println("========== RD SCHEDULER FINISHED ==========");
}

    // =========================
    // CLOSE RD
    // =========================

    @Transactional
    public RecurringDeposit closeRecurringDeposit(
            Long rdId,
            String email) {

        Customer customer =
                getCustomerByEmail(email);

        RecurringDeposit rd =
                recurringDepositRepository
                        .findByIdAndCustomerId(
                                rdId,
                                customer.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Recurring Deposit not found"
                                )
                        );

        if ("CLOSED".equalsIgnoreCase(
                rd.getStatus())) {

            throw new RuntimeException(
                    "Recurring Deposit is already closed"
            );
        }

        if ("MATURED".equalsIgnoreCase(
                rd.getStatus())) {

            throw new RuntimeException(
                    "Matured RD cannot be closed through this operation"
            );
        }

        rd.setStatus("CLOSED");

        return recurringDepositRepository.save(rd);
    }

    // =========================
    // CUSTOMER
    // =========================

    private Customer getCustomerByEmail(
            String email) {

        return customerRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found"
                        )
                );
    }
}