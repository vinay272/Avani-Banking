package com.avanibank.backend.service;

import com.avanibank.backend.entity.Beneficiary;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.repository.BeneficiaryRepository;
import com.avanibank.backend.repository.CustomerRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final CustomerRepository customerRepository;

    public BeneficiaryService(
            BeneficiaryRepository beneficiaryRepository,
            CustomerRepository customerRepository) {

        this.beneficiaryRepository = beneficiaryRepository;
        this.customerRepository = customerRepository;
    }

    // =========================
    // ADD BENEFICIARY
    // =========================

    public Beneficiary addBeneficiary(
            String email,
            String beneficiaryName,
            String accountNumber) {

        Customer customer = customerRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer account not found"
                        )
                );

        if (beneficiaryName == null ||
                beneficiaryName.trim().isEmpty()) {

            throw new RuntimeException(
                    "Beneficiary name is required"
            );
        }

        if (accountNumber == null ||
                accountNumber.trim().isEmpty()) {

            throw new RuntimeException(
                    "Beneficiary account number is required"
            );
        }

        // Prevent adding own account
        if (customer.getAccountNumber()
                .equals(accountNumber.trim())) {

            throw new RuntimeException(
                    "You cannot add your own account as beneficiary"
            );
        }

        // Check duplicate beneficiary
        if (beneficiaryRepository
                .findByCustomerIdAndAccountNumber(
                        customer.getId(),
                        accountNumber.trim()
                )
                .isPresent()) {

            throw new RuntimeException(
                    "This beneficiary account is already added"
            );
        }

        // Verify receiver account exists
        customerRepository
                .findByAccountNumber(accountNumber.trim())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Beneficiary account not found"
                        )
                );

        Beneficiary beneficiary = new Beneficiary();

        beneficiary.setCustomer(customer);
        beneficiary.setBeneficiaryName(
                beneficiaryName.trim()
        );
        beneficiary.setAccountNumber(
                accountNumber.trim()
        );
        beneficiary.setCreatedAt(
                LocalDateTime.now()
        );

        return beneficiaryRepository.save(beneficiary);
    }

    // =========================
    // GET MY BENEFICIARIES
    // =========================

    public List<Beneficiary> getMyBeneficiaries(
            String email) {

        Customer customer = customerRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer account not found"
                        )
                );

        return beneficiaryRepository
                .findByCustomerIdOrderByCreatedAtDesc(
                        customer.getId()
                );
    }

    // =========================
    // DELETE BENEFICIARY
    // =========================

    public void deleteBeneficiary(
            String email,
            Long beneficiaryId) {

        Customer customer = customerRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer account not found"
                        )
                );

        Beneficiary beneficiary =
                beneficiaryRepository
                        .findByIdAndCustomerId(
                                beneficiaryId,
                                customer.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Beneficiary not found"
                                )
                        );

        beneficiaryRepository.delete(beneficiary);
    }
}