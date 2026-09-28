package com.avanibank.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerReportResponse {

    private long totalCustomers;

    private long activeCustomers;

    private long inactiveCustomers;

    private long verifiedKycCustomers;

    private long pendingKycCustomers;

    private long rejectedKycCustomers;

    private Map<String, Long> accountTypeSummary;

    private List<Map<String, Object>> customers;
}