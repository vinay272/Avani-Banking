package com.avanibank.backend.service;

import com.avanibank.backend.entity.FraudAlert;
import com.avanibank.backend.repository.FraudAlertRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AmlReportService {

    private final FraudAlertRepository fraudAlertRepository;

    public AmlReportService(
            FraudAlertRepository fraudAlertRepository) {

        this.fraudAlertRepository = fraudAlertRepository;
    }

    public Map<String, Object> getAmlReport() {

        List<FraudAlert> amlAlerts =
                fraudAlertRepository.findAll()
                        .stream()
                        .filter(alert ->
                                "MONEY_LAUNDERING".equalsIgnoreCase(
                                        alert.getAlertType()))
                        .toList();

        long totalAmlCases = amlAlerts.size();

        long openAmlCases =
                amlAlerts.stream()
                        .filter(alert ->
                                "OPEN".equalsIgnoreCase(
                                        alert.getStatus()))
                        .count();

        long resolvedAmlCases =
                amlAlerts.stream()
                        .filter(alert ->
                                "RESOLVED".equalsIgnoreCase(
                                        alert.getStatus()))
                        .count();

        long criticalAmlCases =
                amlAlerts.stream()
                        .filter(alert ->
                                "CRITICAL".equalsIgnoreCase(
                                        alert.getRiskLevel()))
                        .count();

        long highRiskAmlCases =
                amlAlerts.stream()
                        .filter(alert ->
                                "HIGH".equalsIgnoreCase(
                                        alert.getRiskLevel()))
                        .count();

        Map<String, Long> alertTypeSummary =
                amlAlerts.stream()
                        .collect(Collectors.groupingBy(
                                alert -> alert.getAlertType() == null
                                        ? "UNKNOWN"
                                        : alert.getAlertType(),
                                LinkedHashMap::new,
                                Collectors.counting()
                        ));

        Map<String, Long> transactionTypeSummary =
                amlAlerts.stream()
                        .collect(Collectors.groupingBy(
                                alert -> alert.getTransactionType() == null
                                        ? "UNKNOWN"
                                        : alert.getTransactionType(),
                                LinkedHashMap::new,
                                Collectors.counting()
                        ));

        List<Map<String, Object>> amlCases =
                amlAlerts.stream()
                        .map(this::toSafeMap)
                        .toList();

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put("totalAmlCases", totalAmlCases);
        response.put("openAmlCases", openAmlCases);
        response.put("resolvedAmlCases", resolvedAmlCases);
        response.put("criticalAmlCases", criticalAmlCases);
        response.put("highRiskAmlCases", highRiskAmlCases);

        // Current fraud_alert model does not store a separate
        // suspicious transaction amount, so this remains 0
        // until a dedicated AML amount field is introduced.
        response.put("totalSuspiciousAmount", 0.0);

        response.put("alertTypeSummary", alertTypeSummary);
        response.put("transactionTypeSummary", transactionTypeSummary);
        response.put("amlCases", amlCases);

        return response;
    }

    private Map<String, Object> toSafeMap(FraudAlert alert) {

        Map<String, Object> map =
                new LinkedHashMap<>();

        map.put("id", alert.getId());

        map.put(
                "customerId",
                alert.getCustomer() != null
                        ? alert.getCustomer().getId()
                        : null
        );

        map.put("alertType", alert.getAlertType());
        map.put("riskLevel", alert.getRiskLevel());
        map.put("riskScore", alert.getRiskScore());
        map.put("description", alert.getDescription());
        map.put("transactionId", alert.getTransactionId());
        map.put("transactionType", alert.getTransactionType());
        map.put("location", alert.getLocation());
        map.put("status", alert.getStatus());
        map.put("detectedAt", alert.getDetectedAt());
        map.put("resolvedAt", alert.getResolvedAt());
        map.put("resolutionNote", alert.getResolutionNote());
        map.put("createdAt", alert.getCreatedAt());
        map.put("updatedAt", alert.getUpdatedAt());

        return map;
    }
}