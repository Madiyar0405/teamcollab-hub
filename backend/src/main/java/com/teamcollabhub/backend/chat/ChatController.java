package com.teamcollabhub.backend.chat;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping
    public List<ChatResponse> getChats() {
        return chatService.findAll().stream()
                .map(ChatMapper::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public ChatResponse getChat(@PathVariable UUID id) {
        return ChatMapper.toResponse(chatService.getById(id));
    }

    @PostMapping
    public ChatResponse createChat(@Valid @RequestBody ChatRequest request) {
        return ChatMapper.toResponse(chatService.create(request));
    }

    @GetMapping("/{chatId}/messages")
    public List<ChatMessageResponse> getMessages(@PathVariable UUID chatId) {
        return chatService.getMessages(chatId).stream()
                .map(ChatMapper::toResponse)
                .toList();
    }

    @PostMapping("/{chatId}/messages")
    public ChatMessageResponse createMessage(@PathVariable UUID chatId,
                                             @Valid @RequestBody ChatMessageRequest request) {
        return ChatMapper.toResponse(chatService.createMessage(chatId, request));
    }

    @DeleteMapping("/{chatId}/messages/{messageId}")
    public void deleteMessage(@PathVariable UUID chatId, @PathVariable UUID messageId) {
        chatService.deleteMessage(chatId, messageId);
    }
}
