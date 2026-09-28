
package com.avanibank.backend.controller;

import com.avanibank.backend.dto.BranchRequest;
import com.avanibank.backend.entity.Branch;
import com.avanibank.backend.service.BranchService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/branches")
@CrossOrigin(origins = "http://localhost:5173")
public class BranchController {

    private final BranchService branchService;

    public BranchController(
            BranchService branchService) {

        this.branchService =
                branchService;
    }

    // =====================================================
    // CREATE BRANCH
    // =====================================================

    @PostMapping
    public ResponseEntity<Branch> createBranch(
            @Valid
            @RequestBody
            BranchRequest request) {

        return ResponseEntity.ok(
                branchService.createBranch(request)
        );
    }

    // =====================================================
    // GET ALL BRANCHES
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Branch>>
    getAllBranches() {

        return ResponseEntity.ok(
                branchService.getAllBranches()
        );
    }

    // =====================================================
    // GET BRANCH BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<Branch>
    getBranchById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                branchService.getBranchById(id)
        );
    }

    // =====================================================
    // UPDATE BRANCH
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<Branch>
    updateBranch(
            @PathVariable Long id,
            @Valid
            @RequestBody
            BranchRequest request) {

        return ResponseEntity.ok(
                branchService.updateBranch(
                        id,
                        request
                )
        );
    }
}