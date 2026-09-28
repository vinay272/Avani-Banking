package com.avanibank.backend.service;

import com.avanibank.backend.entity.MutualFund;
import com.avanibank.backend.repository.MutualFundRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MutualFundService {

    private final MutualFundRepository mutualFundRepository;

    public MutualFundService(
            MutualFundRepository mutualFundRepository) {

        this.mutualFundRepository = mutualFundRepository;
    }

    // =========================
    // GET ACTIVE MUTUAL FUNDS
    // =========================

    public List<MutualFund> getActiveFunds() {

        return mutualFundRepository
                .findByStatusOrderByFundNameAsc("ACTIVE");
    }

    // =========================
    // GET FUND BY ID
    // =========================

    public MutualFund getFundById(Long fundId) {

        return mutualFundRepository
                .findByIdAndStatus(
                        fundId,
                        "ACTIVE")
                .orElseThrow(() -> new RuntimeException(
                        "Mutual fund not found or inactive"));
    }

    // =========================
    // CREATE MUTUAL FUND
    // =========================

    @Transactional
    public MutualFund createFund(
            String fundName,
            String fundCategory,
            String riskLevel,
            Double expectedReturnRate,
            Double minimumInvestment,
            Double exitLoad) {

        // =========================
        // FUND NAME VALIDATION
        // =========================

        if (fundName == null ||
                fundName.trim().isEmpty()) {

            throw new RuntimeException(
                    "Fund name is required");
        }

        if (mutualFundRepository
                .existsByFundNameIgnoreCase(
                        fundName.trim())) {

            throw new RuntimeException(
                    "Mutual fund with this name already exists");
        }

        // =========================
        // CATEGORY VALIDATION
        // =========================

        if (fundCategory == null ||
                fundCategory.trim().isEmpty()) {

            throw new RuntimeException(
                    "Fund category is required");
        }

        String category = fundCategory.trim().toUpperCase();

        if (!List.of(
                "EQUITY",
                "DEBT",
                "HYBRID",
                "INDEX",
                "ELSS").contains(category)) {

            throw new RuntimeException(
                    "Invalid mutual fund category");
        }

        // =========================
        // RISK VALIDATION
        // =========================

        if (riskLevel == null ||
                riskLevel.trim().isEmpty()) {

            throw new RuntimeException(
                    "Risk level is required");
        }

        String risk = riskLevel.trim().toUpperCase();

        if (!List.of(
                "LOW",
                "MODERATE",
                "HIGH").contains(risk)) {

            throw new RuntimeException(
                    "Invalid risk level");
        }

        // =========================
        // RETURN RATE VALIDATION
        // =========================

        if (expectedReturnRate == null ||
                expectedReturnRate < 0) {

            throw new RuntimeException(
                    "Expected return rate cannot be negative");
        }

        // =========================
        // MINIMUM INVESTMENT
        // =========================

        if (minimumInvestment == null ||
                minimumInvestment <= 0) {

            throw new RuntimeException(
                    "Minimum investment must be greater than zero");
        }

        // =========================
        // EXIT LOAD
        // =========================

        if (exitLoad != null &&
                (exitLoad < 0 || exitLoad > 100)) {

            throw new RuntimeException(
                    "Exit load must be between 0 and 100");
        }

        // =========================
        // CREATE FUND
        // =========================

        MutualFund mutualFund = new MutualFund();

        mutualFund.setFundName(
                fundName.trim());

        mutualFund.setFundCategory(
                category);

        mutualFund.setRiskLevel(
                risk);

        mutualFund.setExpectedReturnRate(
                expectedReturnRate);

        mutualFund.setMinimumInvestment(
                minimumInvestment);

        mutualFund.setExitLoad(
                exitLoad != null
                        ? exitLoad
                        : 0.0);

        mutualFund.setStatus(
                "ACTIVE");

        return mutualFundRepository.save(
                mutualFund);
    }

    // =========================
    // VALIDATE MUTUAL FUND
    // =========================

    public MutualFund validateFund(Long fundId) {

        return mutualFundRepository
                .findByIdAndStatus(
                        fundId,
                        "ACTIVE")
                .orElseThrow(() -> new RuntimeException(
                        "Mutual fund not found or inactive"));
    }

    // =========================
    // DEACTIVATE FUND
    // =========================

    @Transactional
    public MutualFund deactivateFund(
            Long fundId) {

        MutualFund mutualFund = mutualFundRepository
                .findById(fundId)
                .orElseThrow(() -> new RuntimeException(
                        "Mutual fund not found"));

        mutualFund.setStatus(
                "INACTIVE");

        return mutualFundRepository.save(
                mutualFund);
    }
}