package com.teamcollabhub.backend.task;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record TaskRequest(
        @NotBlank String title,
        String description,
        @NotNull UUID eventId,
        @NotNull UUID columnId,
        String priority,
        UUID assignedTo,
        UUID createdBy,
        String dueDate,
        String status
) {}
