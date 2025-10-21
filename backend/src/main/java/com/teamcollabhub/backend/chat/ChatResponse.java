package com.teamcollabhub.backend.chat;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record ChatResponse(
        UUID id,
        String name,
        String type,
        Set<UUID> participants,
        Instant createdAt,
        String lastMessage,
        Instant lastMessageTime
) {}
