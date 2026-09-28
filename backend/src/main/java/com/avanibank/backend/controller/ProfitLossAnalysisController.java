package com.avanibank.backend.controller;

import com.avanibank.backend.entity.ProfitLossAnalysis;
import com.avanibank.backend.service.ProfitLossAnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profit-loss")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfitLossAnalysisController {

    private final ProfitLossAnalysisService profitLossAnalysisService;

    public ProfitLossAnalysisController(
            ProfitLossAnalysisService profitLossAnalysisService) {
        this.profitLossAnalysisService = profitLossAnalysisService;
    }

    @GetMapping
    public ResponseEntity<ProfitLossAnalysis> getProfitLossAnalysis(
            Authentication authentication) {

        String customerEmail = authentication.getName();

        return ResponseEntity.ok(
                profitLossAnalysisService.analyzePortfolio(customerEmail)
        );
    }
}