package com.avanibank.backend.repository;

import com.avanibank.backend.entity.DailyClosingReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyClosingReportRepository
        extends JpaRepository<DailyClosingReport, Long> {

    Optional<DailyClosingReport> findByBranchCodeAndClosingDate(
            String branchCode,
            LocalDate closingDate
    );

    List<DailyClosingReport> findByBranchCodeOrderByClosingDateDesc(
            String branchCode
    );

    List<DailyClosingReport> findByStatusOrderByClosingDateDesc(
            String status
    );

    boolean existsByBranchCodeAndClosingDate(
            String branchCode,
            LocalDate closingDate
    );
}