package com.avanibank.backend.service;

import com.avanibank.backend.dto.AutoPayRequest;
import com.avanibank.backend.entity.Account;
import com.avanibank.backend.entity.AutoPay;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.repository.AccountRepository;
import com.avanibank.backend.repository.AutoPayRepository;
import com.avanibank.backend.repository.CustomerRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class AutoPayService {

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final AutoPayRepository autoPayRepository;
    private final TransactionService transactionService;

    public AutoPayService(
            CustomerRepository customerRepository,
            AccountRepository accountRepository,
            AutoPayRepository autoPayRepository,
            TransactionService transactionService) {

        this.customerRepository = customerRepository;
        this.accountRepository = accountRepository;
        this.autoPayRepository = autoPayRepository;
        this.transactionService = transactionService;
    }

    // =====================================================
    // CREATE AUTO-PAY
    // =====================================================

    @Transactional
    public AutoPay createAutoPay(
            String customerEmail,
            AutoPayRequest request) {

        validateRequest(request);

        // =================================================
        // FIND CUSTOMER USING JWT EMAIL
        // =================================================

        Customer customer =
                customerRepository
                        .findByEmail(customerEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer account not found"
                                ));

        // =================================================
        // FIND CUSTOMER'S ACCOUNT
        // =================================================

        Account account =
                accountRepository
                        .findByIdAndCustomerId(
                                request.getAccountId(),
                                customer.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Account not found or does not belong to this customer"
                                ));

        // =================================================
        // ACCOUNT STATUS
        // =================================================

        if (!"ACTIVE".equalsIgnoreCase(
                account.getStatus())) {

            throw new RuntimeException(
                    "Selected account is not active"
            );
        }

        // =================================================
        // CHECK DUPLICATE AUTO-PAY
        // =================================================

        if (autoPayRepository
                .existsByCustomerIdAndBillerReference(
                        customer.getId(),
                        request.getBillerReference()
                )) {

            throw new RuntimeException(
                    "Auto-Pay already exists for this biller reference"
            );
        }

        // =================================================
        // CREATE AUTO-PAY
        // =================================================

        AutoPay autoPay = new AutoPay();

        autoPay.setCustomer(customer);
        autoPay.setAccount(account);

        autoPay.setBillerName(
                request.getBillerName().trim()
        );

        autoPay.setBillerReference(
                request.getBillerReference().trim()
        );

        autoPay.setAmount(
                request.getAmount()
        );

        autoPay.setFrequency(
                request.getFrequency()
                        .trim()
                        .toUpperCase()
        );

        autoPay.setStartDate(
                request.getStartDate()
        );

        // First execution date
        autoPay.setNextDueDate(
                request.getStartDate()
        );

        autoPay.setStatus("ACTIVE");

        return autoPayRepository.save(autoPay);
    }

    // =====================================================
    // GET CUSTOMER AUTO-PAYS
    // =====================================================

    public List<AutoPay> getCustomerAutoPays(
            String customerEmail) {

        Customer customer =
                customerRepository
                        .findByEmail(customerEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer account not found"
                                ));

        return autoPayRepository
                .findByCustomerIdOrderByCreatedAtDesc(
                        customer.getId()
                );
    }

    // =====================================================
    // GET CUSTOMER ACTIVE AUTO-PAYS
    // =====================================================

    public List<AutoPay> getActiveAutoPays(
            String customerEmail) {

        Customer customer =
                customerRepository
                        .findByEmail(customerEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer account not found"
                                ));

        return autoPayRepository
                .findByCustomerIdAndStatusOrderByCreatedAtDesc(
                        customer.getId(),
                        "ACTIVE"
                );
    }

    // =====================================================
    // GET SINGLE AUTO-PAY
    // =====================================================

    public AutoPay getAutoPay(
            String customerEmail,
            Long autoPayId) {

        Customer customer =
                customerRepository
                        .findByEmail(customerEmail)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer account not found"
                                ));

        return autoPayRepository
                .findByIdAndCustomerId(
                        autoPayId,
                        customer.getId()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Auto-Pay not found"
                        ));
    }

    // =====================================================
    // PAUSE AUTO-PAY
    // =====================================================

    @Transactional
    public AutoPay pauseAutoPay(
            String customerEmail,
            Long autoPayId) {

        AutoPay autoPay =
                getAutoPay(
                        customerEmail,
                        autoPayId
                );

        if (!"ACTIVE".equalsIgnoreCase(
                autoPay.getStatus())) {

            throw new RuntimeException(
                    "Only an active Auto-Pay can be paused"
            );
        }

        autoPay.setStatus("PAUSED");

        return autoPayRepository.save(autoPay);
    }

    // =====================================================
    // RESUME AUTO-PAY
    // =====================================================

    @Transactional
    public AutoPay resumeAutoPay(
            String customerEmail,
            Long autoPayId) {

        AutoPay autoPay =
                getAutoPay(
                        customerEmail,
                        autoPayId
                );

        if (!"PAUSED".equalsIgnoreCase(
                autoPay.getStatus())) {

            throw new RuntimeException(
                    "Only a paused Auto-Pay can be resumed"
            );
        }

        autoPay.setStatus("ACTIVE");

        return autoPayRepository.save(autoPay);
    }

    // =====================================================
    // CANCEL AUTO-PAY
    // =====================================================

    @Transactional
    public AutoPay cancelAutoPay(
            String customerEmail,
            Long autoPayId) {

        AutoPay autoPay =
                getAutoPay(
                        customerEmail,
                        autoPayId
                );

        if ("CANCELLED".equalsIgnoreCase(
                autoPay.getStatus())) {

            throw new RuntimeException(
                    "Auto-Pay is already cancelled"
            );
        }

        autoPay.setStatus("CANCELLED");

        return autoPayRepository.save(autoPay);
    }

    // =====================================================
    // DELETE AUTO-PAY
    // =====================================================

    @Transactional
    public void deleteAutoPay(
            String customerEmail,
            Long autoPayId) {

        AutoPay autoPay =
                getAutoPay(
                        customerEmail,
                        autoPayId
                );

        autoPayRepository.delete(autoPay);
    }

    // =====================================================
// PROCESS DUE AUTO-PAYS
// =====================================================

@Transactional
public void processDueAutoPays() {

    LocalDate today =
            LocalDate.now();

    List<AutoPay> autoPays =
            autoPayRepository
                    .findByStatusAndNextDueDateLessThanEqual(
                            "ACTIVE",
                            today
                    );

    System.out.println(
            "Due Auto-Pays found: "
                    + autoPays.size()
    );

    for (AutoPay autoPay : autoPays) {

        try {

            System.out.println(
                    "Processing Auto-Pay ID: "
                            + autoPay.getId()
            );

            // =============================================
            // EXECUTE PAYMENT
            // =============================================

            transactionService.executeAutoPay(
                    autoPay
            );

            // =============================================
            // UPDATE EXECUTION TIME
            // =============================================

            autoPay.setLastExecutedAt(
                    java.time.LocalDateTime.now()
            );

            // =============================================
            // CALCULATE NEXT DUE DATE
            // =============================================

            autoPay.setNextDueDate(
                    calculateNextDueDate(
                            autoPay.getNextDueDate(),
                            autoPay.getFrequency()
                    )
            );

            autoPayRepository.save(
                    autoPay
            );

            System.out.println(
                    "Auto-Pay SUCCESS. ID: "
                            + autoPay.getId()
            );

        } catch (Exception e) {

            /*
             * Ek Auto-Pay fail hone par
             * baaki Auto-Pays process hone chahiye.
             */

            System.out.println(
                    "Auto-Pay FAILED. ID: "
                            + autoPay.getId()
                            + " | "
                            + e.getMessage()
            );
        }
    }
}

    // =====================================================
// CALCULATE NEXT DUE DATE
// =====================================================

private LocalDate calculateNextDueDate(
        LocalDate currentDueDate,
        String frequency) {

    if (currentDueDate == null) {

        throw new RuntimeException(
                "Auto-Pay due date is missing"
        );
    }

    if (frequency == null) {

        throw new RuntimeException(
                "Auto-Pay frequency is missing"
        );
    }

    switch (frequency.toUpperCase()) {

        case "DAILY":
            return currentDueDate.plusDays(1);

        case "WEEKLY":
            return currentDueDate.plusWeeks(1);

        case "MONTHLY":
            return currentDueDate.plusMonths(1);

        case "YEARLY":
            return currentDueDate.plusYears(1);

        default:
            throw new RuntimeException(
                    "Invalid Auto-Pay frequency"
            );
    }
}

    // =====================================================
    // VALIDATE REQUEST
    // =====================================================

    private void validateRequest(
            AutoPayRequest request) {

        if (request == null) {

            throw new RuntimeException(
                    "Auto-Pay request cannot be empty"
            );
        }

        // =================================================
        // ACCOUNT ID
        // =================================================

        if (request.getAccountId() == null) {

            throw new RuntimeException(
                    "Account ID is required"
            );
        }

        // =================================================
        // BILLER NAME
        // =================================================

        if (request.getBillerName() == null
                || request.getBillerName()
                        .trim()
                        .isEmpty()) {

            throw new RuntimeException(
                    "Biller name is required"
            );
        }

        // =================================================
        // BILLER REFERENCE
        // =================================================

        if (request.getBillerReference() == null
                || request.getBillerReference()
                        .trim()
                        .isEmpty()) {

            throw new RuntimeException(
                    "Biller reference is required"
            );
        }

        // =================================================
        // AMOUNT
        // =================================================

        if (request.getAmount() == null
                || request.getAmount() <= 0) {

            throw new RuntimeException(
                    "Auto-Pay amount must be greater than 0"
            );
        }

        // =================================================
        // FREQUENCY
        // =================================================

        if (request.getFrequency() == null
                || request.getFrequency()
                        .trim()
                        .isEmpty()) {

            throw new RuntimeException(
                    "Auto-Pay frequency is required"
            );
        }

        String frequency =
                request.getFrequency()
                        .trim()
                        .toUpperCase();

        if (!frequency.equals("DAILY")
                && !frequency.equals("WEEKLY")
                && !frequency.equals("MONTHLY")
                && !frequency.equals("YEARLY")) {

            throw new RuntimeException(
                    "Invalid Auto-Pay frequency"
            );
        }

        // =================================================
        // START DATE
        // =================================================

        if (request.getStartDate() == null) {

            throw new RuntimeException(
                    "Auto-Pay start date is required"
            );
        }

        if (request.getStartDate()
                .isBefore(LocalDate.now())) {

            throw new RuntimeException(
                    "Auto-Pay start date cannot be in the past"
            );
        }
    }
}