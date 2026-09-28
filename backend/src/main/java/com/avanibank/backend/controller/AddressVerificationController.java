package com.avanibank.backend.controller;

import com.avanibank.backend.entity.AddressVerification;
import com.avanibank.backend.service.AddressVerificationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/address-verification")
@CrossOrigin(origins = "*")
public class AddressVerificationController {

    private final AddressVerificationService
            addressVerificationService;

    public AddressVerificationController(
            AddressVerificationService addressVerificationService) {

        this.addressVerificationService =
                addressVerificationService;
    }

    // =========================
    // CREATE / UPDATE ADDRESS
    // =========================

    @PostMapping("/customer/{customerId}")
    public ResponseEntity<AddressVerification>
    saveAddressVerification(
            @PathVariable Long customerId,
            @RequestParam String address,
            @RequestParam String city,
            @RequestParam String state,
            @RequestParam String pincode,
            @RequestParam String status,
            @RequestParam(required = false) String remarks) {

        AddressVerification verification =
                addressVerificationService
                        .saveAddressVerification(
                                customerId,
                                address,
                                city,
                                state,
                                pincode,
                                status,
                                remarks
                        );

        return ResponseEntity.ok(verification);
    }

    // =========================
    // GET CUSTOMER ADDRESS
    // =========================

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<AddressVerification>
    getAddressVerification(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                addressVerificationService
                        .getAddressVerification(customerId)
        );
    }

    // =========================
    // DELETE ADDRESS
    // =========================

    @DeleteMapping("/customer/{customerId}")
    public ResponseEntity<String>
    deleteAddressVerification(
            @PathVariable Long customerId) {

        addressVerificationService
                .deleteAddressVerification(customerId);

        return ResponseEntity.ok(
                "Address verification deleted successfully."
        );
    }
}