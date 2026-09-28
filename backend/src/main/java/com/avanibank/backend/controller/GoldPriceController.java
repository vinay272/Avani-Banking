package com.avanibank.backend.controller;

import com.avanibank.backend.dto.GoldPriceResponse;
import com.avanibank.backend.service.GoldPriceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gold-prices")
@CrossOrigin(origins = "http://localhost:5173")
public class GoldPriceController {

    private final GoldPriceService goldPriceService;

    public GoldPriceController(
            GoldPriceService goldPriceService) {

        this.goldPriceService = goldPriceService;
    }

    // =====================================================
    // GET ALL GOLD PRICES
    // =====================================================

    @GetMapping
    public ResponseEntity<List<GoldPriceResponse>> getGoldPrices() {

        return ResponseEntity.ok(
                goldPriceService.getGoldPrices()
        );
    }

    // =====================================================
    // GET GOLD PRICE BY PURITY
    // =====================================================

    @GetMapping("/purity/{purity}")
    public ResponseEntity<GoldPriceResponse> getPriceByPurity(
            @PathVariable String purity) {

        return ResponseEntity.ok(
                goldPriceService.getPriceByPurity(purity)
        );
    }
}