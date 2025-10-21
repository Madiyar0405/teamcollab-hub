package com.teamcollabhub.backend.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public record ChatMessageRequest(
        @NotNull UUID userId,
        @NotBlank String message,
        Instant timestamp,
        UUID replyTo
) {}
