package com.teamcollabhub.backend.task;

import java.time.Instant;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        String title,
        String description,
        UUID eventId,
        UUID columnId,
        String priority,
        UUID assignedTo,
        UUID createdBy,
        Instant createdAt,
        Instant updatedAt,
        String status,
        Instant dueDate
) {}
