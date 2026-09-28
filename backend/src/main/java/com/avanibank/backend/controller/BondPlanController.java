package com.avanibank.backend.controller;

import com.avanibank.backend.dto.BondPlanResponse;
import com.avanibank.backend.service.BondPlanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bond-plans")
@CrossOrigin(origins = "http://localhost:5173")
public class BondPlanController {

    private final BondPlanService bondPlanService;

    public BondPlanController(BondPlanService bondPlanService) {
        this.bondPlanService = bondPlanService;
    }

    @GetMapping
    public ResponseEntity<List<BondPlanResponse>> getBondPlans() {
        return ResponseEntity.ok(bondPlanService.getBondPlans());
    }
}