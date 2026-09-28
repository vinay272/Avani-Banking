package com.avanibank.backend.service;

import com.avanibank.backend.dto.EmiCalculatorRequest;
import com.avanibank.backend.dto.EmiCalculatorResponse;

import org.springframework.stereotype.Service;

@Service
public class EmiCalculatorService {

    // =====================================================
    // CALCULATE EMI
    // =====================================================

    public EmiCalculatorResponse calculateEmi(
            EmiCalculatorRequest request) {

        validateRequest(request);

        double principal =
                request.getLoanAmount();

        double annualRate =
                request.getAnnualInterestRate();

        int tenureMonths =
                request.getTenureMonths();

        // =================================================
        // MONTHLY INTEREST RATE
        // =================================================

        double monthlyRate =
                annualRate / 12.0 / 100.0;

        double monthlyEmi;

        // =================================================
        // ZERO INTEREST CASE
        // =================================================

        if (monthlyRate == 0) {

            monthlyEmi =
                    principal / tenureMonths;

        } else {

            double power =
                    Math.pow(
                            1 + monthlyRate,
                            tenureMonths
                    );

            monthlyEmi =
                    principal
                    * monthlyRate
                    * power
                    / (power - 1);
        }

        // =================================================
        // TOTAL REPAYMENT
        // =================================================

        double totalRepayment =
                monthlyEmi * tenureMonths;

        // =================================================
        // TOTAL INTEREST
        // =================================================

        double totalInterest =
                totalRepayment - principal;

        // =================================================
        // RESPONSE
        // =================================================

        EmiCalculatorResponse response =
                new EmiCalculatorResponse();

        response.setLoanAmount(
                round(principal)
        );

        response.setAnnualInterestRate(
                round(annualRate)
        );

        response.setTenureMonths(
                tenureMonths
        );

        response.setMonthlyEmi(
                round(monthlyEmi)
        );

        response.setTotalInterest(
                round(totalInterest)
        );

        response.setTotalRepayment(
                round(totalRepayment)
        );

        return response;
    }

    // =====================================================
    // VALIDATION
    // =====================================================

    private void validateRequest(
            EmiCalculatorRequest request) {

        if (request == null) {

            throw new RuntimeException(
                    "EMI calculator request cannot be empty"
            );
        }

        if (request.getLoanAmount() == null
                || request.getLoanAmount() <= 0) {

            throw new RuntimeException(
                    "Loan amount must be greater than 0"
            );
        }

        if (request.getAnnualInterestRate() == null
                || request.getAnnualInterestRate() < 0) {

            throw new RuntimeException(
                    "Interest rate cannot be negative"
            );
        }

        if (request.getTenureMonths() == null
                || request.getTenureMonths() <= 0) {

            throw new RuntimeException(
                    "Tenure must be greater than 0"
            );
        }
    }

    // =====================================================
    // ROUND
    // =====================================================

    private double round(double value) {

        return Math.round(
                value * 100.0
        ) / 100.0;
    }
}