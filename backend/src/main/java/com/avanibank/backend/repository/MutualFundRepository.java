package com.avanibank.backend.repository;

import com.avanibank.backend.entity.MutualFund;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MutualFundRepository extends JpaRepository<MutualFund, Long> {

    List<MutualFund> findByStatusOrderByFundNameAsc(String status);

    Optional<MutualFund> findByIdAndStatus(
            Long id,
            String status
    );

    boolean existsByFundNameIgnoreCase(String fundName);
}