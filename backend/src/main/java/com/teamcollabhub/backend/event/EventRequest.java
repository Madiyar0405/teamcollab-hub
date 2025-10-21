package com.teamcollabhub.backend.event;

import jakarta.validation.constraints.NotBlank;

public record EventRequest(
        @NotBlank String title,
        String description,
        int order
) {}
