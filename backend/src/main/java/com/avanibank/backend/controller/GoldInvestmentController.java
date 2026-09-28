package com.avanibank.backend.controller;

import com.avanibank.backend.entity.GoldInvestment;
import com.avanibank.backend.service.GoldInvestmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/gold-investments")
@CrossOrigin(origins = "http://localhost:5173")
public class GoldInvestmentController {

    private final GoldInvestmentService goldInvestmentService;

    public GoldInvestmentController(
            GoldInvestmentService goldInvestmentService) {

        this.goldInvestmentService = goldInvestmentService;
    }

    // =====================================================
    // PURCHASE GOLD
    // =====================================================

    @PostMapping
    public ResponseEntity<GoldInvestment> purchaseGold(
            Authentication authentication,
            @RequestParam Long accountId,
            @RequestParam String goldType,
            @RequestParam String purity,
            @RequestParam BigDecimal investmentAmount) {

        String customerEmail =
                authentication.getName();

        GoldInvestment investment =
                goldInvestmentService.purchaseGold(
                        customerEmail,
                        accountId,
                        goldType,
                        purity,
                        investmentAmount
                );

        return ResponseEntity.ok(investment);
    }

    // =====================================================
    // GET ALL GOLD INVESTMENTS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<GoldInvestment>>
    getCustomerGoldInvestments(
            Authentication authentication) {

        String customerEmail =
                authentication.getName();

        return ResponseEntity.ok(
                goldInvestmentService
                        .getCustomerGoldInvestments(
                                customerEmail
                        )
        );
    }

    // =====================================================
    // GET ACTIVE GOLD INVESTMENTS
    // =====================================================

    @GetMapping("/active")
    public ResponseEntity<List<GoldInvestment>>
    getActiveGoldInvestments(
            Authentication authentication) {

        String customerEmail =
                authentication.getName();

        return ResponseEntity.ok(
                goldInvestmentService
                        .getActiveGoldInvestments(
                                customerEmail
                        )
        );
    }

    // =====================================================
    // GET GOLD INVESTMENT BY ID
    // =====================================================

    @GetMapping("/{investmentId}")
    public ResponseEntity<GoldInvestment>
    getGoldInvestmentById(
            Authentication authentication,
            @PathVariable Long investmentId) {

        String customerEmail =
                authentication.getName();

        return ResponseEntity.ok(
                goldInvestmentService
                        .getGoldInvestmentById(
                                investmentId,
                                customerEmail
                        )
        );
    }

    // =====================================================
// SELL / REDEEM GOLD
// =====================================================

@PutMapping("/{investmentId}/sell")
public ResponseEntity<GoldInvestment> sellGold(
        Authentication authentication,
        @PathVariable Long investmentId) {

    String customerEmail =
            authentication.getName();

    GoldInvestment soldInvestment =
            goldInvestmentService.sellGold(
                    investmentId,
                    customerEmail
            );

    return ResponseEntity.ok(soldInvestment);
}

}