package com.avanibank.backend.service;

import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.KycDocument;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.KycDocumentRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class KycDocumentService {

    private final KycDocumentRepository kycDocumentRepository;
    private final CustomerRepository customerRepository;

    // =========================
    // KYC UPLOAD DIRECTORY
    // =========================

    private static final String UPLOAD_DIR = "uploads/kyc";

    // Maximum file size = 5 MB
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    public KycDocumentService(
            KycDocumentRepository kycDocumentRepository,
            CustomerRepository customerRepository) {

        this.kycDocumentRepository = kycDocumentRepository;
        this.customerRepository = customerRepository;
    }

    // =========================
    // UPLOAD KYC DOCUMENT
    // =========================

    public KycDocument uploadKycDocument(
            Long customerId,
            String documentType,
            String documentNumber,
            MultipartFile file) {

        // =========================
        // CUSTOMER CHECK
        // =========================

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found"));

        // =========================
        // REQUIRED VALIDATION
        // =========================

        if (documentType == null || documentType.isBlank()) {
            throw new RuntimeException(
                    "Document type is required");
        }

        if (documentNumber == null || documentNumber.isBlank()) {
            throw new RuntimeException(
                    "Document number is required");
        }

        if (file == null || file.isEmpty()) {
            throw new RuntimeException(
                    "KYC document file is required");
        }

        // =========================
        // NORMALIZE INPUT
        // =========================

        String type = documentType.trim().toUpperCase();
        String number = documentNumber.trim().toUpperCase();

        // =========================
        // DOCUMENT TYPE VALIDATION
        // =========================

        if (!type.equals("AADHAAR")
                && !type.equals("PAN")
                && !type.equals("PASSPORT")) {

            throw new RuntimeException(
                    "Document type must be AADHAAR, PAN or PASSPORT");
        }

        // =========================
        // DOCUMENT NUMBER VALIDATION
        // =========================

        if (type.equals("AADHAAR")) {

            if (!number.matches("\\d{12}")) {
                throw new RuntimeException(
                        "Aadhaar number must contain exactly 12 digits");
            }
        }

        if (type.equals("PAN")) {

            if (!number.matches("[A-Z]{5}[0-9]{4}[A-Z]")) {
                throw new RuntimeException(
                        "Invalid PAN number format");
            }
        }

        if (type.equals("PASSPORT")) {

            if (!number.matches("[A-Z][0-9]{7}")) {
                throw new RuntimeException(
                        "Invalid Passport number format");
            }
        }

        // =========================
        // SAME CUSTOMER DUPLICATE
        // =========================

        if (kycDocumentRepository
                .existsByCustomerAndDocumentType(
                        customer,
                        type)) {

            throw new RuntimeException(
                    "This document type is already registered for this customer");
        }

        // =========================
        // GLOBAL DUPLICATE KYC
        // =========================

        if (kycDocumentRepository
                .existsByDocumentTypeAndDocumentNumber(
                        type,
                        number)) {

            throw new RuntimeException(
                    "This KYC document number is already registered");
        }

        // =========================
        // FILE SIZE VALIDATION
        // =========================

        if (file.getSize() > MAX_FILE_SIZE) {

            throw new RuntimeException(
                    "File size must not exceed 5 MB");
        }

        // =========================
        // FILE NAME CHECK
        // =========================

        String originalFileName =
                file.getOriginalFilename();

        if (originalFileName == null
                || originalFileName.isBlank()) {

            throw new RuntimeException(
                    "Invalid file name");
        }

        // =========================
        // FILE EXTENSION CHECK
        // =========================

        String fileName =
                originalFileName.toLowerCase();

        boolean validExtension =
                fileName.endsWith(".pdf")
                        || fileName.endsWith(".jpg")
                        || fileName.endsWith(".jpeg")
                        || fileName.endsWith(".png");

        if (!validExtension) {

            throw new RuntimeException(
                    "Only PDF, JPG, JPEG and PNG files are allowed");
        }

        // =========================
        // CREATE UPLOAD DIRECTORY
        // =========================

        Path uploadPath =
                Paths.get(UPLOAD_DIR);

        try {

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // =========================
            // GET FILE EXTENSION
            // =========================

            String extension = "";

            int dotIndex =
                    originalFileName.lastIndexOf(".");

            if (dotIndex >= 0) {

                extension =
                        originalFileName
                                .substring(dotIndex)
                                .toLowerCase();
            }

            // =========================
            // UNIQUE FILE NAME
            // =========================

            String savedFileName =
                    type.toLowerCase()
                            + "_"
                            + customerId
                            + "_"
                            + UUID.randomUUID()
                            + extension;

            Path targetPath =
                    uploadPath.resolve(savedFileName);

            // =========================
            // SAVE FILE
            // =========================

            Files.copy(
                    file.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            // =========================
            // CREATE DATABASE RECORD
            // =========================

            KycDocument document =
                    new KycDocument();

            document.setCustomer(customer);

            document.setDocumentType(type);

            document.setDocumentNumber(number);

            document.setDocumentFileName(
                    originalFileName);

            document.setDocumentFilePath(
                    targetPath.toString());

            document.setVerificationStatus(
                    "PENDING");

            document.setVerificationRemarks(
                    null);

            document.setUploadedAt(
                    LocalDateTime.now());

            document.setVerifiedAt(
                    null);

            return kycDocumentRepository.save(
                    document);

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to save KYC document file",
                    e);
        }
    }

    // =========================
    // GET CUSTOMER KYC DOCUMENTS
    // =========================

    public List<KycDocument> getCustomerDocuments(
            Long customerId) {

        Customer customer =
                customerRepository.findById(customerId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Customer not found"));

        return kycDocumentRepository
                .findByCustomer(customer);
    }

    // =========================
    // VERIFY KYC DOCUMENT
    // =========================

    public KycDocument verifyDocument(
            Long documentId,
            String status,
            String remarks) {

        KycDocument document =
                kycDocumentRepository.findById(documentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "KYC document not found"));

        // =========================
        // STATUS VALIDATION
        // =========================

        if (status == null || status.isBlank()) {

            throw new RuntimeException(
                    "Verification status is required");
        }

        if (!status.equalsIgnoreCase("VERIFIED")
                && !status.equalsIgnoreCase("REJECTED")) {

            throw new RuntimeException(
                    "Status must be VERIFIED or REJECTED");
        }

        // =========================
        // UPDATE DOCUMENT
        // =========================

        document.setVerificationStatus(
                status.trim().toUpperCase());

        document.setVerificationRemarks(
                remarks);

        document.setVerifiedAt(
                LocalDateTime.now());

        KycDocument savedDocument =
                kycDocumentRepository.save(document);

        // =========================
        // UPDATE CUSTOMER KYC STATUS
        // =========================

        updateCustomerKycStatus(
                document.getCustomer());

        return savedDocument;
    }

    // =========================
    // UPDATE CUSTOMER KYC STATUS
    // =========================

    private void updateCustomerKycStatus(
            Customer customer) {

        List<KycDocument> documents =
                kycDocumentRepository
                        .findByCustomer(customer);

        // No documents
        if (documents.isEmpty()) {

            customer.setKycStatus("PENDING");

            customerRepository.save(customer);

            return;
        }

        // Any rejected document
        boolean anyRejected =
                documents.stream()
                        .anyMatch(document ->
                                "REJECTED".equalsIgnoreCase(
                                        document.getVerificationStatus()
                                )
                        );

        // All documents verified
        boolean allVerified =
                documents.stream()
                        .allMatch(document ->
                                "VERIFIED".equalsIgnoreCase(
                                        document.getVerificationStatus()
                                )
                        );

        if (anyRejected) {

            customer.setKycStatus("REJECTED");

        } else if (allVerified) {

            customer.setKycStatus("VERIFIED");

        } else {

            customer.setKycStatus("PENDING");
        }

        customerRepository.save(customer);
    }
}