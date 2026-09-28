package com.avanibank.backend.controller;

import com.avanibank.backend.dto.FixedDepositPlanResponse;
import com.avanibank.backend.service.FixedDepositPlanService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/fixed-deposit-plans")
public class FixedDepositPlanController {

    private final FixedDepositPlanService fixedDepositPlanService;

    public FixedDepositPlanController(
            FixedDepositPlanService fixedDepositPlanService) {

        this.fixedDepositPlanService = fixedDepositPlanService;
    }

    @GetMapping
    public List<FixedDepositPlanResponse> getAllPlans() {

        return fixedDepositPlanService.getAllPlans();
    }
}