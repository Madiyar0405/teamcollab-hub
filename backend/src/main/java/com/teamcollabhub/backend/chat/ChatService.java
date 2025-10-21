package com.teamcollabhub.backend.chat;

import com.teamcollabhub.backend.exception.ResourceNotFoundException;
import com.teamcollabhub.backend.user.User;
import com.teamcollabhub.backend.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
public class ChatService {

    private final ChatRepository chatRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;

    public ChatService(ChatRepository chatRepository,
                       ChatMessageRepository messageRepository,
                       UserRepository userRepository) {
        this.chatRepository = chatRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    public List<Chat> findAll() {
        return chatRepository.findAll();
    }

    public Chat getById(UUID id) {
        return chatRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chat not found"));
    }

    public Chat create(ChatRequest request) {
        Chat chat = new Chat();
        chat.setName(request.name());
        chat.setType(parseType(request.type()));
        chat.setParticipants(resolveParticipants(request.participants()));
        return chatRepository.save(chat);
    }

    public List<ChatMessage> getMessages(UUID chatId) {
        return messageRepository.findByChatIdOrderByTimestampAsc(chatId);
    }

    public ChatMessage createMessage(UUID chatId, ChatMessageRequest request) {
        Chat chat = getById(chatId);
        User user = resolveUser(request.userId());
        ChatMessage message = new ChatMessage();
        message.setChat(chat);
        message.setUser(user);
        message.setMessage(request.message());
        message.setTimestamp(request.timestamp() != null ? request.timestamp() : Instant.now());
        if (request.replyTo() != null) {
            ChatMessage reply = messageRepository.findById(request.replyTo())
                    .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
            message.setReplyTo(reply);
        }
        ChatMessage saved = messageRepository.save(message);
        chat.setLastMessage(saved.getMessage());
        chat.setLastMessageTime(saved.getTimestamp());
        chatRepository.save(chat);
        return saved;
    }

    public void deleteMessage(UUID chatId, UUID messageId) {
        ChatMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
        if (!message.getChat().getId().equals(chatId)) {
            throw new ResourceNotFoundException("Message not found in chat");
        }
        messageRepository.delete(message);
    }

    private ChatType parseType(String type) {
        if (type == null) {
            return ChatType.GROUP;
        }
        try {
            return ChatType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ChatType.GROUP;
        }
    }

    private Set<User> resolveParticipants(Set<UUID> participantIds) {
        Set<User> participants = new HashSet<>();
        if (participantIds == null) {
            return participants;
        }
        for (UUID id : participantIds) {
            participants.add(resolveUser(id));
        }
        return participants;
    }

    private User resolveUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
