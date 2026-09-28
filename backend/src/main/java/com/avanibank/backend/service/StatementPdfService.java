package com.avanibank.backend.service;

import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.Transaction;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.TransactionRepository;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;

import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.text.DecimalFormat;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class StatementPdfService {

    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;

    public StatementPdfService(
            CustomerRepository customerRepository,
            TransactionRepository transactionRepository) {

        this.customerRepository = customerRepository;
        this.transactionRepository = transactionRepository;
    }

    @SuppressWarnings("null")
    public byte[] generateStatement(String email) {

        Customer customer = customerRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer account not found"
                        )
                );

        String accountNumber = customer.getAccountNumber();

        List<Transaction> sentTransactions =
                transactionRepository
                        .findBySenderAccountNumberOrderByTransactionDateDesc(
                                accountNumber
                        );

        List<Transaction> receivedTransactions =
                transactionRepository
                        .findByReceiverAccountNumberOrderByTransactionDateDesc(
                                accountNumber
                        );

        List<TransactionData> transactions = new ArrayList<>();

        for (Transaction transaction : sentTransactions) {

            transactions.add(
                    new TransactionData(
                            transaction,
                            "DEBIT"
                    )
            );
        }

        for (Transaction transaction : receivedTransactions) {

            transactions.add(
                    new TransactionData(
                            transaction,
                            "CREDIT"
                    )
            );
        }

        transactions.sort(
                Comparator.comparing(
                        TransactionData::getDate,
                        Comparator.nullsLast(
                                Comparator.reverseOrder()
                        )
                )
        );

        return createPdf(
                customer,
                transactions
        );
    }

    private byte[] createPdf(
            Customer customer,
            List<TransactionData> transactions) {

        try {

            ByteArrayOutputStream outputStream =
                    new ByteArrayOutputStream();

            Document document = new Document();

            PdfWriter.getInstance(
                    document,
                    outputStream
            );

            document.open();

            // =========================
            // HEADER
            // =========================

            Paragraph bankName =
                    new Paragraph("AVANI BANK");

            bankName.setSpacingAfter(5);

            document.add(bankName);

            Paragraph title =
                    new Paragraph("ACCOUNT STATEMENT");

            title.setSpacingAfter(15);

            document.add(title);

            // =========================
            // CUSTOMER DETAILS
            // =========================

            document.add(
                    new Paragraph(
                            "Customer Name: "
                                    + getCustomerName(customer)
                    )
            );

            document.add(
                    new Paragraph(
                            "Account Number: "
                                    + customer.getAccountNumber()
                    )
            );

            document.add(
                    new Paragraph(
                            "Current Balance: "
                                    + formatAmount(
                                            customer.getBalance()
                                    )
                    )
            );

            document.add(
                    new Paragraph(
                            " "
                    )
            );

            // =========================
            // SUMMARY
            // =========================

            double totalDebit = 0;
            double totalCredit = 0;

            for (TransactionData data : transactions) {

                if ("DEBIT".equals(data.getDirection())) {

                    totalDebit +=
                            data.getTransaction()
                                    .getAmount();

                } else {

                    totalCredit +=
                            data.getTransaction()
                                    .getAmount();
                }
            }

            document.add(
                    new Paragraph(
                            "Total Transactions: "
                                    + transactions.size()
                    )
            );

            document.add(
                    new Paragraph(
                            "Total Debit: "
                                    + formatAmount(totalDebit)
                    )
            );

            document.add(
                    new Paragraph(
                            "Total Credit: "
                                    + formatAmount(totalCredit)
                    )
            );

            document.add(
                    new Paragraph(
                            " "
                    )
            );

            // =========================
            // TRANSACTION TABLE
            // =========================

            PdfPTable table =
                    new PdfPTable(6);

            table.setWidthPercentage(100);

            table.setWidths(
                    new float[]{
                            1.0f,
                            1.2f,
                            1.5f,
                            1.5f,
                            1.2f,
                            1.4f
                    }
            );

            addHeaderCell(
                    table,
                    "ID"
            );

            addHeaderCell(
                    table,
                    "TYPE"
            );

            addHeaderCell(
                    table,
                    "FROM"
            );

            addHeaderCell(
                    table,
                    "TO"
            );

            addHeaderCell(
                    table,
                    "AMOUNT"
            );

            addHeaderCell(
                    table,
                    "DATE"
            );

            DateTimeFormatter formatter =
                    DateTimeFormatter.ofPattern(
                            "dd-MM-yyyy HH:mm"
                    );

            DecimalFormat decimalFormat =
                    new DecimalFormat(
                            "₹#,##0.00"
                    );

            for (TransactionData data : transactions) {

                Transaction transaction =
                        data.getTransaction();

                table.addCell(
                        String.valueOf(
                                transaction.getId()
                        )
                );

                table.addCell(
                        data.getDirection()
                );

                table.addCell(
                        transaction
                                .getSenderAccountNumber()
                );

                table.addCell(
                        transaction
                                .getReceiverAccountNumber()
                );

                table.addCell(
                        (data.getDirection().equals("DEBIT")
                                ? "-"
                                : "+")
                                + decimalFormat.format(
                                transaction.getAmount()
                        )
                );

                String date = "";

                if (transaction.getTransactionDate()
                        != null) {

                    date =
                            transaction
                                    .getTransactionDate()
                                    .format(formatter);
                }

                table.addCell(date);
            }

            document.add(table);

            document.add(
                    new Paragraph(
                            " "
                    )
            );

            document.add(
                    new Paragraph(
                            "This statement is system generated by Avani Bank."
                    )
            );

            document.close();

            return outputStream.toByteArray();

        } catch (DocumentException e) {

            throw new RuntimeException(
                    "Unable to generate PDF statement",
                    e
            );
        }
    }

    private void addHeaderCell(
            PdfPTable table,
            String text) {

        PdfPCell cell =
                new PdfPCell(
                        new Phrase(text)
                );

        table.addCell(cell);
    }

    private String formatAmount(
            Double amount) {

        if (amount == null) {
            amount = 0.0;
        }

        return String.format(
                "₹%.2f",
                amount
        );
    }

    private String getCustomerName(
            Customer customer) {

       

        return "Customer";
    }

    // =========================
    // INTERNAL DATA CLASS
    // =========================

    private static class TransactionData {

        private final Transaction transaction;
        private final String direction;

        public TransactionData(
                Transaction transaction,
                String direction) {

            this.transaction = transaction;
            this.direction = direction;
        }

        public Transaction getTransaction() {
            return transaction;
        }

        public String getDirection() {
            return direction;
        }

        public java.time.LocalDateTime getDate() {

            return transaction
                    .getTransactionDate();
        }
    }
}