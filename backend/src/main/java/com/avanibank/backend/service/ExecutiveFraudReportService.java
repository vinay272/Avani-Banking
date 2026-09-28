package com.avanibank.backend.service;

import com.avanibank.backend.entity.FraudAlert;
import com.avanibank.backend.dto.FraudReportResponse;
import com.avanibank.backend.repository.FraudAlertRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExecutiveFraudReportService {

    private final FraudAlertRepository fraudAlertRepository;

    public ExecutiveFraudReportService(
            FraudAlertRepository fraudAlertRepository) {

        this.fraudAlertRepository =
                fraudAlertRepository;
    }

    public FraudReportResponse getFraudReport() {

        List<FraudAlert> alerts =
                fraudAlertRepository.findAll();

        long openCases = 0;
        long resolvedCases = 0;

        long criticalCases = 0;
        long highRiskCases = 0;
        long mediumRiskCases = 0;
        long lowRiskCases = 0;

        Map<String, Long> riskLevelSummary =
                new LinkedHashMap<>();

        Map<String, Long> alertTypeSummary =
                new LinkedHashMap<>();

        Map<String, Long> statusSummary =
                new LinkedHashMap<>();

        Map<String, Long> transactionTypeSummary =
                new LinkedHashMap<>();

        List<Map<String, Object>> fraudCases =
                new ArrayList<>();

        for (FraudAlert alert : alerts) {

            String riskLevel =
                    normalize(alert.getRiskLevel());

            String alertType =
                    normalize(alert.getAlertType());

            String status =
                    normalize(alert.getStatus());

            String transactionType =
                    normalize(alert.getTransactionType());

            // =================================================
            // STATUS COUNTS
            // =================================================

            if ("OPEN".equals(status)) {
                openCases++;
            }

            if ("RESOLVED".equals(status)) {
                resolvedCases++;
            }

            // =================================================
            // RISK COUNTS
            // =================================================

            switch (riskLevel) {

                case "CRITICAL":
                    criticalCases++;
                    break;

                case "HIGH":
                    highRiskCases++;
                    break;

                case "MEDIUM":
                    mediumRiskCases++;
                    break;

                case "LOW":
                    lowRiskCases++;
                    break;

                default:
                    break;
            }

            // =================================================
            // SUMMARY MAPS
            // =================================================

            increment(
                    riskLevelSummary,
                    riskLevel
            );

            increment(
                    alertTypeSummary,
                    alertType
            );

            increment(
                    statusSummary,
                    status
            );

            increment(
                    transactionTypeSummary,
                    transactionType
            );

            // =================================================
            // FRAUD CASE DETAILS
            // =================================================

            Map<String, Object> data =
                    new LinkedHashMap<>();

            data.put(
                    "id",
                    alert.getId()
            );

            data.put(
                    "customerId",
                    alert.getCustomer() != null
                            ? alert.getCustomer().getId()
                            : null
            );

            data.put(
                    "customerName",
                    alert.getCustomer() != null
                            ? alert.getCustomer().getFullName()
                            : null
            );

            data.put(
                    "alertType",
                    alert.getAlertType()
            );

            data.put(
                    "riskLevel",
                    alert.getRiskLevel()
            );

            data.put(
                    "riskScore",
                    alert.getRiskScore()
            );

            data.put(
                    "description",
                    alert.getDescription()
            );

            data.put(
                    "transactionId",
                    alert.getTransactionId()
            );

            data.put(
                    "transactionType",
                    alert.getTransactionType()
            );

            data.put(
                    "location",
                    alert.getLocation()
            );

            data.put(
                    "status",
                    alert.getStatus()
            );

            data.put(
                    "detectedAt",
                    alert.getDetectedAt()
            );

            data.put(
                    "resolvedAt",
                    alert.getResolvedAt()
            );

            data.put(
                    "resolutionNote",
                    alert.getResolutionNote()
            );

            data.put(
                    "createdAt",
                    alert.getCreatedAt()
            );

            data.put(
                    "updatedAt",
                    alert.getUpdatedAt()
            );

            fraudCases.add(data);
        }
       return new FraudReportResponse(
        alerts.size(),
        openCases,
        resolvedCases,
        criticalCases,
        highRiskCases,
        mediumRiskCases,
        lowRiskCases,
        riskLevelSummary,
        alertTypeSummary,
        statusSummary,
        transactionTypeSummary,
        fraudCases
); 
       
    }

    // =====================================================
    // NORMALIZE
    // =====================================================

    private String normalize(String value) {

        if (value == null || value.isBlank()) {
            return "UNKNOWN";
        }

        return value.toUpperCase();
    }

    // =====================================================
    // INCREMENT
    // =====================================================

    private void increment(
            Map<String, Long> map,
            String key) {

        map.put(
                key,
                map.getOrDefault(key, 0L) + 1
        );
    }
}