package com.avanibank.backend.service;

import com.avanibank.backend.dto.FixedDepositPlanResponse;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FixedDepositPlanService {

    public List<FixedDepositPlanResponse> getAllPlans() {

        return List.of(

                new FixedDepositPlanResponse(
                        "FD_6M",
                        "Short Term FD",
                        6,
                        6.50,
                        "Suitable for short-term savings."
                ),

                new FixedDepositPlanResponse(
                        "FD_12M",
                        "Standard FD",
                        12,
                        7.00,
                        "Balanced option for one year investment."
                ),

                new FixedDepositPlanResponse(
                        "FD_24M",
                        "Growth FD",
                        24,
                        7.25,
                        "Higher return for medium-term investment."
                ),

                new FixedDepositPlanResponse(
                        "FD_36M",
                        "Long Term FD",
                        36,
                        7.50,
                        "Designed for long-term savings."
                ),

                new FixedDepositPlanResponse(
                        "FD_60M",
                        "Maximum Tenure FD",
                        60,
                        7.75,
                        "Long-term investment with higher interest rate."
                )
        );
    }
}