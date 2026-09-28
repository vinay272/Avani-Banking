package com.avanibank.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DataRetentionDryRunRequest {

    @NotBlank
    private String dataType;

    @Min(1)
    private Integer retentionDays;
}