package com.avanibank.backend.repository;

import com.avanibank.backend.entity.CashCounter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CashCounterRepository
        extends JpaRepository<CashCounter, Long> {

    Optional<CashCounter> findByCounterCode(String counterCode);

    List<CashCounter> findByBranchCodeOrderByCreatedAtDesc(
            String branchCode
    );

    List<CashCounter> findByStatusOrderByCreatedAtDesc(
            String status
    );

    boolean existsByCounterCode(String counterCode);

    boolean existsByAssignedEmployeeCode(
            String assignedEmployeeCode
    );
}