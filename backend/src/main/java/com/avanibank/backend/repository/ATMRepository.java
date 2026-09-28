package com.avanibank.backend.repository;

import com.avanibank.backend.entity.ATM;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ATMRepository extends JpaRepository<ATM, Long> {

    Optional<ATM> findByAtmCode(String atmCode);

    List<ATM> findByBranchCodeOrderByCreatedAtDesc(
            String branchCode
    );

    List<ATM> findByStatusOrderByCreatedAtDesc(
            String status
    );

    boolean existsByAtmCode(String atmCode);
}