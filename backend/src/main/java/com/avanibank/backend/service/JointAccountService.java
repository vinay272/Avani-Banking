package com.avanibank.backend.service;

import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.entity.JointAccount;
import com.avanibank.backend.repository.CustomerRepository;
import com.avanibank.backend.repository.JointAccountRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class JointAccountService {

    private final JointAccountRepository jointAccountRepository;
    private final CustomerRepository customerRepository;

    public JointAccountService(
            JointAccountRepository jointAccountRepository,
            CustomerRepository customerRepository) {

        this.jointAccountRepository = jointAccountRepository;
        this.customerRepository = customerRepository;
    }

    // =========================
    // CREATE JOINT ACCOUNT
    // =========================

    public JointAccount createJointAccount(
            Long primaryCustomerId,
            Long jointCustomerId,
            String accountNumber,
            String ownershipType) {

        Customer primaryCustomer = customerRepository
                .findById(primaryCustomerId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Primary customer not found with ID: "
                                        + primaryCustomerId
                        )
                );

        Customer jointCustomer = customerRepository
                .findById(jointCustomerId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Joint customer not found with ID: "
                                        + jointCustomerId
                        )
                );

        if (primaryCustomerId.equals(jointCustomerId)) {
            throw new RuntimeException(
                    "Primary customer and joint customer cannot be the same."
            );
        }

        JointAccount jointAccount = new JointAccount();

        jointAccount.setPrimaryCustomer(primaryCustomer);
        jointAccount.setJointCustomer(jointCustomer);
        jointAccount.setAccountNumber(accountNumber);
        jointAccount.setOwnershipType(ownershipType);
        jointAccount.setStatus("ACTIVE");
        jointAccount.setCreatedAt(LocalDateTime.now());
        jointAccount.setUpdatedAt(LocalDateTime.now());

        return jointAccountRepository.save(jointAccount);
    }

    // =========================
    // GET PRIMARY CUSTOMER
    // =========================

    public List<JointAccount> getPrimaryCustomerAccounts(
            Long customerId) {

        return jointAccountRepository
                .findByPrimaryCustomerId(customerId);
    }

    // =========================
    // GET JOINT CUSTOMER
    // =========================

    public List<JointAccount> getJointCustomerAccounts(
            Long customerId) {

        return jointAccountRepository
                .findByJointCustomerId(customerId);
    }

    // =========================
    // UPDATE STATUS
    // =========================

    public JointAccount updateStatus(
            Long accountId,
            String status) {

        JointAccount jointAccount =
                jointAccountRepository
                        .findById(accountId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Joint account not found with ID: "
                                                + accountId
                                )
                        );

        jointAccount.setStatus(status);
        jointAccount.setUpdatedAt(LocalDateTime.now());

        return jointAccountRepository.save(jointAccount);
    }

    // =========================
    // DELETE JOINT ACCOUNT
    // =========================

    public void deleteJointAccount(Long accountId) {

        JointAccount jointAccount =
                jointAccountRepository
                        .findById(accountId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Joint account not found with ID: "
                                                + accountId
                                )
                        );

        jointAccountRepository.delete(jointAccount);
    }
}