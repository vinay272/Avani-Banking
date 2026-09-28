package com.avanibank.backend.repository;

import com.avanibank.backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

        // Sent transactions
        List<Transaction> findBySenderAccountNumberOrderByTransactionDateDesc(
                        String senderAccountNumber);

        // Received transactions
        List<Transaction> findByReceiverAccountNumberOrderByTransactionDateDesc(
                        String receiverAccountNumber);

        // All transactions of an account
        List<Transaction> findBySenderAccountNumberOrReceiverAccountNumberOrderByTransactionDateDesc(
                        String senderAccountNumber,
                        String receiverAccountNumber);

        // =====================================================
        // RECENT TRANSACTION COUNT - FRAUD VELOCITY CHECK
        // =====================================================

        long countBySenderAccountNumberAndTransactionDateAfter(
                        String senderAccountNumber,
                        java.time.LocalDateTime transactionDate);

        // =====================================================
        // RECENT OUTGOING AMOUNT - AML CHECK
        // =====================================================

        @Query("""
                            SELECT COALESCE(SUM(t.amount), 0)
                            FROM Transaction t
                            WHERE t.senderAccountNumber = :senderAccountNumber
                              AND t.transactionDate > :transactionDate
                        """)
        Double sumOutgoingAmountAfter(
                        @Param("senderAccountNumber") String senderAccountNumber,
                        @Param("transactionDate") java.time.LocalDateTime transactionDate);
}
