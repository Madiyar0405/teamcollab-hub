package com.teamcollabhub.backend.auth;

import com.teamcollabhub.backend.user.UserResponse;

public record AuthResponse(
        String token,
        UserResponse user
) {}
