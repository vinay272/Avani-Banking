package com.avanibank.backend.service;

import com.avanibank.backend.dto.EmployeeRequest;
import com.avanibank.backend.dto.EmployeeResponse;
import com.avanibank.backend.entity.Employee;
import com.avanibank.backend.repository.BranchRepository;
import com.avanibank.backend.repository.EmployeeRepository;
import com.avanibank.backend.security.StaffRole;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class EmployeeManagementService {

    private final EmployeeRepository employeeRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeManagementService(
            EmployeeRepository employeeRepository,
            BranchRepository branchRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.employeeRepository = employeeRepository;
        this.branchRepository = branchRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // CREATE EMPLOYEE
    public EmployeeResponse createEmployee(EmployeeRequest request) {

        if (request.getPassword() == null ||
                request.getPassword().isBlank()) {

            throw new RuntimeException(
                    "Password is required when creating an employee"
            );
        }

        if (employeeRepository.existsByEmployeeCode(
                request.getEmployeeCode().trim()
        )) {
            throw new RuntimeException(
                    "Employee code already exists"
            );
        }

        if (employeeRepository.existsByEmail(
                request.getEmail().trim()
        )) {
            throw new RuntimeException(
                    "Employee email already exists"
            );
        }

        String role = validateRole(request.getRole());

        validateBranch(request.getBranchCode());

        Employee employee = new Employee();

        employee.setEmployeeCode(
                request.getEmployeeCode().trim()
        );

        employee.setFullName(
                request.getFullName().trim()
        );

        employee.setEmail(
                request.getEmail().trim()
        );

        employee.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        employee.setRole(role);

        employee.setBranchCode(
                normalizeBranchCode(request.getBranchCode())
        );

        employee.setStatus("ACTIVE");

        Employee savedEmployee =
                employeeRepository.save(employee);

        return new EmployeeResponse(savedEmployee);
    }

    // GET ALL EMPLOYEES
    public List<EmployeeResponse> getAllEmployees() {

        return employeeRepository.findAll()
                .stream()
                .map(EmployeeResponse::new)
                .toList();
    }

    // GET EMPLOYEE BY ID
    public EmployeeResponse getEmployeeById(Long id) {

        Employee employee = employeeRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found with id: " + id
                        )
                );

        return new EmployeeResponse(employee);
    }

    // UPDATE EMPLOYEE
    public EmployeeResponse updateEmployee(
            Long id,
            EmployeeRequest request
    ) {

        Employee employee = employeeRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found with id: " + id
                        )
                );

        String employeeCode =
                request.getEmployeeCode().trim();

        String email =
                request.getEmail().trim();

        if (!employee.getEmployeeCode().equals(employeeCode)
                && employeeRepository.existsByEmployeeCode(
                employeeCode
        )) {
            throw new RuntimeException(
                    "Employee code already exists"
            );
        }

        if (!employee.getEmail().equalsIgnoreCase(email)
                && employeeRepository.existsByEmail(email)) {
            throw new RuntimeException(
                    "Employee email already exists"
            );
        }

        String role = validateRole(request.getRole());

        validateBranch(request.getBranchCode());

        employee.setEmployeeCode(employeeCode);
        employee.setFullName(request.getFullName().trim());
        employee.setEmail(email);
        employee.setRole(role);
        employee.setBranchCode(
                normalizeBranchCode(request.getBranchCode())
        );

        // Password is optional during update
        if (request.getPassword() != null
                && !request.getPassword().isBlank()) {

            employee.setPassword(
                    passwordEncoder.encode(
                            request.getPassword()
                    )
            );
        }

        Employee updatedEmployee =
                employeeRepository.save(employee);

        return new EmployeeResponse(updatedEmployee);
    }

    // ACTIVATE / DEACTIVATE EMPLOYEE
    public EmployeeResponse updateEmployeeStatus(
            Long id,
            String status
    ) {

        Employee employee = employeeRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found with id: " + id
                        )
                );

        if (status == null || status.isBlank()) {
            throw new RuntimeException(
                    "Status is required"
            );
        }

        String normalizedStatus =
                status.trim().toUpperCase();

        if (!normalizedStatus.equals("ACTIVE")
                && !normalizedStatus.equals("INACTIVE")) {

            throw new RuntimeException(
                    "Invalid status. Use ACTIVE or INACTIVE"
            );
        }

        employee.setStatus(normalizedStatus);

        Employee updatedEmployee =
                employeeRepository.save(employee);

        return new EmployeeResponse(updatedEmployee);
    }

    // ROLE VALIDATION
    private String validateRole(String role) {

        if (role == null || role.isBlank()) {
            throw new RuntimeException(
                    "Role is required"
            );
        }

        String normalizedRole =
                role.trim().toUpperCase();

        try {

            StaffRole.valueOf(normalizedRole);

        } catch (IllegalArgumentException exception) {

            throw new RuntimeException(
                    "Invalid staff role. Allowed roles: "
                            + Arrays.toString(StaffRole.values())
            );
        }

        return normalizedRole;
    }

    // BRANCH VALIDATION
    private void validateBranch(String branchCode) {

        if (branchCode == null || branchCode.isBlank()) {
            return;
        }

        String normalizedBranchCode =
                branchCode.trim();

        if (!branchRepository.existsByBranchCode(
                normalizedBranchCode
        )) {

            throw new RuntimeException(
                    "Branch not found with code: "
                            + normalizedBranchCode
            );
        }
    }

    private String normalizeBranchCode(String branchCode) {

        if (branchCode == null || branchCode.isBlank()) {
            return null;
        }

        return branchCode.trim();
    }
}