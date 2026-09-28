package com.avanibank.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DataRetentionPolicyRequest {

    @NotBlank
    private String policyName;

    @NotBlank
    private String dataType;

    @Min(1)
    private Integer retentionDays;

    @NotBlank
    private String retentionAction;

    private String status;

    private String description;
}