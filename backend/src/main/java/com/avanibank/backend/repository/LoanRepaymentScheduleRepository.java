package com.avanibank.backend.repository;

import com.avanibank.backend.entity.LoanRepaymentSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanRepaymentScheduleRepository
        extends JpaRepository<LoanRepaymentSchedule, Long> {

    List<LoanRepaymentSchedule>
    findByLoanIdOrderByInstallmentNumberAsc(Long loanId);

    List<LoanRepaymentSchedule>
    findByLoanIdAndStatusOrderByInstallmentNumberAsc(
        Long loanId,
        String status
    );

    boolean existsByLoanId(Long loanId);

    List<LoanRepaymentSchedule> findByDueDateAndStatus(
        java.time.LocalDate dueDate,
        String status
   );
}