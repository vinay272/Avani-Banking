package com.avanibank.backend.repository;

import com.avanibank.backend.entity.BranchAppointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BranchAppointmentRepository
        extends JpaRepository<BranchAppointment, Long> {

    List<BranchAppointment> findByCustomerIdOrderByAppointmentDateDescAppointmentTimeDesc(
            Long customerId
    );

    boolean existsByBranchCodeAndAppointmentDateAndAppointmentTimeAndStatusNot(
            String branchCode,
            LocalDate appointmentDate,
            LocalTime appointmentTime,
            String status
    );
}