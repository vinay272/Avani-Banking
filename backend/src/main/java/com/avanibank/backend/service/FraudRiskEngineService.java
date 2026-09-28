package com.avanibank.backend.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Locale;

@Service
public class FraudRiskEngineService {

    /**
     * Calculates a risk score between 0 and 100.
     *
     * Higher score = higher fraud risk.
     */
    public RiskResult calculateTransactionRisk(
            BigDecimal amount,
            String transactionType,
            int recentTransactionCount,
            boolean unusualLocation,
            boolean unusualDevice,
            boolean accountTakeoverIndicators,
            boolean moneyLaunderingIndicators
    ) {

        BigDecimal safeAmount =
                amount == null ? BigDecimal.ZERO : amount;

        int score = 0;

        String type = transactionType == null
                ? ""
                : transactionType.trim().toUpperCase(Locale.ROOT);

        /*
         * 1. Transaction Amount Risk
         */
        if (safeAmount.compareTo(new BigDecimal("100000")) >= 0) {
            score += 25;
        } else if (safeAmount.compareTo(new BigDecimal("50000")) >= 0) {
            score += 15;
        } else if (safeAmount.compareTo(new BigDecimal("25000")) >= 0) {
            score += 8;
        }

        /*
         * 2. Velocity Check
         *
         * Number of recent transactions.
         */
        if (recentTransactionCount >= 10) {
            score += 25;
        } else if (recentTransactionCount >= 5) {
            score += 15;
        } else if (recentTransactionCount >= 3) {
            score += 8;
        }

        /*
         * 3. Geo-Location Risk
         */
        if (unusualLocation) {
            score += 15;
        }

        /*
         * 4. Unusual Device
         */
        if (unusualDevice) {
            score += 10;
        }

        /*
         * 5. Account Takeover Indicators
         */
        if (accountTakeoverIndicators) {
            score += 20;
        }

        /*
         * 6. Money Laundering Indicators
         */
        if (moneyLaunderingIndicators) {
            score += 25;
        }

        /*
         * 7. Transaction Type Adjustment
         */
        if ("IMPS".equals(type)) {
            score += 3;
        } else if ("UPI".equals(type)) {
            score += 2;
        } else if ("NEFT".equals(type)) {
            score += 1;
        } else if ("RTGS".equals(type)) {
            score += 3;
        }

        /*
         * Maximum score = 100
         */
        score = Math.min(score, 100);

        String riskLevel = determineRiskLevel(score);

        String alertType = determineAlertType(
                safeAmount,
                recentTransactionCount,
                unusualLocation,
                unusualDevice,
                accountTakeoverIndicators,
                moneyLaunderingIndicators
        );

        String description = buildDescription(
                safeAmount,
                recentTransactionCount,
                unusualLocation,
                unusualDevice,
                accountTakeoverIndicators,
                moneyLaunderingIndicators
        );

        return new RiskResult(
                BigDecimal.valueOf(score)
                        .setScale(2, RoundingMode.HALF_UP),
                riskLevel,
                alertType,
                description
        );
    }

    private String determineRiskLevel(int score) {

        if (score >= 80) {
            return "CRITICAL";
        }

        if (score >= 60) {
            return "HIGH";
        }

        if (score >= 30) {
            return "MEDIUM";
        }

        return "LOW";
    }

    private String determineAlertType(
            BigDecimal amount,
            int recentTransactionCount,
            boolean unusualLocation,
            boolean unusualDevice,
            boolean accountTakeoverIndicators,
            boolean moneyLaunderingIndicators
    ) {

        if (accountTakeoverIndicators) {
            return "ACCOUNT_TAKEOVER";
        }

        if (moneyLaunderingIndicators) {
            return "MONEY_LAUNDERING";
        }

        if (recentTransactionCount >= 5) {
            return "VELOCITY_CHECK";
        }

        if (unusualLocation) {
            return "GEO_LOCATION_RISK";
        }

        if (unusualDevice) {
            return "UNUSUAL_DEVICE";
        }

        if (amount.compareTo(new BigDecimal("100000")) >= 0) {
            return "SUSPICIOUS_TRANSACTION";
        }

        return "TRANSACTION_RISK";
    }

    private String buildDescription(
            BigDecimal amount,
            int recentTransactionCount,
            boolean unusualLocation,
            boolean unusualDevice,
            boolean accountTakeoverIndicators,
            boolean moneyLaunderingIndicators
    ) {

        StringBuilder description = new StringBuilder();

        if (amount.compareTo(new BigDecimal("100000")) >= 0) {
            description.append("High-value transaction detected. ");
        }

        if (recentTransactionCount >= 5) {
            description.append(
                    "High transaction velocity detected. "
            );
        }

        if (unusualLocation) {
            description.append(
                    "Transaction originated from an unusual location. "
            );
        }

        if (unusualDevice) {
            description.append(
                    "Unusual device activity detected. "
            );
        }

        if (accountTakeoverIndicators) {
            description.append(
                    "Possible account takeover indicators detected. "
            );
        }

        if (moneyLaunderingIndicators) {
            description.append(
                    "Potential money laundering indicators detected. "
            );
        }

        if (description.length() == 0) {
            description.append(
                    "No major suspicious indicators detected."
            );
        }

        return description.toString().trim();
    }

    /**
     * Result returned by the risk engine.
     */
    public static class RiskResult {

        private final BigDecimal riskScore;
        private final String riskLevel;
        private final String alertType;
        private final String description;

        public RiskResult(
                BigDecimal riskScore,
                String riskLevel,
                String alertType,
                String description
        ) {
            this.riskScore = riskScore;
            this.riskLevel = riskLevel;
            this.alertType = alertType;
            this.description = description;
        }

        public BigDecimal getRiskScore() {
            return riskScore;
        }

        public String getRiskLevel() {
            return riskLevel;
        }

        public String getAlertType() {
            return alertType;
        }

        public String getDescription() {
            return description;
        }
    }
}