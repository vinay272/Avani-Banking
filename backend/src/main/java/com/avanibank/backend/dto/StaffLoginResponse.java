package com.avanibank.backend.dto;

public class StaffLoginResponse {

    private String message;
    private String token;
    private Long employeeId;
    private String employeeCode;
    private String fullName;
    private String email;
    private String role;
    private String branchCode;

    public StaffLoginResponse() {
    }

    public StaffLoginResponse(
            String message,
            String token,
            Long employeeId,
            String employeeCode,
            String fullName,
            String email,
            String role,
            String branchCode
    ) {
        this.message = message;
        this.token = token;
        this.employeeId = employeeId;
        this.employeeCode = employeeCode;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.branchCode = branchCode;
    }

    public String getMessage() {
        return message;
    }

    public String getToken() {
        return token;
    }

    public Long getEmployeeId() {
        return employeeId;
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
}