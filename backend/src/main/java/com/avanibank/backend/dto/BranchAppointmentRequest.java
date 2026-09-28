package com.avanibank.backend.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
public class BranchAppointmentRequest {

    @NotBlank(message = "Branch code is required")
    @Size(max = 20, message = "Branch code cannot exceed 20 characters")
    private String branchCode;

    @NotBlank(message = "Branch name is required")
    @Size(max = 100, message = "Branch name cannot exceed 100 characters")
    private String branchName;

    @NotNull(message = "Appointment date is required")
    @FutureOrPresent(message = "Appointment date must be today or a future date")
    private LocalDate appointmentDate;

    @NotNull(message = "Appointment time is required")
    private LocalTime appointmentTime;

    @NotBlank(message = "Appointment purpose is required")
    @Size(max = 100, message = "Purpose cannot exceed 100 characters")
    private String purpose;
}