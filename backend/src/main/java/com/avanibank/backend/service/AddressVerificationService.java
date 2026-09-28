package com.avanibank.backend.service;

import com.avanibank.backend.entity.AddressVerification;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.repository.AddressVerificationRepository;
import com.avanibank.backend.repository.CustomerRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AddressVerificationService {

    private final AddressVerificationRepository addressVerificationRepository;
    private final CustomerRepository customerRepository;

    public AddressVerificationService(
            AddressVerificationRepository addressVerificationRepository,
            CustomerRepository customerRepository) {

        this.addressVerificationRepository =
                addressVerificationRepository;

        this.customerRepository = customerRepository;
    }

    // =========================
    // CREATE / UPDATE ADDRESS
    // =========================

    public AddressVerification saveAddressVerification(
            Long customerId,
            String address,
            String city,
            String state,
            String pincode,
            String status,
            String remarks) {

        Customer customer = customerRepository
                .findById(customerId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Customer not found with ID: "
                                        + customerId
                        )
                );

        Optional<AddressVerification> existing =
                addressVerificationRepository
                        .findByCustomerId(customerId);

        AddressVerification verification;

        if (existing.isPresent()) {
            verification = existing.get();
        } else {
            verification = new AddressVerification();

            verification.setCustomer(customer);
            verification.setCreatedAt(
                    LocalDateTime.now()
            );
        }

        verification.setAddress(address);
        verification.setCity(city);
        verification.setState(state);
        verification.setPincode(pincode);
        verification.setStatus(status);
        verification.setRemarks(remarks);

        verification.setUpdatedAt(
                LocalDateTime.now()
        );

        return addressVerificationRepository.save(
                verification
        );
    }

    // =========================
    // GET CUSTOMER ADDRESS
    // =========================

    public AddressVerification getAddressVerification(
            Long customerId) {

        return addressVerificationRepository
                .findByCustomerId(customerId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Address verification not found "
                                        + "for customer ID: "
                                        + customerId
                        )
                );
    }

    // =========================
    // DELETE ADDRESS VERIFICATION
    // =========================

    public void deleteAddressVerification(
            Long customerId) {

        AddressVerification verification =
                addressVerificationRepository
                        .findByCustomerId(customerId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Address verification not found "
                                                + "for customer ID: "
                                                + customerId
                                )
                        );

        addressVerificationRepository.delete(
                verification
        );
    }
}