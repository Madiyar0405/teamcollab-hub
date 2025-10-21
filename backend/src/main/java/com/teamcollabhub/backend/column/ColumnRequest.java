package com.teamcollabhub.backend.column;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ColumnRequest(
        @NotBlank String title,
        @NotNull UUID eventId,
        int order,
        String color
) {}
