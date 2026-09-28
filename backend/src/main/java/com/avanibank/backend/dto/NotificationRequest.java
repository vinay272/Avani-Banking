package com.avanibank.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;



@Getter
@Setter
@NoArgsConstructor
public class NotificationRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotBlank(message = "Notification type is required")
    @Size(max = 50, message = "Notification type cannot exceed 50 characters")
    private String notificationType;

    @NotBlank(message = "Channel is required")
    @Size(max = 20, message = "Channel cannot exceed 20 characters")
    private String channel;

    @NotBlank(message = "Title is required")
    @Size(max = 150, message = "Title cannot exceed 150 characters")
    private String title;

    @NotBlank(message = "Message is required")
    @Size(max = 5000, message = "Message cannot exceed 5000 characters")
    private String message;

    private String referenceType;
    private Long referenceId;

    public String getReferenceType() {
    return referenceType;
}

public void setReferenceType(String referenceType) {
    this.referenceType = referenceType;
}

public Long getReferenceId() {
    return referenceId;
}

public void setReferenceId(Long referenceId) {
    this.referenceId = referenceId;
}
}