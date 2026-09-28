package com.avanibank.backend.service;

import com.avanibank.backend.dto.BondPlanResponse;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class BondPlanService {

    public List<BondPlanResponse> getBondPlans() {

        return List.of(

                new BondPlanResponse(
                        "BOND_GOV_5Y",
                        "Government Bond 7.10%",
                        "GOVERNMENT",
                        new BigDecimal("1000.00"),
                        new BigDecimal("7.100"),
                        60,
                        new BigDecimal("1000.00"),
                        "ANNUAL",
                        "Government backed bond with stable annual coupon returns."
                ),

                new BondPlanResponse(
                        "BOND_CORP_3Y",
                        "Corporate Bond 8.25%",
                        "CORPORATE",
                        new BigDecimal("1000.00"),
                        new BigDecimal("8.250"),
                        36,
                        new BigDecimal("5000.00"),
                        "QUARTERLY",
                        "Corporate bond offering higher coupon potential over a 3-year tenure."
                ),

                new BondPlanResponse(
                        "BOND_TAXFREE_10Y",
                        "Tax-Free Bond 7.50%",
                        "TAX_FREE",
                        new BigDecimal("1000.00"),
                        new BigDecimal("7.500"),
                        120,
                        new BigDecimal("10000.00"),
                        "ANNUAL",
                        "Long-term tax-free style bond investment for eligible investors."
                ),

                new BondPlanResponse(
                        "BOND_BANK_7Y",
                        "Bank Bond 7.75%",
                        "BANK",
                        new BigDecimal("1000.00"),
                        new BigDecimal("7.750"),
                        84,
                        new BigDecimal("5000.00"),
                        "HALF_YEARLY",
                        "Bank-issued bond with fixed coupon income."
                ),

                new BondPlanResponse(
                        "BOND_PSU_5Y",
                        "PSU Bond 8.00%",
                        "PSU",
                        new BigDecimal("1000.00"),
                        new BigDecimal("8.000"),
                        60,
                        new BigDecimal("5000.00"),
                        "HALF_YEARLY",
                        "Public sector undertaking bond designed for medium-term investment."
                )
        );
    }
}
