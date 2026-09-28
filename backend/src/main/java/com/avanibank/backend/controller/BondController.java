package com.avanibank.backend.controller;

import com.avanibank.backend.entity.Bond;
import com.avanibank.backend.service.BondService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/bonds")
@CrossOrigin(origins = "http://localhost:5173")
public class BondController {

    private final BondService bondService;

    public BondController(BondService bondService) {
        this.bondService = bondService;
    }

    // =====================================================
    // PURCHASE BOND
    // =====================================================

    @PostMapping
    public ResponseEntity<Bond> purchaseBond(
            Authentication authentication,
            @RequestParam Long accountId,
            @RequestParam String bondName,
            @RequestParam String bondType,
            @RequestParam BigDecimal faceValue,
            @RequestParam BigDecimal investmentAmount,
            @RequestParam BigDecimal couponRate,
            @RequestParam Integer tenureMonths) {

        String customerEmail =
                authentication.getName();

        Bond bond =
                bondService.purchaseBond(
                        customerEmail,
                        accountId,
                        bondName,
                        bondType,
                        faceValue,
                        investmentAmount,
                        couponRate,
                        tenureMonths
                );

        return ResponseEntity.ok(bond);
    }

    // =====================================================
    // GET ALL CUSTOMER BONDS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Bond>> getCustomerBonds(
            Authentication authentication) {

        String customerEmail =
                authentication.getName();

        return ResponseEntity.ok(
                bondService.getCustomerBonds(
                        customerEmail
                )
        );
    }

    // =====================================================
    // GET ACTIVE BONDS
    // =====================================================

    @GetMapping("/active")
    public ResponseEntity<List<Bond>> getActiveBonds(
            Authentication authentication) {

        String customerEmail =
                authentication.getName();

        return ResponseEntity.ok(
                bondService.getActiveBonds(
                        customerEmail
                )
        );
    }

    // =====================================================
    // GET BOND BY ID
    // =====================================================

    @GetMapping("/{bondId}")
    public ResponseEntity<Bond> getBondById(
            Authentication authentication,
            @PathVariable Long bondId) {

        String customerEmail =
                authentication.getName();

        return ResponseEntity.ok(
                bondService.getBondById(
                        bondId,
                        customerEmail
                )
        );
    }

        // =====================================================
    // PREMATURE SELL BOND
    // =====================================================

    @PutMapping("/{bondId}/sell")
    public ResponseEntity<Bond> sellBond(
            Authentication authentication,
            @PathVariable Long bondId) {

        String customerEmail =
                authentication.getName();

        Bond soldBond =
                bondService.sellBond(
                        bondId,
                        customerEmail
                );

        return ResponseEntity.ok(
                soldBond
        );
    }

    // =====================================================
    // CALCULATE EXPECTED INTEREST
    // =====================================================

    @GetMapping("/calculate-interest")
    public ResponseEntity<BigDecimal> calculateExpectedInterest(
            @RequestParam BigDecimal investmentAmount,
            @RequestParam BigDecimal couponRate,
            @RequestParam Integer tenureMonths) {

        return ResponseEntity.ok(
                bondService.calculateExpectedInterest(
                        investmentAmount,
                        couponRate,
                        tenureMonths
                )
        );
    }
}
