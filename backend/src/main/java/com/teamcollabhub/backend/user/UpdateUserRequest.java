package com.teamcollabhub.backend.user;

public record UpdateUserRequest(
        String name,
        String role,
        String department,
        String avatar,
        String password
) {}
