package com.avanibank.backend.service;

import com.avanibank.backend.dto.VaultRequest;
import com.avanibank.backend.dto.VaultResponse;
import com.avanibank.backend.entity.Vault;
import com.avanibank.backend.repository.BranchRepository;
import com.avanibank.backend.repository.VaultRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class VaultManagementService {

    private final VaultRepository vaultRepository;
    private final BranchRepository branchRepository;

    public VaultManagementService(
            VaultRepository vaultRepository,
            BranchRepository branchRepository
    ) {
        this.vaultRepository = vaultRepository;
        this.branchRepository = branchRepository;
    }

    // =========================
    // CREATE VAULT
    // =========================

    public VaultResponse createVault(VaultRequest request) {

        if (vaultRepository.existsByVaultCode(request.getVaultCode())) {
            throw new RuntimeException("Vault code already exists");
        }

        if (!branchRepository.existsByBranchCode(request.getBranchCode())) {
            throw new RuntimeException("Branch code not found");
        }

        if (request.getTotalCapacity() == null
                || request.getTotalCapacity().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Total capacity cannot be negative");
        }

        Vault vault = new Vault();

        vault.setVaultCode(request.getVaultCode());
        vault.setVaultName(request.getVaultName());
        vault.setBranchCode(request.getBranchCode());

        vault.setTotalCapacity(request.getTotalCapacity());

        // Vault starts empty.
        vault.setCurrentBalance(BigDecimal.ZERO);

        vault.setStatus("ACTIVE");

        Vault savedVault = vaultRepository.save(vault);

        return new VaultResponse(savedVault);
    }

    // =========================
    // GET ALL VAULTS
    // =========================

    public List<VaultResponse> getAllVaults() {

        return vaultRepository.findAll()
                .stream()
                .map(VaultResponse::new)
                .toList();
    }

    // =========================
    // GET VAULT BY ID
    // =========================

    public VaultResponse getVaultById(Long id) {

        Vault vault = vaultRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Vault not found"));

        return new VaultResponse(vault);
    }

    // =========================
    // GET VAULTS BY BRANCH
    // =========================

    public List<VaultResponse> getVaultsByBranch(String branchCode) {

        return vaultRepository
                .findByBranchCodeOrderByCreatedAtDesc(branchCode)
                .stream()
                .map(VaultResponse::new)
                .toList();
    }

    // =========================
    // GET VAULTS BY STATUS
    // =========================

    public List<VaultResponse> getVaultsByStatus(String status) {

        if (!"ACTIVE".equalsIgnoreCase(status)
                && !"INACTIVE".equalsIgnoreCase(status)) {

            throw new RuntimeException(
                    "Invalid status. Use ACTIVE or INACTIVE"
            );
        }

        return vaultRepository
                .findByStatusOrderByCreatedAtDesc(
                        status.toUpperCase()
                )
                .stream()
                .map(VaultResponse::new)
                .toList();
    }

    // =========================
    // UPDATE VAULT
    // =========================

    public VaultResponse updateVault(Long id, VaultRequest request) {

        Vault vault = vaultRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Vault not found"));

        if (!vault.getVaultCode().equals(request.getVaultCode())
                && vaultRepository.existsByVaultCode(request.getVaultCode())) {

            throw new RuntimeException("Vault code already exists");
        }

        if (!branchRepository.existsByBranchCode(request.getBranchCode())) {
            throw new RuntimeException("Branch code not found");
        }

        if (request.getTotalCapacity() == null
                || request.getTotalCapacity().compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Total capacity cannot be negative"
            );
        }

        /*
         * Current balance is controlled internally.
         * It must never exceed the new vault capacity.
         */
        if (vault.getCurrentBalance()
                .compareTo(request.getTotalCapacity()) > 0) {

            throw new RuntimeException(
                    "Total capacity cannot be less than current balance"
            );
        }

        vault.setVaultCode(request.getVaultCode());
        vault.setVaultName(request.getVaultName());
        vault.setBranchCode(request.getBranchCode());
        vault.setTotalCapacity(request.getTotalCapacity());

        Vault updatedVault = vaultRepository.save(vault);

        return new VaultResponse(updatedVault);
    }

    // =========================
    // UPDATE STATUS
    // =========================

    public VaultResponse updateStatus(Long id, String status) {

        if (!"ACTIVE".equalsIgnoreCase(status)
                && !"INACTIVE".equalsIgnoreCase(status)) {

            throw new RuntimeException(
                    "Invalid status. Use ACTIVE or INACTIVE"
            );
        }

        Vault vault = vaultRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Vault not found"));

        vault.setStatus(status.toUpperCase());

        Vault updatedVault = vaultRepository.save(vault);

        return new VaultResponse(updatedVault);
    }

    // =========================
    // RECORD VAULT AUDIT
    // =========================

    public VaultResponse recordAudit(Long id) {

        Vault vault = vaultRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Vault not found"));

        vault.setLastAuditAt(LocalDateTime.now());

        Vault updatedVault = vaultRepository.save(vault);

        return new VaultResponse(updatedVault);
    }
}