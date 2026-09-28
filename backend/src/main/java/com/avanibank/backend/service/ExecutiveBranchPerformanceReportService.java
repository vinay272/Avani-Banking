package com.avanibank.backend.service;

import com.avanibank.backend.dto.BranchPerformanceReportResponse;
import com.avanibank.backend.entity.BranchAppointment;
import com.avanibank.backend.repository.BranchAppointmentRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExecutiveBranchPerformanceReportService {

    private final BranchAppointmentRepository
            branchAppointmentRepository;

    public ExecutiveBranchPerformanceReportService(
            BranchAppointmentRepository branchAppointmentRepository) {

        this.branchAppointmentRepository =
                branchAppointmentRepository;
    }

    public BranchPerformanceReportResponse
    getBranchPerformanceReport() {

        List<BranchAppointment> appointments =
                branchAppointmentRepository.findAll();

        Map<String, Map<String, Object>> branchMap =
                new LinkedHashMap<>();

        long totalAppointments = 0;
        long bookedAppointments = 0;
        long completedAppointments = 0;
        long cancelledAppointments = 0;

        // =====================================================
        // PROCESS APPOINTMENTS
        // =====================================================

        for (BranchAppointment appointment : appointments) {

            String branchCode =
                    appointment.getBranchCode();

            String branchName =
                    appointment.getBranchName();

            if (branchCode == null ||
                    branchCode.isBlank()) {

                continue;
            }

            Map<String, Object> branchData =
                    branchMap.computeIfAbsent(
                            branchCode,
                            key -> {

                                Map<String, Object> data =
                                        new LinkedHashMap<>();

                                data.put(
                                        "branchCode",
                                        branchCode
                                );

                                data.put(
                                        "branchName",
                                        branchName
                                );

                                data.put(
                                        "totalAppointments",
                                        0L
                                );

                                data.put(
                                        "bookedAppointments",
                                        0L
                                );

                                data.put(
                                        "completedAppointments",
                                        0L
                                );

                                data.put(
                                        "cancelledAppointments",
                                        0L
                                );

                                return data;
                            }
                    );

            // =================================================
            // TOTAL
            // =================================================

            long branchTotal =
                    (Long) branchData.get(
                            "totalAppointments"
                    );

            branchData.put(
                    "totalAppointments",
                    branchTotal + 1
            );

            totalAppointments++;

            // =================================================
            // STATUS
            // =================================================

            String status =
                    appointment.getStatus();

            if ("BOOKED".equalsIgnoreCase(status)) {

                long branchBooked =
                        (Long) branchData.get(
                                "bookedAppointments"
                        );

                branchData.put(
                        "bookedAppointments",
                        branchBooked + 1
                );

                bookedAppointments++;

            } else if (
                    "COMPLETED".equalsIgnoreCase(status)) {

                long branchCompleted =
                        (Long) branchData.get(
                                "completedAppointments"
                        );

                branchData.put(
                        "completedAppointments",
                        branchCompleted + 1
                );

                completedAppointments++;

            } else if (
                    "CANCELLED".equalsIgnoreCase(status)) {

                long branchCancelled =
                        (Long) branchData.get(
                                "cancelledAppointments"
                        );

                branchData.put(
                        "cancelledAppointments",
                        branchCancelled + 1
                );

                cancelledAppointments++;
            }
        }

        // =====================================================
        // BRANCH LIST
        // =====================================================

        List<Map<String, Object>> branches =
                new ArrayList<>(
                        branchMap.values()
                );

        // =====================================================
        // RESPONSE
        // =====================================================

        return new BranchPerformanceReportResponse(

                branchMap.size(),

                totalAppointments,

                bookedAppointments,

                completedAppointments,

                cancelledAppointments,

                branches
        );
    }
}