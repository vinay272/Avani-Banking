package com.avanibank.backend.service;

import com.avanibank.backend.dto.NotificationRequest;
import com.avanibank.backend.entity.Loan;
import com.avanibank.backend.entity.LoanRepaymentSchedule;
import com.avanibank.backend.repository.LoanRepaymentScheduleRepository;
import com.avanibank.backend.repository.NotificationRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class LoanEMIReminderService {

        private final LoanRepaymentScheduleRepository repaymentScheduleRepository;
        private final NotificationService notificationService;
        private final NotificationRepository notificationRepository;

        public LoanEMIReminderService(
                        LoanRepaymentScheduleRepository repaymentScheduleRepository,
                        NotificationService notificationService,
                        NotificationRepository notificationRepository) {

                this.repaymentScheduleRepository = repaymentScheduleRepository;
                this.notificationService = notificationService;
                this.notificationRepository = notificationRepository;
        }

        @Transactional
        public int sendDueDateReminders() {

                LocalDate today = LocalDate.now();

                List<LoanRepaymentSchedule> dueInstallments = repaymentScheduleRepository
                                .findByDueDateAndStatus(today, "PENDING");

                int notificationCount = 0;

                for (LoanRepaymentSchedule installment : dueInstallments) {

                        Loan loan = installment.getLoan();

                        if (loan == null || loan.getCustomer() == null) {
                                continue;
                        }

                        NotificationRequest notificationRequest = new NotificationRequest();

                        notificationRequest.setCustomerId(
                                        loan.getCustomer().getId());

                        notificationRequest.setNotificationType(
                                        "LOAN_EMI_REMINDER");

                        notificationRequest.setReferenceType(
                                        "LOAN_EMI");

                        notificationRequest.setReferenceId(
                                        installment.getId());

                        notificationRequest.setChannel(
                                        "IN_APP");

                        boolean alreadySent = notificationRepository
                                        .existsByCustomerIdAndNotificationTypeAndReferenceTypeAndReferenceId(
                                                        loan.getCustomer().getId(),
                                                        "LOAN_EMI_REMINDER",
                                                        "LOAN_EMI",
                                                        installment.getId());

                        if (alreadySent) {
                                continue;
                        }

                        notificationRequest.setTitle(
                                        "Loan EMI Reminder");

                        notificationRequest.setMessage(
                                        "Your EMI of ₹"
                                                        + installment.getEmiAmount()
                                                        + " for installment #"
                                                        + installment.getInstallmentNumber()
                                                        + " is due today.");

                        notificationService.createNotification(
                                        notificationRequest);

                        notificationCount++;
                }

                return notificationCount;
        }
}