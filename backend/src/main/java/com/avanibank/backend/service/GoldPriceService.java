package com.avanibank.backend.service;

import com.avanibank.backend.dto.GoldPriceResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class GoldPriceService {

    // =====================================================
    // GOLD PRICE CATALOGUE
    // =====================================================

    public List<GoldPriceResponse> getGoldPrices() {

        List<GoldPriceResponse> prices =
                new ArrayList<>();

        // =================================================
        // 24K DIGITAL GOLD
        // =================================================

        prices.add(
                new GoldPriceResponse(
                        "DIGITAL_GOLD",
                        "24K",
                        new BigDecimal("7500.00"),
                        new BigDecimal("100.00")
                )
        );

        // =================================================
        // 22K DIGITAL GOLD
        // =================================================

        prices.add(
                new GoldPriceResponse(
                        "DIGITAL_GOLD",
                        "22K",
                        new BigDecimal("6875.00"),
                        new BigDecimal("100.00")
                )
        );

        return prices;
    }

    // =====================================================
    // GET PRICE BY PURITY
    // =====================================================

    public GoldPriceResponse getPriceByPurity(
            String purity) {

        if (purity == null
                || purity.trim().isEmpty()) {

            throw new RuntimeException(
                    "Gold purity is required"
            );
        }

        return getGoldPrices()
                .stream()
                .filter(price ->
                        price.getPurity()
                                .equalsIgnoreCase(
                                        purity.trim()
                                ))
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException(
                                "Gold price not found for purity: "
                                        + purity
                        )
                );
    }
}