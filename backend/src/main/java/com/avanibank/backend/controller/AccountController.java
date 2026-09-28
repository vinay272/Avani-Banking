package com.avanibank.backend.controller;

import com.avanibank.backend.dto.AccountResponse;
import com.avanibank.backend.entity.Account;
import com.avanibank.backend.entity.Customer;
import com.avanibank.backend.repository.AccountRepository;
import com.avanibank.backend.service.CustomerService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "*")
public class AccountController {

    private final CustomerService customerService;
    private final AccountRepository accountRepository;

    public AccountController(
            CustomerService customerService,
            AccountRepository accountRepository) {

        this.customerService = customerService;
        this.accountRepository = accountRepository;
    }

    // =====================================================
    // GET LOGGED-IN CUSTOMER ACCOUNTS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<AccountResponse>> getMyAccounts() {

        String email = getLoggedInEmail();

        Customer customer =
                customerService.getCustomerByEmail(email);

        List<Account> accounts =
                accountRepository.findByCustomerId(
                        customer.getId()
                );

        List<AccountResponse> response =
                accounts.stream()
                        .map(AccountResponse::new)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // =====================================================
    // GET ACCOUNT DETAILS
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<AccountResponse> getAccountDetails(
            @PathVariable Long id) {

        String email = getLoggedInEmail();

        Customer customer =
                customerService.getCustomerByEmail(email);

        Account account =
                accountRepository
                        .findByIdAndCustomerId(
                                id,
                                customer.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Account not found"
                                )
                        );

        return ResponseEntity.ok(
                new AccountResponse(account)
        );
    }

    // =====================================================
    // FREEZE ACCOUNT
    // =====================================================

    @PutMapping("/{id}/freeze")
    public ResponseEntity<AccountResponse> freezeAccount(
            @PathVariable Long id) {

        String email = getLoggedInEmail();

        Customer customer =
                customerService.getCustomerByEmail(email);

        Account account =
                accountRepository
                        .findByIdAndCustomerId(
                                id,
                                customer.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Account not found"
                                )
                        );

        if ("CLOSED".equalsIgnoreCase(
                account.getStatus())) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }

        account.setStatus("FROZEN");

        Account updated =
                accountRepository.save(account);

        return ResponseEntity.ok(
                new AccountResponse(updated)
        );
    }

    // =====================================================
    // UNFREEZE ACCOUNT
    // =====================================================

    @PutMapping("/{id}/unfreeze")
    public ResponseEntity<AccountResponse> unfreezeAccount(
            @PathVariable Long id) {

        String email = getLoggedInEmail();

        Customer customer =
                customerService.getCustomerByEmail(email);

        Account account =
                accountRepository
                        .findByIdAndCustomerId(
                                id,
                                customer.getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Account not found"
                                )
                        );

        if ("CLOSED".equalsIgnoreCase(
                account.getStatus())) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }

        account.setStatus("ACTIVE");

        Account updated =
                accountRepository.save(account);

        return ResponseEntity.ok(
                new AccountResponse(updated)
        );
    }

    // =====================================================
    // LOGGED-IN USER EMAIL
    // =====================================================

    private String getLoggedInEmail() {

        return SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();
    }
}