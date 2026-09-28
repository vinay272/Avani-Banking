package com.avanibank.backend.controller;

import com.avanibank.backend.entity.Dividend;
import com.avanibank.backend.entity.DividendSummary;
import com.avanibank.backend.service.DividendService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/dividends")
@CrossOrigin(origins = "http://localhost:5173")
public class DividendController {

    private final DividendService dividendService;

    public DividendController(
            DividendService dividendService) {

        this.dividendService = dividendService;
    }

    // =====================================================
    // RECORD DIVIDEND
    // =====================================================

    @PostMapping
    public ResponseEntity<Dividend> recordDividend(
            Authentication authentication,
            @RequestParam Long accountId,
            @RequestParam String investmentType,
            @RequestParam String investmentName,
            @RequestParam BigDecimal dividendAmount,
            @RequestParam(required = false) BigDecimal units,
            @RequestParam(required = false) BigDecimal dividendPerUnit,
            @RequestParam(required = false) String dividendDate) {

        String customerEmail =
                authentication.getName();

        LocalDate date;

        if (dividendDate == null
                || dividendDate.trim().isEmpty()) {

            date = LocalDate.now();

        } else {

            date = LocalDate.parse(
                    dividendDate
            );
        }

        Dividend dividend =
                dividendService.recordDividend(
                        customerEmail,
                        accountId,
                        investmentType,
                        investmentName,
                        dividendAmount,
                        units,
                        dividendPerUnit,
                        date
                );

        return ResponseEntity.ok(dividend);
    }

    // =====================================================
    // GET ALL MY DIVIDENDS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Dividend>> getMyDividends(
            Authentication authentication) {

        String customerEmail =
                authentication.getName();

        return ResponseEntity.ok(
                dividendService.getMyDividends(
                        customerEmail
                )
        );
    }

    // =====================================================
    // GET RECEIVED DIVIDENDS
    // =====================================================

    @GetMapping("/received")
    public ResponseEntity<List<Dividend>> getReceivedDividends(
            Authentication authentication) {

        String customerEmail =
                authentication.getName();

        return ResponseEntity.ok(
                dividendService.getReceivedDividends(
                        customerEmail
                )
        );
    }

    // =====================================================
    // GET DIVIDENDS BY INVESTMENT TYPE
    // =====================================================

    @GetMapping("/type/{investmentType}")
    public ResponseEntity<List<Dividend>> getByInvestmentType(
            Authentication authentication,
            @PathVariable String investmentType) {

        String customerEmail =
                authentication.getName();

        return ResponseEntity.ok(
                dividendService.getDividendsByInvestmentType(
                        customerEmail,
                        investmentType
                )
        );
    }

    // =====================================================
    // TOTAL DIVIDEND RECEIVED
    // =====================================================

    @GetMapping("/total")
    public ResponseEntity<BigDecimal> getTotalDividend(
            Authentication authentication) {

        String customerEmail =
                authentication.getName();

        return ResponseEntity.ok(
                dividendService.getTotalDividendReceived(
                        customerEmail
                )
        );
    }

    @GetMapping("/summary")
public ResponseEntity<DividendSummary> getDividendSummary(
        Authentication authentication) {

    String customerEmail =
            authentication.getName();

    return ResponseEntity.ok(
            dividendService.getDividendSummary(
                    customerEmail
            )
    );
}

}