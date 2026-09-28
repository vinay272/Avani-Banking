package com.avanibank.backend.service;

import com.avanibank.backend.dto.RegisterRequest;
import com.avanibank.backend.entity.Account;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.repository.AccountRepository;
import com.avanibank.backend.repository.CustomerRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomerService {

        private final CustomerRepository customerRepository;
        private final PasswordEncoder passwordEncoder;
        private final AccountRepository accountRepository;

        // =========================
        // CONSTRUCTOR
        // =========================

        public CustomerService(
                        CustomerRepository customerRepository,
                        PasswordEncoder passwordEncoder,
                        AccountRepository accountRepository) {

                this.customerRepository = customerRepository;
                this.passwordEncoder = passwordEncoder;
                this.accountRepository = accountRepository;
        }

        // =========================
        // GENERATE ACCOUNT NUMBER
        // =========================

        private String generateAccountNumber() {

                long number = 1000000000L
                                + (long) (Math.random() * 9000000000L);

                return String.valueOf(number);
        }

        // =========================
        // GENERATE IFSC CODE
        // =========================

        private String generateIfscCode() {

                return "AVNI0" +
                                String.format(
                                                "%06d",
                                                (long) (Math.random() * 1000000));
        }

        // =========================
        // CREATE ACCOUNT FOR CUSTOMER
        // =========================

        private Account createAccountForCustomer(
                        Customer customer,
                        String accountNumber,
                        String accountType) {

                Account account = new Account();

                account.setCustomer(customer);
                account.setAccountNumber(accountNumber);

                // Avani Bank IFSC
                account.setIfscCode("AVNB0000001");

                account.setAccountType(accountType);
                
                account.setBalance(customer.getBalance() != null
                                ? customer.getBalance()
                                : 0.0);
                account.setStatus("ACTIVE");
                account.setInterestRate(0.0);

                // =========================
                // GENERATE IFSC
                // =========================

                account.setIfscCode(
                                generateIfscCode());

                return accountRepository.save(account);
        }

        // =========================
        // REGISTER CUSTOMER
        // =========================

        @Transactional
        public Customer registerCustomer(RegisterRequest request) {

                // -------------------------
                // CHECK EMAIL
                // -------------------------

                if (customerRepository.existsByEmail(request.getEmail())) {
                        throw new RuntimeException(
                                        "Email already registered");
                }

                // -------------------------
                // CHECK PHONE
                // -------------------------

                if (customerRepository.existsByPhone(request.getPhone())) {
                        throw new RuntimeException(
                                        "Phone number already registered");
                }

                // -------------------------
                // CREATE CUSTOMER
                // -------------------------

                Customer customer = new Customer();

                customer.setFullName(request.getFullName());
                customer.setEmail(request.getEmail());
                customer.setPhone(request.getPhone());

                customer.setPassword(
                                passwordEncoder.encode(
                                                request.getPassword()));

                customer.setAccountType(
                                request.getAccountType());

                // -------------------------
                // INITIAL CUSTOMER VALUES
                // -------------------------

                customer.setBalance(0.0);
                customer.setStatus("ACTIVE");

                // -------------------------
                // GENERATE UNIQUE ACCOUNT NUMBER
                // -------------------------

                String accountNumber;

                do {
                        accountNumber = generateAccountNumber();

                } while (customerRepository.existsByAccountNumber(
                                accountNumber)
                                ||
                                accountRepository.existsByAccountNumber(
                                                accountNumber));

                customer.setAccountNumber(accountNumber);

                // -------------------------
                // SAVE CUSTOMER FIRST
                // -------------------------

                Customer savedCustomer = customerRepository.save(customer);

                // -------------------------
                // CREATE ACCOUNT TABLE RECORD
                // -------------------------

                createAccountForCustomer(
                                savedCustomer,
                                accountNumber,
                                request.getAccountType());

                // -------------------------
                // RETURN CUSTOMER
                // -------------------------

                return savedCustomer;
        }

        // =========================
        // CREATE CUSTOMER
        // =========================

        @Transactional
        public Customer createCustomer(Customer customer) {

                // -------------------------
                // CHECK EMAIL
                // -------------------------

                if (customerRepository.existsByEmail(
                                customer.getEmail())) {

                        throw new RuntimeException(
                                        "Email already registered");
                }

                // -------------------------
                // CHECK PHONE
                // -------------------------

                if (customerRepository.existsByPhone(
                                customer.getPhone())) {

                        throw new RuntimeException(
                                        "Phone number already registered");
                }

                // -------------------------
                // GENERATE ACCOUNT NUMBER
                // IF NOT PROVIDED
                // -------------------------

                String accountNumber = customer.getAccountNumber();

                if (accountNumber == null
                                || accountNumber.trim().isEmpty()) {

                        do {

                                accountNumber = generateAccountNumber();

                        } while (customerRepository.existsByAccountNumber(
                                        accountNumber)
                                        ||
                                        accountRepository.existsByAccountNumber(
                                                        accountNumber));

                        customer.setAccountNumber(accountNumber);

                } else {

                        // -------------------------
                        // CHECK PROVIDED ACCOUNT NUMBER
                        // -------------------------

                        if (customerRepository.existsByAccountNumber(
                                        accountNumber)) {

                                throw new RuntimeException(
                                                "Account number already exists");
                        }

                        if (accountRepository.existsByAccountNumber(
                                        accountNumber)) {

                                throw new RuntimeException(
                                                "Account number already exists");
                        }
                }

                // -------------------------
                // DEFAULT VALUES
                // -------------------------

                if (customer.getBalance() == null) {
                        customer.setBalance(0.0);
                }

                if (customer.getStatus() == null
                                || customer.getStatus().trim().isEmpty()) {

                        customer.setStatus("ACTIVE");
                }

                // -------------------------
                // ENCRYPT PASSWORD
                // -------------------------

                customer.setPassword(
                                passwordEncoder.encode(
                                                customer.getPassword()));

                // -------------------------
                // SAVE CUSTOMER
                // -------------------------

                Customer savedCustomer = customerRepository.save(customer);

                // -------------------------
                // CREATE ACCOUNT
                // -------------------------

                createAccountForCustomer(
                                savedCustomer,
                                accountNumber,
                                savedCustomer.getAccountType());

                // -------------------------
                // RETURN CUSTOMER
                // -------------------------

                return savedCustomer;
        }

        // =========================
        // GET ALL CUSTOMERS
        // =========================

        public List<Customer> getAllCustomers() {

                return customerRepository.findAll();
        }

        // =========================
        // GET CUSTOMER BY ID
        // =========================

        public Customer getCustomerById(Long id) {

                return customerRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException(
                                                "Customer not found"));
        }

        // =========================
        // GET CUSTOMER BY EMAIL
        // =========================

        public Customer getCustomerByEmail(
                        String email) {

                return customerRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException(
                                                "Customer not found"));
        }

        // =========================
        // UPDATE CUSTOMER
        // =========================

        public Customer updateCustomer(
                        Long id,
                        Customer updatedCustomer) {

                Customer existingCustomer = getCustomerById(id);

                existingCustomer.setFullName(
                                updatedCustomer.getFullName());

                existingCustomer.setPhone(
                                updatedCustomer.getPhone());

                existingCustomer.setAccountType(
                                updatedCustomer.getAccountType());

                existingCustomer.setStatus(
                                updatedCustomer.getStatus());

                return customerRepository.save(
                                existingCustomer);
        }

        // =========================
        // CHANGE PASSWORD
        // =========================

        public void changePassword(
                        String email,
                        String currentPassword,
                        String newPassword) {

                Customer customer = customerRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException(
                                                "Customer not found"));

                // -------------------------
                // CHECK CURRENT PASSWORD
                // -------------------------

                if (!passwordEncoder.matches(
                                currentPassword,
                                customer.getPassword())) {

                        throw new RuntimeException(
                                        "Current password is incorrect");
                }

                // -------------------------
                // VALIDATE NEW PASSWORD
                // -------------------------

                if (newPassword == null
                                || newPassword.trim().isEmpty()) {

                        throw new RuntimeException(
                                        "New password cannot be empty");
                }

                if (newPassword.length() < 6) {

                        throw new RuntimeException(
                                        "New password must be at least 6 characters");
                }

                // -------------------------
                // PREVENT SAME PASSWORD
                // -------------------------

                if (passwordEncoder.matches(
                                newPassword,
                                customer.getPassword())) {

                        throw new RuntimeException(
                                        "New password must be different from current password");
                }

                // -------------------------
                // ENCRYPT NEW PASSWORD
                // -------------------------

                customer.setPassword(
                                passwordEncoder.encode(
                                                newPassword));

                customerRepository.save(customer);
        }

        // =========================
        // DELETE CUSTOMER
        // =========================

        public void deleteCustomer(Long id) {

                Customer customer = getCustomerById(id);

                customerRepository.delete(customer);
        }

        // =====================================================
        // SAVE CUSTOMER
        // =====================================================

        public Customer saveCustomer(Customer customer) {

                return customerRepository.save(customer);
        }

}