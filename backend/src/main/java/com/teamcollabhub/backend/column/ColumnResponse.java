package com.teamcollabhub.backend.column;

import java.util.UUID;

public record ColumnResponse(
        UUID id,
        String title,
        UUID eventId,
        int order,
        String color
) {}
