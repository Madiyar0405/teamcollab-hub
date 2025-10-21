package com.teamcollabhub.backend.task;

import java.util.UUID;

public record TaskUpdateRequest(
        String title,
        String description,
        UUID eventId,
        UUID columnId,
        String priority,
        UUID assignedTo,
        UUID createdBy,
        String dueDate,
        String status
) {}
