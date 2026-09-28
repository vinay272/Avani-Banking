package com.avanibank.backend.controller;

import com.avanibank.backend.entity.PortfolioSummary;
import com.avanibank.backend.service.PortfolioService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portfolio")
@CrossOrigin(origins = "http://localhost:5173")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping("/summary")
    public ResponseEntity<PortfolioSummary> getPortfolioSummary(
            Authentication authentication) {

        String customerEmail = authentication.getName();

        return ResponseEntity.ok(
                portfolioService.getPortfolioSummary(customerEmail)
        );
    }
}