package com.avanibank.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BranchPerformanceReportResponse {

    private long totalBranches;

    private long totalAppointments;

    private long bookedAppointments;

    private long completedAppointments;

    private long cancelledAppointments;

    private List<Map<String, Object>> branches;
}