package com.avanibank.backend.service;

import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.dto.KycComplianceReportResponse;
import com.avanibank.backend.repository.CustomerRepository;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class KycComplianceReportService {

    private final CustomerRepository customerRepository;

    public KycComplianceReportService(
            CustomerRepository customerRepository) {

        this.customerRepository = customerRepository;
    }

    // =====================================================
    // KYC COMPLIANCE REPORT
    // =====================================================

    public KycComplianceReportResponse getReport() {

        List<Customer> customers =
                customerRepository.findAll();

        long totalCustomers =
                customers.size();

        long verifiedKycCustomers =
                customers.stream()
                        .filter(customer ->
                                "VERIFIED".equalsIgnoreCase(
                                        customer.getKycStatus()))
                        .count();

        long pendingKycCustomers =
                customers.stream()
                        .filter(customer ->
                                "PENDING".equalsIgnoreCase(
                                        customer.getKycStatus()))
                        .count();

        long rejectedKycCustomers =
                customers.stream()
                        .filter(customer ->
                                "REJECTED".equalsIgnoreCase(
                                        customer.getKycStatus()))
                        .count();

        double kycComplianceRate = 0.0;

        if (totalCustomers > 0) {

            kycComplianceRate =
                    (verifiedKycCustomers * 100.0)
                            / totalCustomers;
        }

        // =================================================
        // STATUS SUMMARY
        // =================================================

        Map<String, Long> kycStatusSummary =
                customers.stream()
                        .collect(Collectors.groupingBy(
                                customer ->
                                        customer.getKycStatus() == null
                                                ? "UNKNOWN"
                                                : customer.getKycStatus(),
                                LinkedHashMap::new,
                                Collectors.counting()
                        ));

        // =================================================
        // CUSTOMER KYC RECORDS
        // =================================================

        List<Map<String, Object>> customerKycRecords =
                customers.stream()
                        .map(this::toSafeMap)
                        .toList();

        return new KycComplianceReportResponse (

                totalCustomers,

                verifiedKycCustomers,

                pendingKycCustomers,

                rejectedKycCustomers,

                round(kycComplianceRate),

                kycStatusSummary,

                customerKycRecords
        );
    }

    // =====================================================
    // SAFE CUSTOMER MAP
    // =====================================================

    private Map<String, Object> toSafeMap(
            Customer customer) {

        Map<String, Object> map =
                new LinkedHashMap<>();

        map.put("id", customer.getId());
        map.put("fullName", customer.getFullName());
        map.put("email", customer.getEmail());
        map.put("phone", customer.getPhone());
        map.put("accountNumber", customer.getAccountNumber());
        map.put("accountType", customer.getAccountType());
        map.put("status", customer.getStatus());
        map.put("kycStatus", customer.getKycStatus());
        map.put("createdAt", customer.getCreatedAt());

        // Password intentionally excluded.

        return map;
    }

    // =====================================================
    // ROUND
    // =====================================================

    private double round(double value) {

        return Math.round(value * 100.0) / 100.0;
    }
}