package com.teamcollabhub.backend.chat;

import java.time.Instant;
import java.util.UUID;

public record ChatMessageResponse(
        UUID id,
        UUID chatId,
        UUID userId,
        String message,
        Instant timestamp,
        UUID replyTo
) {}
