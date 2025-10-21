package com.teamcollabhub.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@ConfigurationProperties(prefix = "app.cors")
public class CorsProperties {

    private static final List<String> DEFAULT_ALLOWED_ORIGINS = List.of(
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:4173",
            "http://localhost:3000",
            "http://localhost:8080",
            "http://localhost:8081"
    );

    private List<String> allowedOrigins = new ArrayList<>(DEFAULT_ALLOWED_ORIGINS);

    public List<String> getAllowedOrigins() {
        return allowedOrigins;
    }

    public void setAllowedOrigins(List<String> allowedOrigins) {
        if (allowedOrigins == null || allowedOrigins.isEmpty()) {
            this.allowedOrigins = new ArrayList<>(DEFAULT_ALLOWED_ORIGINS);
        } else {
            this.allowedOrigins = allowedOrigins.stream()
                    .map(String::trim)
                    .filter(origin -> !origin.isEmpty())
                    .collect(Collectors.toList());
        }
    }
}
