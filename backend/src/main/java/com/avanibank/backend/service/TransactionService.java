package com.avanibank.backend.service;

import com.avanibank.backend.dto.RechargeRequest;
import com.avanibank.backend.dto.TransferRequest;
import com.avanibank.backend.entity.Account;
import com.avanibank.backend.entity.AutoPay;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.FraudAlert;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.repository.AccountRepository;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.TransactionRepository;
import com.avanibank.backend.entity.ScheduledPayment;
import com.avanibank.backend.service.FraudAlertService;
import com.avanibank.backend.dto.NotificationRequest;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TransactionService {

        private final CustomerRepository customerRepository;
        private final AccountRepository accountRepository;
        private final TransactionRepository transactionRepository;
        private final FraudAlertService fraudAlertService;
        private final NotificationService notificationService;
        private final LowBalanceAlertService lowBalanceAlertService;

        public TransactionService(
                        CustomerRepository customerRepository,
                        AccountRepository accountRepository,
                        TransactionRepository transactionRepository,
                        FraudAlertService fraudAlertService,
                        NotificationService notificationService,
                        LowBalanceAlertService lowBalanceAlertService) {

                this.customerRepository = customerRepository;
                this.accountRepository = accountRepository;
                this.transactionRepository = transactionRepository;
                this.fraudAlertService = fraudAlertService;
                this.notificationService = notificationService;
                this.lowBalanceAlertService = lowBalanceAlertService;
        }

        // =====================================================
        // TRANSFER MONEY
        // =====================================================

        @Transactional
        public Transaction transferMoney(
                        String senderEmail,
                        TransferRequest request) {

                validateRequest(request, "Transfer");

                String receiverAccountNumber = request.getReceiverAccountNumber().trim();

                String receiverIfscCode = request.getReceiverIfscCode().trim().toUpperCase();

                Double amount = request.getAmount();

                Customer sender = customerRepository
                                .findByEmail(senderEmail)
                                .orElseThrow(() -> new RuntimeException(
                                                "Sender account not found"));

                Account senderAccount = accountRepository
                                .findByCustomerIdAndStatus(
                                                sender.getId(),
                                                "ACTIVE")
                                .stream()
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException(
                                                "No active sender account found"));

                Account receiverAccount = findReceiverAccount(
                                receiverAccountNumber,
                                receiverIfscCode);

                Customer receiver = receiverAccount.getCustomer();

                preventSelfTransfer(
                                senderAccount,
                                receiverAccount);

                FraudAlert fraudAlert = analyzeTransactionFraud(
                                senderEmail,
                                senderAccount,
                                amount,
                                "TRANSFER");

                processTransfer(
                                sender,
                                receiver,
                                senderAccount,
                                receiverAccount,
                                amount);

                Transaction transaction = createTransaction(
                                senderAccount,
                                receiverAccount,
                                amount,
                                "TRANSFER");

                if (fraudAlert != null) {

                        fraudAlertService.updateTransactionId(
                                        fraudAlert.getId(),
                                        transaction.getId());
                }
                return transaction;
        }
        // =====================================================
        // NEFT TRANSFER
        // =====================================================

        @Transactional
        public Transaction neftTransfer(
                        String senderEmail,
                        TransferRequest request) {

                validateRequest(request, "NEFT");

                String receiverAccountNumber = request.getReceiverAccountNumber().trim();

                String receiverIfscCode = request.getReceiverIfscCode().trim().toUpperCase();

                Double amount = request.getAmount();

                Customer sender = customerRepository
                                .findByEmail(senderEmail)
                                .orElseThrow(() -> new RuntimeException(
                                                "Sender account not found"));

                Account senderAccount = accountRepository
                                .findByCustomerIdAndStatus(
                                                sender.getId(),
                                                "ACTIVE")
                                .stream()
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException(
                                                "No active sender account found"));

                Account receiverAccount = findReceiverAccount(
                                receiverAccountNumber,
                                receiverIfscCode);

                Customer receiver = receiverAccount.getCustomer();

                preventSelfTransfer(
                                senderAccount,
                                receiverAccount);

                FraudAlert fraudAlert = analyzeTransactionFraud(
                                senderEmail,
                                senderAccount,
                                amount,
                                "NEFT");

                processTransfer(
                                sender,
                                receiver,
                                senderAccount,
                                receiverAccount,
                                amount);

                Transaction transaction = createTransaction(
                                senderAccount,
                                receiverAccount,
                                amount,
                                "NEFT");

                if (fraudAlert != null) {

                        fraudAlertService.updateTransactionId(
                                        fraudAlert.getId(),
                                        transaction.getId());
                }

                return transaction;
        }

        // =====================================================
        // RTGS TRANSFER
        // =====================================================

        @Transactional
        public Transaction rtgsTransfer(
                        String senderEmail,
                        TransferRequest request) {

                validateRequest(request, "RTGS");

                String receiverAccountNumber = request.getReceiverAccountNumber().trim();

                String receiverIfscCode = request.getReceiverIfscCode().trim().toUpperCase();

                Double amount = request.getAmount();

                Customer sender = customerRepository
                                .findByEmail(senderEmail)
                                .orElseThrow(() -> new RuntimeException(
                                                "Sender account not found"));

                Account senderAccount = accountRepository
                                .findByCustomerIdAndStatus(
                                                sender.getId(),
                                                "ACTIVE")
                                .stream()
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException(
                                                "No active sender account found"));

                Account receiverAccount = findReceiverAccount(
                                receiverAccountNumber,
                                receiverIfscCode);

                Customer receiver = receiverAccount.getCustomer();

                preventSelfTransfer(
                                senderAccount,
                                receiverAccount);

                FraudAlert fraudAlert = analyzeTransactionFraud(
                                senderEmail,
                                senderAccount,
                                amount,
                                "RTGS");

                processTransfer(
                                sender,
                                receiver,
                                senderAccount,
                                receiverAccount,
                                amount);

                Transaction transaction = createTransaction(
                                senderAccount,
                                receiverAccount,
                                amount,
                                "RTGS");

                if (fraudAlert != null) {

                        fraudAlertService.updateTransactionId(
                                        fraudAlert.getId(),
                                        transaction.getId());
                }

                return transaction;
        }

        // =====================================================
        // IMPS TRANSFER
        // =====================================================

        @Transactional
        public Transaction impsTransfer(
                        String senderEmail,
                        TransferRequest request) {

                validateRequest(request, "IMPS");

                String receiverAccountNumber = request.getReceiverAccountNumber().trim();

                String receiverIfscCode = request.getReceiverIfscCode().trim().toUpperCase();

                Double amount = request.getAmount();

                Customer sender = customerRepository
                                .findByEmail(senderEmail)
                                .orElseThrow(() -> new RuntimeException(
                                                "Sender account not found"));

                Account senderAccount = accountRepository
                                .findByCustomerIdAndStatus(
                                                sender.getId(),
                                                "ACTIVE")
                                .stream()
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException(
                                                "No active sender account found"));

                Account receiverAccount = findReceiverAccount(
                                receiverAccountNumber,
                                receiverIfscCode);

                Customer receiver = receiverAccount.getCustomer();

                preventSelfTransfer(
                                senderAccount,
                                receiverAccount);

                FraudAlert fraudAlert = analyzeTransactionFraud(
                                senderEmail,
                                senderAccount,
                                amount,
                                "IMPS");

                processTransfer(
                                sender,
                                receiver,
                                senderAccount,
                                receiverAccount,
                                amount);

                Transaction transaction = createTransaction(
                                senderAccount,
                                receiverAccount,
                                amount,
                                "IMPS");

                if (fraudAlert != null) {

                        fraudAlertService.updateTransactionId(
                                        fraudAlert.getId(),
                                        transaction.getId());
                }

                return transaction;
        }

        // =====================================================
        // RECHARGE
        // =====================================================

        @Transactional
        public Transaction recharge(
                        String customerEmail,
                        RechargeRequest request) {

                validateRechargeRequest(request);

                String mobileNumber = request.getMobileNumber().trim();

                String operator = request.getOperator().trim();

                Double amount = request.getAmount();

                // =================================================
                // FIND CUSTOMER
                // =================================================

                Customer customer = customerRepository
                                .findByEmail(customerEmail)
                                .orElseThrow(() -> new RuntimeException(
                                                "Customer account not found"));

                // =================================================
                // FIND ACTIVE ACCOUNT
                // =================================================

                Account account = accountRepository
                                .findByCustomerIdAndStatus(
                                                customer.getId(),
                                                "ACTIVE")
                                .stream()
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException(
                                                "No active account found"));

                // =================================================
                // ACCOUNT STATUS
                // =================================================

                if (!"ACTIVE".equalsIgnoreCase(
                                account.getStatus())) {

                        throw new RuntimeException(
                                        "Account is not active");
                }

                // =================================================
                // BALANCE CHECK
                // =================================================

                if (account.getBalance() == null) {

                        throw new RuntimeException(
                                        "Account balance is unavailable");
                }

                if (account.getBalance() < amount) {

                        throw new RuntimeException(
                                        "Insufficient balance");
                }

                // =================================================
                // DEBIT ACCOUNT
                // =================================================

                account.setBalance(
                                account.getBalance() - amount);

                accountRepository.save(account);

                // =================================================
                // SYNC CUSTOMER BALANCE
                // =================================================

                customer.setBalance(
                                account.getBalance());

                customerRepository.save(customer);

                // =================================================
                // CREATE RECHARGE TRANSACTION
                // =================================================

                // =================================================
// CREATE RECHARGE TRANSACTION
// =================================================

Transaction transaction = createRechargeTransaction(
        account,
        mobileNumber,
        operator,
        amount);

// =================================================
// RECHARGE DEBIT ALERT
// =================================================

NotificationRequest debitNotification =
        new NotificationRequest();

debitNotification.setCustomerId(
        customer.getId());

debitNotification.setNotificationType(
        "DEBIT_ALERT");

debitNotification.setChannel(
        "IN_APP");

debitNotification.setTitle(
        "Recharge Payment Debited");

debitNotification.setMessage(
        "₹" + amount
                + " has been debited from your account for mobile recharge.");

notificationService.createNotification(
        debitNotification);

return transaction;
        }

        // =====================================================
        // VALIDATE RECHARGE REQUEST
        // =====================================================

        private void validateRechargeRequest(
                        RechargeRequest request) {

                if (request == null) {

                        throw new RuntimeException(
                                        "Recharge request cannot be empty");
                }

                // =================================================
                // MOBILE NUMBER
                // =================================================

                if (request.getMobileNumber() == null
                                || request.getMobileNumber()
                                                .trim()
                                                .isEmpty()) {

                        throw new RuntimeException(
                                        "Mobile number is required");
                }

                String mobileNumber = request.getMobileNumber()
                                .trim();

                if (!mobileNumber.matches(
                                "^[6-9][0-9]{9}$")) {

                        throw new RuntimeException(
                                        "Invalid mobile number");
                }

                // =================================================
                // OPERATOR
                // =================================================

                if (request.getOperator() == null
                                || request.getOperator()
                                                .trim()
                                                .isEmpty()) {

                        throw new RuntimeException(
                                        "Operator is required");
                }

                String operator = request.getOperator()
                                .trim();

                if (!operator.equalsIgnoreCase("Jio")
                                && !operator.equalsIgnoreCase("Airtel")
                                && !operator.equalsIgnoreCase("Vi")
                                && !operator.equalsIgnoreCase("BSNL")) {

                        throw new RuntimeException(
                                        "Invalid mobile operator");
                }

                // =================================================
                // AMOUNT
                // =================================================

                if (request.getAmount() == null
                                || request.getAmount() <= 0) {

                        throw new RuntimeException(
                                        "Recharge amount must be greater than 0");
                }
        }

        // =====================================================
        // VALIDATE TRANSFER REQUEST
        // =====================================================

        private void validateRequest(
                        TransferRequest request,
                        String transferType) {

                if (request == null) {

                        throw new RuntimeException(
                                        transferType +
                                                        " transfer request cannot be empty");
                }

                if (request.getReceiverAccountNumber() == null
                                || request.getReceiverAccountNumber()
                                                .trim().isEmpty()) {

                        throw new RuntimeException(
                                        "Receiver account number is required");
                }

                if (request.getReceiverIfscCode() == null
                                || request.getReceiverIfscCode()
                                                .trim().isEmpty()) {

                        throw new RuntimeException(
                                        "Receiver IFSC code is required");
                }

                String ifsc = request.getReceiverIfscCode()
                                .trim()
                                .toUpperCase();

                if (!ifsc.matches(
                                "^[A-Z]{4}0[A-Z0-9]{6}$")) {

                        throw new RuntimeException(
                                        "Invalid IFSC code format");
                }

                if (request.getAmount() == null
                                || request.getAmount() <= 0) {

                        throw new RuntimeException(
                                        transferType +
                                                        " transfer amount must be greater than 0");
                }
        }

        // =====================================================
        // FIND RECEIVER ACCOUNT
        // =====================================================

        private Account findReceiverAccount(
                        String accountNumber,
                        String ifscCode) {

                Account receiverAccount = accountRepository
                                .findByAccountNumber(
                                                accountNumber)
                                .orElseThrow(() -> new RuntimeException(
                                                "Receiver account not found"));

                if (receiverAccount.getIfscCode() == null
                                || !receiverAccount
                                                .getIfscCode()
                                                .equalsIgnoreCase(ifscCode)) {

                        throw new RuntimeException(
                                        "Receiver account number and IFSC code do not match");
                }

                return receiverAccount;
        }

        // =====================================================
        // PREVENT SELF TRANSFER
        // =====================================================

        private void preventSelfTransfer(
                        Account senderAccount,
                        Account receiverAccount) {

                if (senderAccount.getId()
                                .equals(receiverAccount.getId())) {

                        throw new RuntimeException(
                                        "You cannot transfer money to your own account");
                }
        }

        // =====================================================
        // PROCESS MONEY TRANSFER
        // =====================================================

        private void processTransfer(
                        Customer sender,
                        Customer receiver,
                        Account senderAccount,
                        Account receiverAccount,
                        Double amount) {

                if (!"ACTIVE".equalsIgnoreCase(
                                senderAccount.getStatus())) {

                        throw new RuntimeException(
                                        "Sender account is not active");
                }

                if (!"ACTIVE".equalsIgnoreCase(
                                receiverAccount.getStatus())) {

                        throw new RuntimeException(
                                        "Receiver account is not active");
                }

                if (senderAccount.getBalance() == null) {

                        throw new RuntimeException(
                                        "Sender account balance is unavailable");
                }

                if (senderAccount.getBalance() < amount) {

                        throw new RuntimeException(
                                        "Insufficient balance");
                }

                senderAccount.setBalance(
                                senderAccount.getBalance() - amount);

                if (receiverAccount.getBalance() == null) {

                        receiverAccount.setBalance(0.0);
                }

                receiverAccount.setBalance(
                                receiverAccount.getBalance() + amount);

                accountRepository.save(senderAccount);
                lowBalanceAlertService.checkAndNotify(
        sender,
        senderAccount
);
                accountRepository.save(receiverAccount);

                sender.setBalance(
                                senderAccount.getBalance());

                receiver.setBalance(
                                receiverAccount.getBalance());

                customerRepository.save(sender);
                customerRepository.save(receiver);

                // =================================================
                // DEBIT ALERT - SENDER
                // =================================================

                NotificationRequest debitNotification = new NotificationRequest();

                debitNotification.setCustomerId(sender.getId());
                debitNotification.setNotificationType("DEBIT_ALERT");
                debitNotification.setChannel("IN_APP");
                debitNotification.setTitle("Money Debited");
                debitNotification.setMessage(
                                "₹" + amount + " has been debited from your account."
                                                + " Transaction type: " + "TRANSFER");

                notificationService.createNotification(debitNotification);

                // =================================================
                // CREDIT ALERT - RECEIVER
                // =================================================

                NotificationRequest creditNotification = new NotificationRequest();

                creditNotification.setCustomerId(receiver.getId());
                creditNotification.setNotificationType("CREDIT_ALERT");
                creditNotification.setChannel("IN_APP");
                creditNotification.setTitle("Money Credited");
                creditNotification.setMessage(
                                "₹" + amount + " has been credited to your account."
                                                + " Transaction type: " + "TRANSFER");

                notificationService.createNotification(creditNotification);

        }
        // =====================================================
        // CREATE NORMAL TRANSACTION
        // =====================================================

        private Transaction createTransaction(
                        Account senderAccount,
                        Account receiverAccount,
                        Double amount,
                        String transactionType) {

                Transaction transaction = new Transaction();

                transaction.setSenderAccountNumber(
                                senderAccount.getAccountNumber());

                transaction.setReceiverAccountNumber(
                                receiverAccount.getAccountNumber());

                transaction.setAmount(amount);

                transaction.setTransactionType(
                                transactionType);

                transaction.setStatus(
                                "SUCCESS");

                return transactionRepository.save(
                                transaction);
        }

        // =====================================================
        // CREATE RECHARGE TRANSACTION
        // =====================================================

        private Transaction createRechargeTransaction(
                        Account account,
                        String mobileNumber,
                        String operator,
                        Double amount) {

                Transaction transaction = new Transaction();

                transaction.setSenderAccountNumber(
                                account.getAccountNumber());

                /*
                 * Recharge me bank receiver account nahi hota.
                 * Mobile number ko receiver reference ke roop me
                 * transaction table me store kar rahe hain.
                 */
                transaction.setReceiverAccountNumber(
                                mobileNumber);

                transaction.setAmount(amount);

                transaction.setTransactionType(
                                "RECHARGE");

                transaction.setStatus(
                                "SUCCESS");

                return transactionRepository.save(
                                transaction);
        }

        // =====================================================
        // GET SENT TRANSACTIONS
        // =====================================================

        public List<Transaction> getSentTransactions(
                        String accountNumber) {

                return transactionRepository
                                .findBySenderAccountNumberOrderByTransactionDateDesc(
                                                accountNumber);
        }

        // =====================================================
        // GET RECEIVED TRANSACTIONS
        // =====================================================

        public List<Transaction> getReceivedTransactions(
                        String accountNumber) {

                return transactionRepository
                                .findByReceiverAccountNumberOrderByTransactionDateDesc(
                                                accountNumber);
        }

        // =====================================================
        // EXECUTE AUTO-PAY
        // =====================================================

        @Transactional
        public Transaction executeAutoPay(
                        AutoPay autoPay) {

                if (autoPay == null) {

                        throw new RuntimeException(
                                        "Auto-Pay cannot be empty");
                }

                // =================================================
                // GET ACCOUNT
                // =================================================

                Account account = autoPay.getAccount();

                if (account == null) {

                        throw new RuntimeException(
                                        "Auto-Pay account not found");
                }

                // =================================================
                // ACCOUNT STATUS
                // =================================================

                if (!"ACTIVE".equalsIgnoreCase(
                                account.getStatus())) {

                        throw new RuntimeException(
                                        "Auto-Pay account is not active");
                }

                // =================================================
                // AMOUNT VALIDATION
                // =================================================

                Double amount = autoPay.getAmount();

                if (amount == null || amount <= 0) {

                        throw new RuntimeException(
                                        "Invalid Auto-Pay amount");
                }

                // =================================================
                // BALANCE CHECK
                // =================================================

                if (account.getBalance() == null) {

                        throw new RuntimeException(
                                        "Account balance is unavailable");
                }

                if (account.getBalance() < amount) {

                        throw new RuntimeException(
                                        "Insufficient balance for Auto-Pay");
                }

                // =================================================
                // DEBIT ACCOUNT
                // =================================================

                account.setBalance(
                                account.getBalance() - amount);

                accountRepository.save(account);

                // =================================================
                // SYNC CUSTOMER BALANCE
                // =================================================

                Customer customer = autoPay.getCustomer();

                if (customer != null) {

                        customer.setBalance(
                                        account.getBalance());

                        customerRepository.save(customer);
                }

                // =================================================
                // CREATE AUTO-PAY TRANSACTION
                // =================================================

                Transaction transaction = new Transaction();

                transaction.setSenderAccountNumber(
                                account.getAccountNumber());

                /*
                 * Auto-Pay me actual receiver bank account nahi hai.
                 * Biller reference ko receiver reference ke roop me
                 * store kar rahe hain.
                 */
                transaction.setReceiverAccountNumber(
                                autoPay.getBillerReference());

                transaction.setAmount(
                                amount);

                transaction.setTransactionType(
                                "AUTOPAY");

                transaction.setStatus(
        "SUCCESS");

// =================================================
// SAVE AUTO-PAY TRANSACTION
// =================================================

Transaction savedTransaction =
        transactionRepository.save(transaction);

// =================================================
// AUTO-PAY DEBIT ALERT
// =================================================

NotificationRequest debitNotification =
        new NotificationRequest();

if (customer == null) {
        throw new RuntimeException(
                "Auto-Pay customer not found");
}

debitNotification.setCustomerId(
        customer.getId());

debitNotification.setNotificationType(
        "DEBIT_ALERT");

debitNotification.setChannel(
        "IN_APP");

debitNotification.setTitle(
        "Auto-Pay Payment Debited");

debitNotification.setMessage(
        "₹" + amount
                + " has been debited from your account for Auto-Pay.");



notificationService.createNotification(
        debitNotification);

return savedTransaction;
        }

        // =====================================================
        // EXECUTE SCHEDULED PAYMENT
        // =====================================================

        @Transactional
        public Transaction executeScheduledPayment(
                        ScheduledPayment scheduledPayment) {

                if (scheduledPayment == null) {

                        throw new RuntimeException(
                                        "Scheduled Payment cannot be empty");
                }

                // =================================================
                // GET SENDER ACCOUNT
                // =================================================

                Account senderAccount = scheduledPayment.getAccount();

                if (senderAccount == null) {

                        throw new RuntimeException(
                                        "Scheduled Payment account not found");
                }

                // =================================================
                // SENDER ACCOUNT STATUS
                // =================================================

                if (!"ACTIVE".equalsIgnoreCase(
                                senderAccount.getStatus())) {

                        throw new RuntimeException(
                                        "Scheduled Payment account is not active");
                }

                // =================================================
                // AMOUNT VALIDATION
                // =================================================

                Double amount = scheduledPayment.getAmount();

                if (amount == null || amount <= 0) {

                        throw new RuntimeException(
                                        "Invalid Scheduled Payment amount");
                }

                // =================================================
                // BALANCE CHECK
                // =================================================

                if (senderAccount.getBalance() == null) {

                        throw new RuntimeException(
                                        "Sender account balance is unavailable");
                }

                if (senderAccount.getBalance() < amount) {

                        throw new RuntimeException(
                                        "Insufficient balance for Scheduled Payment");
                }

                // =================================================
                // RECEIVER DETAILS
                // =================================================

                if (scheduledPayment.getReceiverAccountNumber() == null
                                || scheduledPayment
                                                .getReceiverAccountNumber()
                                                .trim()
                                                .isEmpty()) {

                        throw new RuntimeException(
                                        "Receiver account number is required");
                }

                if (scheduledPayment.getReceiverIfscCode() == null
                                || scheduledPayment
                                                .getReceiverIfscCode()
                                                .trim()
                                                .isEmpty()) {

                        throw new RuntimeException(
                                        "Receiver IFSC code is required");
                }

                String receiverAccountNumber = scheduledPayment
                                .getReceiverAccountNumber()
                                .trim();

                String receiverIfscCode = scheduledPayment
                                .getReceiverIfscCode()
                                .trim()
                                .toUpperCase();

                // =================================================
                // FIND RECEIVER ACCOUNT
                // =================================================

                Account receiverAccount = findReceiverAccount(
                                receiverAccountNumber,
                                receiverIfscCode);

                // =================================================
                // PREVENT SELF TRANSFER
                // =================================================

                preventSelfTransfer(
                                senderAccount,
                                receiverAccount);

                // =================================================
                // GET CUSTOMERS
                // =================================================

                Customer sender = scheduledPayment.getCustomer();

                if (sender == null) {

                        throw new RuntimeException(
                                        "Scheduled Payment customer not found");
                }

                Customer receiver = receiverAccount.getCustomer();

                // =================================================
                // PROCESS TRANSFER
                // =================================================

                processTransfer(
                                sender,
                                receiver,
                                senderAccount,
                                receiverAccount,
                                amount);

                // =================================================
                // CREATE TRANSACTION
                // =================================================

                return createTransaction(
                                senderAccount,
                                receiverAccount,
                                amount,
                                "SCHEDULED_PAYMENT");
        }

        // =====================================================
        // GET TRANSACTION RECEIPT
        // =====================================================

        public Transaction getTransactionReceipt(
                        String customerEmail,
                        Long transactionId) {

                // =================================================
                // FIND CUSTOMER
                // =================================================

                Customer customer = customerRepository
                                .findByEmail(customerEmail)
                                .orElseThrow(() -> new RuntimeException(
                                                "Customer account not found"));

                // =================================================
                // FIND TRANSACTION
                // =================================================

                Transaction transaction = transactionRepository
                                .findById(transactionId)
                                .orElseThrow(() -> new RuntimeException(
                                                "Transaction not found"));

                // =================================================
                // CHECK OWNERSHIP
                // =================================================

                String customerAccountNumber = customer.getAccountNumber();

                boolean isSender = customerAccountNumber != null
                                && customerAccountNumber.equals(
                                                transaction.getSenderAccountNumber());

                boolean isReceiver = customerAccountNumber != null
                                && customerAccountNumber.equals(
                                                transaction.getReceiverAccountNumber());

                if (!isSender && !isReceiver) {

                        throw new RuntimeException(
                                        "You are not authorized to view this transaction receipt");
                }

                return transaction;
        }

        // =====================================================
        // FRAUD ANALYSIS - TRANSACTION RISK CHECK
        // =====================================================

        private FraudAlert analyzeTransactionFraud(
                        String customerEmail,
                        Account senderAccount,
                        Double amount,
                        String transactionType) {

                // =================================================
                // COUNT RECENT TRANSACTIONS
                // =================================================

                java.time.LocalDateTime recentSince = java.time.LocalDateTime.now()
                                .minusMinutes(30);

                long recentTransactionCount = transactionRepository
                                .countBySenderAccountNumberAndTransactionDateAfter(
                                                senderAccount.getAccountNumber(),
                                                recentSince);

                Double recentOutgoingAmount = transactionRepository
                                .sumOutgoingAmountAfter(
                                                senderAccount.getAccountNumber(),
                                                recentSince);

                // =================================================
                // AML - RECENT OUTGOING AMOUNT CHECK
                // =================================================

                if (recentOutgoingAmount == null) {
                        recentOutgoingAmount = 0.0;
                }

                boolean moneyLaunderingIndicators = recentTransactionCount >= 3
                                && recentOutgoingAmount >= 25000.0;

                System.out.println("========== AML CHECK ==========");
                System.out.println("Recent Outgoing Amount: "
                                + recentOutgoingAmount);
                System.out.println("Recent Transaction Count: "
                                + recentTransactionCount);
                System.out.println("Money Laundering Indicator: "
                                + moneyLaunderingIndicators);
                System.out.println("================================");

                System.out.println("========== FRAUD VELOCITY CHECK ==========");
                System.out.println("Sender Account: "
                                + senderAccount.getAccountNumber());
                System.out.println("Recent Since: " + recentSince);
                System.out.println("Recent Transaction Count: "
                                + recentTransactionCount);
                System.out.println("Transaction Amount: " + amount);
                System.out.println("Transaction Type: " + transactionType);
                System.out.println("==========================================");

                // =================================================
                // FRAUD ANALYSIS
                // =================================================

                return fraudAlertService.analyzeAndCreateAlert(
                                customerEmail,
                                senderAccount.getId(),
                                new java.math.BigDecimal(
                                                String.valueOf(amount)),
                                transactionType,
                                (int) recentTransactionCount,
                                false, // unusual location
                                false, // unusual device
                                false, // account takeover
                                moneyLaunderingIndicators, // money laundering
                                null, // transaction id - not available yet
                                null // location - not available yet
                );
        }

}