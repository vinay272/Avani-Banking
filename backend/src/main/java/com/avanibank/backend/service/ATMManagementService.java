package com.avanibank.backend.service;

import com.avanibank.backend.dto.ATMRequest;
import com.avanibank.backend.dto.ATMResponse;
import com.avanibank.backend.entity.ATM;
import com.avanibank.backend.repository.ATMRepository;
import com.avanibank.backend.repository.BranchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ATMManagementService {

    private final ATMRepository atmRepository;
    private final BranchRepository branchRepository;

    public ATMManagementService(
            ATMRepository atmRepository,
            BranchRepository branchRepository) {

        this.atmRepository = atmRepository;
        this.branchRepository = branchRepository;
    }

    @Transactional
    public ATMResponse createATM(ATMRequest request) {

        if (atmRepository.existsByAtmCode(request.getAtmCode())) {
            throw new RuntimeException("ATM code already exists");
        }

        validateBranch(request.getBranchCode());

        BigDecimal cashBalance = request.getCashBalance();

        if (cashBalance == null
                || cashBalance.compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Cash balance cannot be negative"
            );
        }

        ATM atm = new ATM();

        atm.setAtmCode(request.getAtmCode());
        atm.setAtmName(request.getAtmName());
        atm.setBranchCode(request.getBranchCode());
        atm.setLocation(request.getLocation());
        atm.setCashBalance(cashBalance);
        atm.setStatus("ACTIVE");

        ATM savedATM = atmRepository.save(atm);

        return new ATMResponse(savedATM);
    }

    @Transactional(readOnly = true)
    public List<ATMResponse> getAllATMs() {

        return atmRepository.findAll()
                .stream()
                .map(ATMResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public ATMResponse getATMById(Long id) {

        ATM atm = atmRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "ATM not found with id: " + id
                        ));

        return new ATMResponse(atm);
    }

    @Transactional(readOnly = true)
    public List<ATMResponse> getATMsByBranch(String branchCode) {

        validateBranch(branchCode);

        return atmRepository
                .findByBranchCodeOrderByCreatedAtDesc(branchCode)
                .stream()
                .map(ATMResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ATMResponse> getATMsByStatus(String status) {

        if (!"ACTIVE".equalsIgnoreCase(status)
                && !"INACTIVE".equalsIgnoreCase(status)) {

            throw new RuntimeException(
                    "Invalid status. Use ACTIVE or INACTIVE"
            );
        }

        return atmRepository
                .findByStatusOrderByCreatedAtDesc(
                        status.toUpperCase()
                )
                .stream()
                .map(ATMResponse::new)
                .toList();
    }

    @Transactional
    public ATMResponse updateATM(
            Long id,
            ATMRequest request) {

        ATM atm = atmRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "ATM not found with id: " + id
                        ));

        if (!atm.getAtmCode().equals(request.getAtmCode())
                && atmRepository.existsByAtmCode(
                        request.getAtmCode())) {

            throw new RuntimeException(
                    "ATM code already exists"
            );
        }

        validateBranch(request.getBranchCode());

        BigDecimal cashBalance = request.getCashBalance();

        if (cashBalance == null
                || cashBalance.compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Cash balance cannot be negative"
            );
        }

        atm.setAtmCode(request.getAtmCode());
        atm.setAtmName(request.getAtmName());
        atm.setBranchCode(request.getBranchCode());
        atm.setLocation(request.getLocation());
        atm.setCashBalance(cashBalance);

        ATM updatedATM = atmRepository.save(atm);

        return new ATMResponse(updatedATM);
    }

    @Transactional
    public ATMResponse updateStatus(
            Long id,
            String status) {

        ATM atm = atmRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "ATM not found with id: " + id
                        ));

        if (!"ACTIVE".equalsIgnoreCase(status)
                && !"INACTIVE".equalsIgnoreCase(status)) {

            throw new RuntimeException(
                    "Invalid status. Use ACTIVE or INACTIVE"
            );
        }

        atm.setStatus(status.toUpperCase());

        ATM updatedATM = atmRepository.save(atm);

        return new ATMResponse(updatedATM);
    }

    @Transactional
    public ATMResponse recordMaintenance(Long id) {

        ATM atm = atmRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "ATM not found with id: " + id
                        ));

        atm.setLastMaintenanceAt(LocalDateTime.now());

        ATM updatedATM = atmRepository.save(atm);

        return new ATMResponse(updatedATM);
    }

    private void validateBranch(String branchCode) {

        if (branchCode == null || branchCode.isBlank()) {
            throw new RuntimeException(
                    "Branch code is required"
            );
        }

        if (!branchRepository.existsByBranchCode(branchCode)) {
            throw new RuntimeException(
                    "Branch not found: " + branchCode
            );
        }
    }
}