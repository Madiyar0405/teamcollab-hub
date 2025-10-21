package com.teamcollabhub.backend.user;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String name,
        String email,
        String avatar,
        String role,
        String department,
        int activeTasks,
        int completedTasks,
        Instant joinedDate
) {}
