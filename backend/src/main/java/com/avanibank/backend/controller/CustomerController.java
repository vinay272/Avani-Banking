package com.avanibank.backend.controller;

import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.service.CustomerService;
import com.avanibank.backend.dto.ChangePasswordRequest;
import com.avanibank.backend.dto.CustomerProfileResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    // Create Customer
    @PostMapping
    public ResponseEntity<Customer> createCustomer(
            @RequestBody Customer customer) {

        Customer savedCustomer = customerService.createCustomer(customer);

        return new ResponseEntity<>(savedCustomer, HttpStatus.CREATED);
    }

    // Get All Customers
    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers() {

        return ResponseEntity.ok(
                customerService.getAllCustomers()
        );
    }

    // Get Customer By ID
    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                customerService.getCustomerById(id)
        );
    }

    // Get Customer By Email
    @GetMapping("/email/{email}")
    public ResponseEntity<Customer> getCustomerByEmail(
            @PathVariable String email) {

        return ResponseEntity.ok(
                customerService.getCustomerByEmail(email)
        );
    }

    // Get Logged-in Customer
    @GetMapping("/me")
    public ResponseEntity<CustomerProfileResponse> getLoggedInCustomer() {

    String email = SecurityContextHolder
            .getContext()
            .getAuthentication()
            .getName();

    Customer customer =
            customerService.getCustomerByEmail(email);

    return ResponseEntity.ok(
            new CustomerProfileResponse(customer)
    );
    }

    // Update Customer
    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(
            @PathVariable Long id,
            @RequestBody Customer customer) {

        return ResponseEntity.ok(
                customerService.updateCustomer(id, customer)
        );
    }
    // Change Password
    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(
        @RequestBody ChangePasswordRequest request) {

    String email = SecurityContextHolder
            .getContext()
            .getAuthentication()
            .getName();

    customerService.changePassword(
            email,
            request.getCurrentPassword(),
            request.getNewPassword()
    );

    return ResponseEntity.ok(
            "Password changed successfully"
    );
}
    // Delete Customer
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCustomer(
            @PathVariable Long id) {

        customerService.deleteCustomer(id);

        return ResponseEntity.ok("Customer deleted successfully");
    }
}