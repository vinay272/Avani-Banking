package com.avanibank.backend.controller;

import com.avanibank.backend.entity.CustomerRelationshipHistory;
import com.avanibank.backend.service.CustomerRelationshipHistoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer-relationship-history")
@CrossOrigin(origins = "*")
public class CustomerRelationshipHistoryController {

    private final CustomerRelationshipHistoryService historyService;

    public CustomerRelationshipHistoryController(
            CustomerRelationshipHistoryService historyService) {

        this.historyService = historyService;
    }

    // =========================
    // ADD RELATIONSHIP HISTORY
    // =========================

    @PostMapping("/add")
    public ResponseEntity<CustomerRelationshipHistory> addHistory(
            @RequestParam Long customerId,
            @RequestParam String relationshipType,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Long relatedCustomerId) {

        return ResponseEntity.ok(
                historyService.addHistory(
                        customerId,
                        relationshipType,
                        description,
                        relatedCustomerId
                )
        );
    }

    // =========================
    // GET CUSTOMER HISTORY
    // =========================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<CustomerRelationshipHistory>>
    getCustomerHistory(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                historyService.getCustomerHistory(
                        customerId
                )
        );
    }

    // =========================
    // GET RELATED CUSTOMER HISTORY
    // =========================

    @GetMapping("/related/{customerId}")
    public ResponseEntity<List<CustomerRelationshipHistory>>
    getRelatedCustomerHistory(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                historyService.getRelatedCustomerHistory(
                        customerId
                )
        );
    }
}