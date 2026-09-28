package com.avanibank.backend.controller;

import com.avanibank.backend.service.StatementPdfService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/statements")
@CrossOrigin(origins = "*")
public class StatementController {

    private final StatementPdfService statementPdfService;

    public StatementController(
            StatementPdfService statementPdfService) {

        this.statementPdfService = statementPdfService;
    }

    // =========================
    // DOWNLOAD ACCOUNT STATEMENT
    // =========================

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> downloadStatement() {

        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        byte[] pdf =
                statementPdfService.generateStatement(email);

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=Avani-Bank-Statement.pdf"
                )
                .contentType(
                        MediaType.APPLICATION_PDF
                )
                .contentLength(pdf.length)
                .body(pdf);
    }
}