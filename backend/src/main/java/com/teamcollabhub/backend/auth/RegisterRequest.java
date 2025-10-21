package com.teamcollabhub.backend.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank String name,
        @Email String email,
        @Size(min = 6, message = "Password must be at least 6 characters long") String password,
        @NotBlank String department
) {}
