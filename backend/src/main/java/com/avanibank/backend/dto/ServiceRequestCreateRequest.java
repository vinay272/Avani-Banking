package com.avanibank.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ServiceRequestCreateRequest {

    @NotBlank(message = "Request type is required")
    @Size(max = 60, message = "Request type cannot exceed 60 characters")
    private String requestType;

    @NotBlank(message = "Description is required")
    @Size(max = 5000, message = "Description cannot exceed 5000 characters")
    private String description;
}