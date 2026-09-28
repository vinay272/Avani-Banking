package com.avanibank.backend.service;

import com.avanibank.backend.dto.ScheduledPaymentRequest;
import com.avanibank.backend.entity.Account;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.ScheduledPayment;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.repository.AccountRepository;
import com.avanibank.backend.repository.ScheduledPaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ScheduledPaymentService {

    private final ScheduledPaymentRepository scheduledPaymentRepository;
    private final AccountRepository accountRepository;
    private final CustomerService customerService;
    private final TransactionService transactionService;

    public ScheduledPaymentService(
            ScheduledPaymentRepository scheduledPaymentRepository,
            AccountRepository accountRepository,
            CustomerService customerService,
            TransactionService transactionService) {

        this.scheduledPaymentRepository = scheduledPaymentRepository;
        this.accountRepository = accountRepository;
        this.customerService = customerService;
        this.transactionService = transactionService;
    }

    // =====================================================
    // CREATE SCHEDULED PAYMENT
    // =====================================================

    @Transactional
    public ScheduledPayment createScheduledPayment(
            String email,
            ScheduledPaymentRequest request) {

        if (request == null) {
            throw new RuntimeException(
                    "Scheduled Payment request cannot be empty"
            );
        }

        Customer customer =
                customerService.getCustomerByEmail(email);

        if (customer == null) {
            throw new RuntimeException(
                    "Customer not found"
            );
        }

        if (request.getAccountId() == null) {
            throw new RuntimeException(
                    "Account is required"
            );
        }

        Account account =
                accountRepository
                        .findByIdAndCustomerId(
                                request.getAccountId(),
                                customer.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Account not found"
                                )
                        );

        if (!"ACTIVE".equalsIgnoreCase(
                account.getStatus())) {

            throw new RuntimeException(
                    "Account is not active"
            );
        }

        validateRequest(request);

        ScheduledPayment scheduledPayment =
                new ScheduledPayment();

        scheduledPayment.setCustomer(customer);
        scheduledPayment.setAccount(account);
        scheduledPayment.setPaymentType(
                request.getPaymentType()
        );
        scheduledPayment.setReceiverAccountNumber(
                request.getReceiverAccountNumber().trim()
        );
        scheduledPayment.setReceiverIfscCode(
                request.getReceiverIfscCode()
                        .trim()
                        .toUpperCase()
        );

        if (request.getReceiverUpiId() != null
                && !request.getReceiverUpiId()
                        .trim()
                        .isEmpty()) {

            scheduledPayment.setReceiverUpiId(
                    request.getReceiverUpiId().trim()
            );
        }

        scheduledPayment.setAmount(
                request.getAmount()
        );

        scheduledPayment.setScheduledDate(
                request.getScheduledDate()
        );

        scheduledPayment.setStatus(
                "SCHEDULED"
        );


        return scheduledPaymentRepository.save(
                scheduledPayment
        );
    }

    // =====================================================
    // GET ALL SCHEDULED PAYMENTS
    // =====================================================

    @Transactional(readOnly = true)
    public List<ScheduledPayment> getScheduledPayments(
            String email) {

        Customer customer =
                customerService.getCustomerByEmail(email);

        return scheduledPaymentRepository
                .findByCustomerIdOrderByCreatedAtDesc(
                        customer.getId()
                );
    }

    // =====================================================
    // GET SCHEDULED PAYMENT BY ID
    // =====================================================

    @Transactional(readOnly = true)
    public ScheduledPayment getScheduledPayment(
            String email,
            Long id) {

        Customer customer =
                customerService.getCustomerByEmail(email);

        return scheduledPaymentRepository
                .findByIdAndCustomerId(
                        id,
                        customer.getId()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Scheduled Payment not found"
                        )
                );
    }

    // =====================================================
    // PAUSE SCHEDULED PAYMENT
    // =====================================================

    @Transactional
    public ScheduledPayment pauseScheduledPayment(
            String email,
            Long id) {

        ScheduledPayment scheduledPayment =
                getScheduledPayment(email, id);

        if ("CANCELLED".equalsIgnoreCase(
                scheduledPayment.getStatus())) {

            throw new RuntimeException(
                    "Cancelled Scheduled Payment cannot be paused"
            );
        }

        if ("COMPLETED".equalsIgnoreCase(
                scheduledPayment.getStatus())) {

            throw new RuntimeException(
                    "Completed Scheduled Payment cannot be paused"
            );
        }

        if ("PAUSED".equalsIgnoreCase(
                scheduledPayment.getStatus())) {

            throw new RuntimeException(
                    "Scheduled Payment is already paused"
            );
        }

        scheduledPayment.setStatus("PAUSED");

        return scheduledPaymentRepository.save(
                scheduledPayment
        );
    }

    // =====================================================
    // RESUME SCHEDULED PAYMENT
    // =====================================================

    @Transactional
    public ScheduledPayment resumeScheduledPayment(
            String email,
            Long id) {

        ScheduledPayment scheduledPayment =
                getScheduledPayment(email, id);

        if ("CANCELLED".equalsIgnoreCase(
                scheduledPayment.getStatus())) {

            throw new RuntimeException(
                    "Cancelled Scheduled Payment cannot be resumed"
            );
        }

        if ("COMPLETED".equalsIgnoreCase(
                scheduledPayment.getStatus())) {

            throw new RuntimeException(
                    "Completed Scheduled Payment cannot be resumed"
            );
        }

        if ("SCHEDULED".equalsIgnoreCase(
                scheduledPayment.getStatus())) {

            throw new RuntimeException(
                    "Scheduled Payment is already active"
            );
        }

        scheduledPayment.setStatus("SCHEDULED");

        return scheduledPaymentRepository.save(
                scheduledPayment
        );
    }

    // =====================================================
// CANCEL SCHEDULED PAYMENT
// =====================================================

@Transactional
public ScheduledPayment cancelScheduledPayment(
        String email,
        Long id) {

    ScheduledPayment scheduledPayment =
            getScheduledPayment(email, id);

    if (!"SCHEDULED".equalsIgnoreCase(
            scheduledPayment.getStatus())) {

        throw new RuntimeException(
                "Only scheduled payments can be cancelled"
        );
    }

    scheduledPayment.setStatus("CANCELLED");

    return scheduledPaymentRepository.save(
            scheduledPayment
    );
}
    // =====================================================
    // DELETE SCHEDULED PAYMENT
    // =====================================================

    @Transactional
    public void deleteScheduledPayment(
            String email,
            Long id) {

        ScheduledPayment scheduledPayment =
                getScheduledPayment(email, id);

        if ("COMPLETED".equalsIgnoreCase(
                scheduledPayment.getStatus())) {

            throw new RuntimeException(
                    "Completed Scheduled Payment cannot be deleted"
            );
        }

        scheduledPaymentRepository.delete(
                scheduledPayment
        );
    }

    // =====================================================
    // PROCESS DUE SCHEDULED PAYMENTS
    // =====================================================

    @Transactional
    public void processDueScheduledPayments() {

        LocalDate today = LocalDate.now();

        List<ScheduledPayment> duePayments =
                scheduledPaymentRepository
                        .findByStatusAndScheduledDateLessThanEqual(
                                "SCHEDULED",
                                today
                        );

        for (ScheduledPayment scheduledPayment
                : duePayments) {

            try {

                Transaction transaction =
                        transactionService
                                .executeScheduledPayment(
                                        scheduledPayment
                                );

                if (transaction != null
                        && "SUCCESS".equalsIgnoreCase(
                                transaction.getStatus())) {

                    scheduledPayment.setStatus(
                            "COMPLETED"
                    );

                    scheduledPayment.setExecutedAt(
                            LocalDateTime.now()
                    );

                    scheduledPaymentRepository.save(
                            scheduledPayment
                    );
                }

            } catch (Exception e) {

                System.out.println(
                        "Scheduled Payment ID "
                                + scheduledPayment.getId()
                                + " failed: "
                                + e.getMessage()
                );

                scheduledPayment.setStatus(
                        "FAILED"
                );

                scheduledPaymentRepository.save(
                        scheduledPayment
                );
            }
        }
    }

    // =====================================================
    // VALIDATION
    // =====================================================

    private void validateRequest(
            ScheduledPaymentRequest request) {

        if (request.getPaymentType() == null
                || request.getPaymentType()
                        .trim()
                        .isEmpty()) {

            throw new RuntimeException(
                    "Payment type is required"
            );
        }

        String paymentType =
                request.getPaymentType()
                        .trim()
                        .toUpperCase();

        if (!paymentType.equals("UPI")
                && !paymentType.equals("NEFT")
                && !paymentType.equals("RTGS")
                && !paymentType.equals("IMPS")) {

            throw new RuntimeException(
                    "Invalid payment type"
            );
        }

        if (request.getReceiverAccountNumber() == null
                || request.getReceiverAccountNumber()
                        .trim()
                        .isEmpty()) {

            throw new RuntimeException(
                    "Receiver account number is required"
            );
        }

        if (request.getReceiverIfscCode() == null
                || request.getReceiverIfscCode()
                        .trim()
                        .isEmpty()) {

            throw new RuntimeException(
                    "Receiver IFSC code is required"
            );
        }

        if (request.getAmount() == null
                || request.getAmount() <= 0) {

            throw new RuntimeException(
                    "Amount must be greater than zero"
            );
        }

        if (request.getScheduledDate() == null) {

            throw new RuntimeException(
                    "Scheduled date is required"
            );
        }

        if (request.getScheduledDate()
                .isBefore(LocalDate.now())) {

            throw new RuntimeException(
                    "Scheduled date cannot be in the past"
            );
        }

        if (request.getPaymentType()
                .trim()
                .equalsIgnoreCase("UPI")
                && (request.getReceiverUpiId() == null
                || request.getReceiverUpiId()
                        .trim()
                        .isEmpty())) {

            throw new RuntimeException(
                    "Receiver UPI ID is required for UPI payment"
            );
        }
    }
}