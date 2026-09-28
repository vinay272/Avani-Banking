package com.avanibank.backend.service;

import com.avanibank.backend.dto.EligibilityCalculatorRequest;
import com.avanibank.backend.dto.EligibilityCalculatorResponse;

import org.springframework.stereotype.Service;

@Service
public class EligibilityService {

    // =====================================================
    // CALCULATE ELIGIBILITY
    // =====================================================

    public EligibilityCalculatorResponse
    calculateEligibility(
            EligibilityCalculatorRequest request) {

        validateRequest(request);

        String loanType =
                request.getLoanType()
                        .trim()
                        .toUpperCase();

        Double requestedAmount =
                request.getRequestedAmount();

        Integer tenureMonths =
                request.getTenureMonths();

        Double monthlyIncome =
                request.getMonthlyIncome();

        // =================================================
        // GET INTEREST RATE
        // =================================================

        double interestRate =
                getInterestRate(loanType);

        // =================================================
        // MAXIMUM AFFORDABLE EMI
        // 50% OF MONTHLY INCOME
        // =================================================

        double maximumEligibleEmi =
                monthlyIncome * 0.50;

        // =================================================
        // MAXIMUM ELIGIBLE LOAN AMOUNT
        // =================================================

        double maximumEligibleAmount =
                calculatePrincipalFromEmi(
                        maximumEligibleEmi,
                        interestRate,
                        tenureMonths
                );

        // Round to nearest rupee
        maximumEligibleAmount =
                Math.floor(
                        maximumEligibleAmount
                );

        // =================================================
        // ESTIMATED EMI FOR REQUESTED AMOUNT
        // =================================================

        double estimatedEmi =
                calculateEmi(
                        requestedAmount,
                        interestRate,
                        tenureMonths
                );

        // =================================================
        // ELIGIBILITY
        // =================================================

        boolean eligible =
                requestedAmount
                        <= maximumEligibleAmount;

        EligibilityCalculatorResponse response =
                new EligibilityCalculatorResponse();

        response.setLoanType(loanType);

        response.setRequestedAmount(
                requestedAmount
        );

        response.setTenureMonths(
                tenureMonths
        );

        response.setMonthlyIncome(
                monthlyIncome
        );

        response.setInterestRate(
                interestRate
        );

        response.setMaximumEligibleEmi(
                round(maximumEligibleEmi)
        );

        response.setMaximumEligibleAmount(
                round(maximumEligibleAmount)
        );

        response.setEstimatedEmi(
                round(estimatedEmi)
        );

        if (eligible) {

            response.setEligibilityStatus(
                    "ELIGIBLE"
            );

            response.setMessage(
                    "You are eligible for the requested loan amount."
            );

        } else {

            response.setEligibilityStatus(
                    "NOT_ELIGIBLE"
            );

            response.setMessage(
                    "Requested loan amount exceeds your maximum eligible amount."
            );
        }

        return response;
    }

    // =====================================================
    // EMI CALCULATION
    // =====================================================

    private double calculateEmi(
            double principal,
            double annualRate,
            int tenureMonths) {

        double monthlyRate =
                annualRate / 12 / 100;

        if (monthlyRate == 0) {
            return principal / tenureMonths;
        }

        double power =
                Math.pow(
                        1 + monthlyRate,
                        tenureMonths
                );

        return
                principal
                * monthlyRate
                * power
                / (power - 1);
    }

    // =====================================================
    // PRINCIPAL FROM MAX EMI
    // =====================================================

    private double calculatePrincipalFromEmi(
            double emi,
            double annualRate,
            int tenureMonths) {

        double monthlyRate =
                annualRate / 12 / 100;

        if (monthlyRate == 0) {
            return emi * tenureMonths;
        }

        double power =
                Math.pow(
                        1 + monthlyRate,
                        tenureMonths
                );

        return
                emi
                * (power - 1)
                / (monthlyRate * power);
    }

    // =====================================================
    // INTEREST RATE
    // =====================================================

    private double getInterestRate(
            String loanType) {

        switch (loanType) {

            case "PERSONAL":
                return 12.0;

            case "HOME":
                return 8.5;

            case "CAR":
                return 9.5;

            case "EDUCATION":
                return 10.0;

            case "BUSINESS":
                return 11.0;

            case "GOLD":
                return 9.0;

            default:
                throw new RuntimeException(
                        "Invalid loan type"
                );
        }
    }

    // =====================================================
    // VALIDATION
    // =====================================================

    private void validateRequest(
            EligibilityCalculatorRequest request) {

        if (request == null) {

            throw new RuntimeException(
                    "Eligibility request cannot be empty"
            );
        }

        if (request.getLoanType() == null
                || request.getLoanType()
                        .trim()
                        .isEmpty()) {

            throw new RuntimeException(
                    "Loan type is required"
            );
        }

        if (request.getRequestedAmount() == null
                || request.getRequestedAmount() <= 0) {

            throw new RuntimeException(
                    "Requested loan amount must be greater than 0"
            );
        }

        if (request.getTenureMonths() == null
                || request.getTenureMonths() <= 0) {

            throw new RuntimeException(
                    "Loan tenure must be greater than 0"
            );
        }

        if (request.getMonthlyIncome() == null
                || request.getMonthlyIncome() <= 0) {

            throw new RuntimeException(
                    "Monthly income must be greater than 0"
            );
        }

        if (request.getEmploymentType() == null
                || request.getEmploymentType()
                        .trim()
                        .isEmpty()) {

            throw new RuntimeException(
                    "Employment type is required"
            );
        }

        String loanType =
                request.getLoanType()
                        .trim()
                        .toUpperCase();

        if (!loanType.equals("PERSONAL")
                && !loanType.equals("HOME")
                && !loanType.equals("CAR")
                && !loanType.equals("EDUCATION")
                && !loanType.equals("BUSINESS")
                && !loanType.equals("GOLD")) {

            throw new RuntimeException(
                    "Invalid loan type"
            );
        }

        String employmentType =
                request.getEmploymentType()
                        .trim()
                        .toUpperCase();

        if (!employmentType.equals("SALARIED")
                && !employmentType.equals("SELF_EMPLOYED")
                && !employmentType.equals("BUSINESS")) {

            throw new RuntimeException(
                    "Invalid employment type"
            );
        }
    }

    // =====================================================
    // ROUND VALUE
    // =====================================================

    private double round(double value) {

        return Math.round(
                value * 100.0
        ) / 100.0;
    }
}
