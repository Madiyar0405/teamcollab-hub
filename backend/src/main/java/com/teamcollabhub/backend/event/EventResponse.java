package com.teamcollabhub.backend.event;

import java.time.Instant;
import java.util.UUID;

public record EventResponse(
        UUID id,
        String title,
        String description,
        Instant createdAt,
        int order
) {}
