package com.avanibank.backend.controller;

import com.avanibank.backend.dto.KycVerificationRequest;
import com.avanibank.backend.entity.KycDocument;
import com.avanibank.backend.service.KycDocumentService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/kyc")
@CrossOrigin(origins = "*")
public class KycDocumentController {

    private final KycDocumentService kycDocumentService;

    public KycDocumentController(
            KycDocumentService kycDocumentService) {

        this.kycDocumentService = kycDocumentService;
    }

    // =========================
    // UPLOAD KYC DOCUMENT
    // =========================

    @PostMapping(
            value = "/upload/{customerId}",
            consumes = "multipart/form-data"
    )
    public ResponseEntity<KycDocument> uploadKycDocument(

            @PathVariable Long customerId,

            @RequestParam String documentType,

            @RequestParam String documentNumber,

            @RequestParam("file") MultipartFile file) {

        return ResponseEntity.ok(
                kycDocumentService.uploadKycDocument(
                        customerId,
                        documentType,
                        documentNumber,
                        file
                )
        );
    }

    // =========================
    // GET CUSTOMER KYC
    // =========================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<KycDocument>>
    getCustomerDocuments(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                kycDocumentService.getCustomerDocuments(
                        customerId
                )
        );
    }

    // =========================
    // VERIFY KYC DOCUMENT
    // =========================

    @PutMapping("/verify/{documentId}")
    public ResponseEntity<KycDocument> verifyDocument(

            @PathVariable Long documentId,

            @RequestBody KycVerificationRequest request) {

        System.out.println(
                "VERIFY API CALLED - Document ID: "
                        + documentId
        );

        return ResponseEntity.ok(
                kycDocumentService.verifyDocument(
                        documentId,
                        request.getStatus(),
                        request.getRemarks()
                )
        );
    }
}