package com.avanibank.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ChatMessageRequest {

    @NotBlank(message = "Session ID is required")
    @Size(max = 50, message = "Session ID cannot exceed 50 characters")
    private String sessionId;

    @NotBlank(message = "Message is required")
    @Size(max = 5000, message = "Message cannot exceed 5000 characters")
    private String message;
}