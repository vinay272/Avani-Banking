package com.avanibank.backend.service;

import com.avanibank.backend.entity.Account;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.FraudAlert;
import com.avanibank.backend.entity.FraudStatistics;
import com.avanibank.backend.dto.FraudAlertNotification;
import com.avanibank.backend.dto.NotificationRequest;
import com.avanibank.backend.repository.AccountRepository;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.FraudAlertRepository;
import com.avanibank.backend.repository.NotificationRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class FraudAlertService {

        private final FraudAlertRepository fraudAlertRepository;
        private final CustomerRepository customerRepository;
        private final AccountRepository accountRepository;
        private final FraudRiskEngineService fraudRiskEngineService;
        private final FraudAlertNotificationService fraudAlertNotificationService;
        private final NotificationService notificationService;
        private final NotificationRepository notificationRepository;

        public FraudAlertService(
                        FraudAlertRepository fraudAlertRepository,
                        CustomerRepository customerRepository,
                        AccountRepository accountRepository,
                        FraudRiskEngineService fraudRiskEngineService,
                        FraudAlertNotificationService fraudAlertNotificationService,
                        NotificationService notificationService,
                        NotificationRepository notificationRepository

        ) {
                this.fraudAlertRepository = fraudAlertRepository;
                this.customerRepository = customerRepository;
                this.accountRepository = accountRepository;
                this.fraudRiskEngineService = fraudRiskEngineService;
                this.fraudAlertNotificationService = fraudAlertNotificationService;
                this.notificationService = notificationService;
                this.notificationRepository = notificationRepository;
        }

        public FraudAlert analyzeAndCreateAlert(
                        String customerEmail,
                        Long accountId,
                        BigDecimal amount,
                        String transactionType,
                        int recentTransactionCount,
                        boolean unusualLocation,
                        boolean unusualDevice,
                        boolean accountTakeoverIndicators,
                        boolean moneyLaunderingIndicators,
                        Long transactionId,
                        String location) {

                Customer customer = customerRepository
                                .findByEmail(customerEmail)
                                .orElseThrow(() -> new RuntimeException("Customer not found"));

                Account account = accountRepository
                                .findByIdAndCustomerId(accountId, customer.getId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Account not found or does not belong to customer"));

                FraudRiskEngineService.RiskResult result = fraudRiskEngineService.calculateTransactionRisk(
                                amount,
                                transactionType,
                                recentTransactionCount,
                                unusualLocation,
                                unusualDevice,
                                accountTakeoverIndicators,
                                moneyLaunderingIndicators);

                /*
                 * Only create an alert when the calculated
                 * risk reaches MEDIUM or above.
                 */
                if ("LOW".equals(result.getRiskLevel())
                                && !"VELOCITY_CHECK".equals(result.getAlertType())) {
                        return null;
                }

                FraudAlert alert = new FraudAlert();

                alert.setCustomer(customer);
                alert.setAccount(account);

                alert.setAlertType(result.getAlertType());
                alert.setRiskLevel(result.getRiskLevel());
                alert.setRiskScore(result.getRiskScore());
                alert.setDescription(result.getDescription());

                alert.setTransactionId(transactionId);
                alert.setTransactionType(transactionType);
                alert.setLocation(location);

                alert.setStatus("OPEN");

                FraudAlert savedAlert = fraudAlertRepository.save(alert);

                FraudAlertNotification notification = new FraudAlertNotification(
                                savedAlert.getId(),
                                savedAlert.getAlertType(),
                                savedAlert.getRiskLevel(),
                                savedAlert.getRiskScore(),
                                savedAlert.getDescription(),
                                savedAlert.getTransactionType(),
                                savedAlert.getStatus());

                fraudAlertNotificationService.sendFraudAlert(
                                customerEmail,
                                notification);

                if ("MEDIUM".equals(savedAlert.getRiskLevel())
                                || "HIGH".equals(savedAlert.getRiskLevel())
                                || "CRITICAL".equals(savedAlert.getRiskLevel())) {

                        boolean alreadyNotified = notificationRepository
                                        .existsByCustomerIdAndNotificationTypeAndReferenceTypeAndReferenceId(
                                                        customer.getId(),
                                                        "SUSPICIOUS_ACTIVITY_ALERT",
                                                        "FRAUD_ALERT",
                                                        savedAlert.getId());

                        if (!alreadyNotified) {

                                NotificationRequest suspiciousNotification = new NotificationRequest();

                                suspiciousNotification.setCustomerId(
                                                customer.getId());

                                suspiciousNotification.setNotificationType(
                                                "SUSPICIOUS_ACTIVITY_ALERT");

                                suspiciousNotification.setChannel(
                                                "IN_APP");

                                suspiciousNotification.setTitle(
                                                "Suspicious Activity Detected");

                                suspiciousNotification.setMessage(
                                                "Suspicious activity detected on your account. "
                                                                + "Risk Level: "
                                                                + savedAlert.getRiskLevel()
                                                                + ", Risk Score: "
                                                                + savedAlert.getRiskScore()
                                                                + ". "
                                                                + savedAlert.getDescription());

                                suspiciousNotification.setReferenceType(
                                                "FRAUD_ALERT");

                                suspiciousNotification.setReferenceId(
                                                savedAlert.getId());

                                notificationService.createNotification(
                                                suspiciousNotification);
                        }
                }
                return savedAlert;
        }

        public List<FraudAlert> getCustomerAlerts(
                        String customerEmail) {

                Customer customer = customerRepository
                                .findByEmail(customerEmail)
                                .orElseThrow(() -> new RuntimeException("Customer not found"));

                return fraudAlertRepository
                                .findByCustomerIdOrderByDetectedAtDesc(
                                                customer.getId());
        }

        public List<FraudAlert> getOpenCustomerAlerts(
                        String customerEmail) {

                Customer customer = customerRepository
                                .findByEmail(customerEmail)
                                .orElseThrow(() -> new RuntimeException("Customer not found"));

                return fraudAlertRepository
                                .findByCustomerIdAndStatusOrderByDetectedAtDesc(
                                                customer.getId(),
                                                "OPEN");
        }

        public long getOpenAlertCount(
                        String customerEmail) {

                Customer customer = customerRepository
                                .findByEmail(customerEmail)
                                .orElseThrow(() -> new RuntimeException("Customer not found"));

                return fraudAlertRepository.countByCustomerIdAndStatus(
                                customer.getId(),
                                "OPEN");
        }

        public List<FraudAlert> getAllFraudAlerts() {

                return fraudAlertRepository
                                .findAll();
        }

        public List<FraudAlert> getAlertsByRiskLevel(
                        String riskLevel) {

                return fraudAlertRepository
                                .findByRiskLevelOrderByDetectedAtDesc(
                                                riskLevel);
        }

        public List<FraudAlert> getAlertsByType(
                        String alertType) {

                return fraudAlertRepository
                                .findByAlertTypeOrderByDetectedAtDesc(
                                                alertType);
        }

        public FraudAlert resolveAlert(
                        Long alertId,
                        String resolutionNote) {

                FraudAlert alert = fraudAlertRepository
                                .findById(alertId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Fraud alert not found"));

                alert.setStatus("RESOLVED");
                alert.setResolvedAt(
                                java.time.LocalDateTime.now());
                alert.setResolutionNote(resolutionNote);

                return fraudAlertRepository.save(alert);
        }

        public FraudStatistics getFraudStatistics() {

                FraudStatistics statistics = new FraudStatistics();

                statistics.setTotalAlerts(
                                fraudAlertRepository.count());

                statistics.setOpenAlerts(
                                fraudAlertRepository.countByStatus("OPEN"));

                statistics.setResolvedAlerts(
                                fraudAlertRepository.countByStatus("RESOLVED"));

                statistics.setCriticalAlerts(
                                fraudAlertRepository.countByRiskLevel("CRITICAL"));

                statistics.setHighAlerts(
                                fraudAlertRepository.countByRiskLevel("HIGH"));

                statistics.setMediumAlerts(
                                fraudAlertRepository.countByRiskLevel("MEDIUM"));

                statistics.setLowAlerts(
                                fraudAlertRepository.countByRiskLevel("LOW"));

                return statistics;
        }

        // =====================================================
        // UPDATE TRANSACTION ID IN FRAUD ALERT
        // =====================================================

        public FraudAlert updateTransactionId(
                        Long alertId,
                        Long transactionId) {

                FraudAlert alert = fraudAlertRepository
                                .findById(alertId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Fraud alert not found"));

                alert.setTransactionId(transactionId);

                return fraudAlertRepository.save(alert);
        }

}