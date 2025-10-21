package com.teamcollabhub.backend.chat;

import jakarta.validation.constraints.NotEmpty;

import java.util.Set;
import java.util.UUID;

public record ChatRequest(
        String name,
        String type,
        @NotEmpty Set<UUID> participants
) {}
