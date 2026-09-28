package com.avanibank.backend.controller;

import com.avanibank.backend.dto.TransferRequest;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.service.CustomerService;
import com.avanibank.backend.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

        private final TransactionService transactionService;
        private final CustomerService customerService;

        public TransactionController(
                        TransactionService transactionService,
                        CustomerService customerService) {

                this.transactionService = transactionService;
                this.customerService = customerService;
        }

        // Transfer Money
        @PostMapping("/transfer")
        public ResponseEntity<Transaction> transferMoney(
                        @RequestBody TransferRequest request) {

                String email = SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getName();

                Transaction transaction = transactionService.transferMoney(email, request);

                return ResponseEntity.ok(transaction);
        }

        // Get My Sent Transactions
        @GetMapping("/sent")
        public ResponseEntity<List<Transaction>> getSentTransactions() {

                String email = SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getName();

                Customer customer = customerService.getCustomerByEmail(email);

                return ResponseEntity.ok(
                                transactionService.getSentTransactions(
                                                customer.getAccountNumber()));
        }

        // Get My Received Transactions
        @GetMapping("/received")
        public ResponseEntity<List<Transaction>> getReceivedTransactions() {

                String email = SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getName();

                Customer customer = customerService.getCustomerByEmail(email);

                return ResponseEntity.ok(
                                transactionService.getReceivedTransactions(
                                                customer.getAccountNumber()));
        }

        // =====================================================
// TRANSACTION RECEIPT
// =====================================================

@GetMapping("/{transactionId}/receipt")
public ResponseEntity<Transaction> getTransactionReceipt(
                @PathVariable Long transactionId) {

        String email = SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        Transaction transaction =
                        transactionService.getTransactionReceipt(
                                        email,
                                        transactionId
                        );

        return ResponseEntity.ok(transaction);
}

        // =====================================================
        // NEFT TRANSFER
        // =====================================================

        @PostMapping("/neft")
        public ResponseEntity<Transaction> neftTransfer(
                        @RequestBody TransferRequest request) {
                System.out.println("========== NEFT CONTROLLER ==========");
                System.out.println("NEFT REQUEST RECEIVER: "
                                + request.getReceiverAccountNumber());
                System.out.println("NEFT REQUEST AMOUNT: "
                                + request.getAmount());

                String email = SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getName();
                System.out.println("NEFT SENDER EMAIL: " + email);
                Transaction transaction = transactionService.neftTransfer(
                                email,
                                request);

                System.out.println("NEFT TRANSACTION SUCCESS");
                return ResponseEntity.ok(transaction);
        }

        // =====================================================
        // RTGS TRANSFER
        // =====================================================

        @PostMapping("/rtgs")
        public ResponseEntity<Transaction> rtgsTransfer(
                        @RequestBody TransferRequest request) {

                String email = SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getName();

                Transaction transaction = transactionService.rtgsTransfer(
                                email,
                                request);

                return ResponseEntity.ok(transaction);
        }

        // =====================================================
        // IMPS TRANSFER
        // =====================================================

        @PostMapping("/imps")
        public ResponseEntity<Transaction> impsTransfer(
                        @RequestBody TransferRequest request) {
                        System.out.println("========== IMPS CONTROLLER HIT ==========");        
                String email = SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                .getName();
                        System.out.println("IMPS EMAIL: " + email);

                Transaction transaction = transactionService.impsTransfer(
                                email,
                                request);

                return ResponseEntity.ok(transaction);
        }

}