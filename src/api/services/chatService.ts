import { apiClient } from '../client';
import { Chat, ChatMessage } from '@/types';

export interface CreateChatRequest {
  type: 'personal' | 'group';
  name?: string;
  participantIds: string[];
}

export interface SendMessageRequest {
  message: string;
  replyTo?: string;
}

export const chatService = {
  // Chats
  getAll: async (): Promise<Chat[]> => {
    const response = await apiClient.get<Chat[]>('/chats');
    return response.data;
  },

  getById: async (id: string): Promise<Chat> => {
    const response = await apiClient.get<Chat>(`/chats/${id}`);
    return response.data;
  },

  create: async (data: CreateChatRequest): Promise<Chat> => {
    const response = await apiClient.post<Chat>('/chats', data);
    return response.data;
  },

  // Messages
  getMessages: async (chatId: string): Promise<ChatMessage[]> => {
    const response = await apiClient.get<ChatMessage[]>(`/chats/${chatId}/messages`);
    return response.data;
  },

  sendMessage: async (chatId: string, data: SendMessageRequest): Promise<ChatMessage> => {
    const response = await apiClient.post<ChatMessage>(`/chats/${chatId}/messages`, data);
    return response.data;
  },

  deleteMessage: async (chatId: string, messageId: string): Promise<void> => {
    await apiClient.delete(`/chats/${chatId}/messages/${messageId}`);
  },
};
