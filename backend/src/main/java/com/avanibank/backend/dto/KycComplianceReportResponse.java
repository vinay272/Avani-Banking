package com.avanibank.backend.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class KycComplianceReportResponse {

    private long totalCustomers;

    private long verifiedKycCustomers;

    private long pendingKycCustomers;

    private long rejectedKycCustomers;

    private double kycComplianceRate;

    private Map<String, Long> kycStatusSummary;

    private List<Map<String, Object>> customerKycRecords;

    public KycComplianceReportResponse(
            long totalCustomers,
            long verifiedKycCustomers,
            long pendingKycCustomers,
            long rejectedKycCustomers,
            double kycComplianceRate,
            Map<String, Long> kycStatusSummary,
            List<Map<String, Object>> customerKycRecords) {

        this.totalCustomers = totalCustomers;
        this.verifiedKycCustomers = verifiedKycCustomers;
        this.pendingKycCustomers = pendingKycCustomers;
        this.rejectedKycCustomers = rejectedKycCustomers;
        this.kycComplianceRate = kycComplianceRate;
        this.kycStatusSummary = kycStatusSummary;
        this.customerKycRecords = customerKycRecords;
    }
}