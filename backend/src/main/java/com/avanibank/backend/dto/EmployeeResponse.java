package com.avanibank.backend.dto;

import com.avanibank.backend.entity.Employee;

import java.time.LocalDateTime;

public class EmployeeResponse {

    private Long id;
    private String employeeCode;
    private String fullName;
    private String email;
    private String role;
    private String branchCode;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public EmployeeResponse() {
    }

    public EmployeeResponse(Employee employee) {

        this.id = employee.getId();
        this.employeeCode = employee.getEmployeeCode();
        this.fullName = employee.getFullName();
        this.email = employee.getEmail();
        this.role = employee.getRole();
        this.branchCode = employee.getBranchCode();
        this.status = employee.getStatus();
        this.createdAt = employee.getCreatedAt();
        this.updatedAt = employee.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getBranchCode() {
        return branchCode;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}