package com.avanibank.backend.repository;

import com.avanibank.backend.entity.Vault;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VaultRepository extends JpaRepository<Vault, Long> {

    Optional<Vault> findByVaultCode(String vaultCode);

    List<Vault> findByBranchCodeOrderByCreatedAtDesc(String branchCode);

    List<Vault> findByStatusOrderByCreatedAtDesc(String status);

    boolean existsByVaultCode(String vaultCode);
}