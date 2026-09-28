package com.avanibank.backend.service;

import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.dto.CustomerReportResponse;
import com.avanibank.backend.repository.CustomerRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class CustomerReportService {

    private final CustomerRepository customerRepository;

    public CustomerReportService(
            CustomerRepository customerRepository) {

        this.customerRepository = customerRepository;
    }

    // =====================================================
    // CUSTOMER REPORT
    // =====================================================

    public CustomerReportResponse getCustomerReport() {

        List<Customer> customers =
                customerRepository.findAll();

        long activeCustomers = 0;

        long inactiveCustomers = 0;

        long verifiedKycCustomers = 0;

        long pendingKycCustomers = 0;

        long rejectedKycCustomers = 0;

        Map<String, Long> accountTypeSummary =
                new LinkedHashMap<>();

        List<Map<String, Object>> customerList =
                new ArrayList<>();

        for (Customer customer : customers) {

            // =================================================
            // CUSTOMER STATUS
            // =================================================

            if ("ACTIVE".equalsIgnoreCase(
                    customer.getStatus())) {

                activeCustomers++;

            } else {

                inactiveCustomers++;
            }

            // =================================================
            // KYC STATUS
            // =================================================

            String kycStatus =
                    customer.getKycStatus();

            if ("VERIFIED".equalsIgnoreCase(kycStatus)) {

                verifiedKycCustomers++;

            } else if ("PENDING".equalsIgnoreCase(kycStatus)) {

                pendingKycCustomers++;

            } else if ("REJECTED".equalsIgnoreCase(kycStatus)) {

                rejectedKycCustomers++;
            }

            // =================================================
            // ACCOUNT TYPE
            // =================================================

            String accountType =
                    customer.getAccountType();

            if (accountType != null
                    && !accountType.isBlank()) {

                accountType =
                        accountType.trim().toUpperCase();

                accountTypeSummary.put(
                        accountType,
                        accountTypeSummary.getOrDefault(
                                accountType,
                                0L
                        ) + 1
                );
            }

            // =================================================
            // SAFE CUSTOMER DETAILS
            // =================================================

            Map<String, Object> customerData =
                    new LinkedHashMap<>();

            customerData.put(
                    "id",
                    customer.getId()
            );

            customerData.put(
                    "fullName",
                    customer.getFullName()
            );

            customerData.put(
                    "email",
                    customer.getEmail()
            );

            customerData.put(
                    "phone",
                    customer.getPhone()
            );

            customerData.put(
                    "accountNumber",
                    customer.getAccountNumber()
            );

            customerData.put(
                    "accountType",
                    customer.getAccountType()
            );

            customerData.put(
                    "balance",
                    customer.getBalance()
            );

            customerData.put(
                    "status",
                    customer.getStatus()
            );

            customerData.put(
                    "kycStatus",
                    customer.getKycStatus()
            );

            customerData.put(
                    "createdAt",
                    customer.getCreatedAt()
            );

            customerList.add(customerData);
        }

        return new CustomerReportResponse(
                customers.size(),
                activeCustomers,
                inactiveCustomers,
                verifiedKycCustomers,
                pendingKycCustomers,
                rejectedKycCustomers,
                accountTypeSummary,
                customerList
        );
    }
}