package com.avanibank.backend.service;

import com.avanibank.backend.entity.Employee;
import com.avanibank.backend.repository.EmployeeRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class StaffAuthService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public StaffAuthService(
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Employee login(String email, String password) {

        Employee employee = employeeRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid staff email or password"
                        )
                );

        if (!passwordEncoder.matches(
                password,
                employee.getPassword()
        )) {
            throw new RuntimeException(
                    "Invalid staff email or password"
            );
        }

        if (!"ACTIVE".equalsIgnoreCase(
                employee.getStatus()
        )) {
            throw new RuntimeException(
                    "Staff account is not active"
            );
        }

        return employee;
    }
}