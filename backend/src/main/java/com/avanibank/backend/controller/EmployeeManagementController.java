package com.avanibank.backend.controller;

import com.avanibank.backend.dto.EmployeeRequest;
import com.avanibank.backend.dto.EmployeeResponse;
import com.avanibank.backend.service.EmployeeManagementService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/employees")
@CrossOrigin(origins = "http://localhost:5173")
public class EmployeeManagementController {

    private final EmployeeManagementService
            employeeManagementService;

    public EmployeeManagementController(
            EmployeeManagementService employeeManagementService
    ) {
        this.employeeManagementService =
                employeeManagementService;
    }

    // CREATE EMPLOYEE
    @PostMapping
    public ResponseEntity<EmployeeResponse> createEmployee(
            @Valid @RequestBody EmployeeRequest request
    ) {

        EmployeeResponse response =
                employeeManagementService.createEmployee(request);

        return ResponseEntity.ok(response);
    }

    // GET ALL EMPLOYEES
    @GetMapping
    public ResponseEntity<List<EmployeeResponse>> getAllEmployees() {

        return ResponseEntity.ok(
                employeeManagementService.getAllEmployees()
        );
    }

    // GET EMPLOYEE BY ID
    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponse> getEmployeeById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                employeeManagementService.getEmployeeById(id)
        );
    }

    // UPDATE EMPLOYEE
    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponse> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequest request
    ) {

        EmployeeResponse response =
                employeeManagementService.updateEmployee(
                        id,
                        request
                );

        return ResponseEntity.ok(response);
    }

    // ACTIVATE / DEACTIVATE
    @PutMapping("/{id}/status")
    public ResponseEntity<EmployeeResponse> updateEmployeeStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {

        EmployeeResponse response =
                employeeManagementService.updateEmployeeStatus(
                        id,
                        status
                );

        return ResponseEntity.ok(response);
    }
}