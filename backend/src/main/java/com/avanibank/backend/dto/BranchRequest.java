package com.avanibank.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BranchRequest {

    @NotBlank
    private String branchCode;

    @NotBlank
    private String branchName;

    private String address;

    private String city;

    private String state;

    private String pincode;

    private String phone;

    @Email
    private String email;

    private String ifscCode;

    private String managerEmployeeCode;

    private String status;
}