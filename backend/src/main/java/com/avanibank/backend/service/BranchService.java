package com.avanibank.backend.service;

import com.avanibank.backend.dto.BranchRequest;
import com.avanibank.backend.entity.Branch;
import com.avanibank.backend.repository.BranchRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BranchService {

    private final BranchRepository branchRepository;

    public BranchService(
            BranchRepository branchRepository) {

        this.branchRepository =
                branchRepository;
    }

    // =====================================================
    // CREATE BRANCH
    // =====================================================

    @Transactional
    public Branch createBranch(
            BranchRequest request) {

        String branchCode =
                request.getBranchCode()
                        .trim()
                        .toUpperCase();

        if (branchRepository.existsByBranchCode(
                branchCode)) {

            throw new RuntimeException(
                    "Branch code already exists"
            );
        }

        Branch branch =
                new Branch();

        branch.setBranchCode(
                branchCode
        );

        branch.setBranchName(
                request.getBranchName().trim()
        );

        branch.setAddress(
                request.getAddress()
        );

        branch.setCity(
                request.getCity()
        );

        branch.setState(
                request.getState()
        );

        branch.setPincode(
                request.getPincode()
        );

        branch.setPhone(
                request.getPhone()
        );

        branch.setEmail(
                request.getEmail()
        );

        branch.setIfscCode(
                request.getIfscCode()
        );

        branch.setManagerEmployeeCode(
                request.getManagerEmployeeCode()
        );

        branch.setStatus(
                request.getStatus() == null
                        || request.getStatus().isBlank()
                        ? "ACTIVE"
                        : request.getStatus()
                                .trim()
                                .toUpperCase()
        );

        return branchRepository.save(branch);
    }

    // =====================================================
    // GET ALL BRANCHES
    // =====================================================

    @Transactional(readOnly = true)
    public List<Branch> getAllBranches() {

        return branchRepository.findAll();
    }

    // =====================================================
    // GET BRANCH BY ID
    // =====================================================

    @Transactional(readOnly = true)
    public Branch getBranchById(Long id) {

        return branchRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Branch not found"
                        )
                );
    }

    // =====================================================
    // UPDATE BRANCH
    // =====================================================

    @Transactional
    public Branch updateBranch(
            Long id,
            BranchRequest request) {

        Branch branch =
                branchRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Branch not found"
                                )
                        );

        String branchCode =
                request.getBranchCode()
                        .trim()
                        .toUpperCase();

        if (!branch.getBranchCode()
                .equalsIgnoreCase(branchCode)
                && branchRepository
                        .existsByBranchCode(branchCode)) {

            throw new RuntimeException(
                    "Branch code already exists"
            );
        }

        branch.setBranchCode(
                branchCode
        );

        branch.setBranchName(
                request.getBranchName().trim()
        );

        branch.setAddress(
                request.getAddress()
        );

        branch.setCity(
                request.getCity()
        );

        branch.setState(
                request.getState()
        );

        branch.setPincode(
                request.getPincode()
        );

        branch.setPhone(
                request.getPhone()
        );

        branch.setEmail(
                request.getEmail()
        );

        branch.setIfscCode(
                request.getIfscCode()
        );

        branch.setManagerEmployeeCode(
                request.getManagerEmployeeCode()
        );

        branch.setStatus(
                request.getStatus() == null
                        || request.getStatus().isBlank()
                        ? "ACTIVE"
                        : request.getStatus()
                                .trim()
                                .toUpperCase()
        );

        return branchRepository.save(branch);
    }
}