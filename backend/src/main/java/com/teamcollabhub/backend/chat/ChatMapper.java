package com.teamcollabhub.backend.chat;

import java.util.Set;
import java.util.stream.Collectors;

public final class ChatMapper {

    private ChatMapper() {
    }

    public static ChatResponse toResponse(Chat chat) {
        Set<java.util.UUID> participants = chat.getParticipants().stream()
                .map(user -> user.getId())
                .collect(Collectors.toSet());
        return new ChatResponse(
                chat.getId(),
                chat.getName(),
                chat.getType() != null ? chat.getType().name().toLowerCase() : null,
                participants,
                chat.getCreatedAt(),
                chat.getLastMessage(),
                chat.getLastMessageTime()
        );
    }

    public static ChatMessageResponse toResponse(ChatMessage message) {
        return new ChatMessageResponse(
                message.getId(),
                message.getChat().getId(),
                message.getUser().getId(),
                message.getMessage(),
                message.getTimestamp(),
                message.getReplyTo() != null ? message.getReplyTo().getId() : null
        );
    }
}
