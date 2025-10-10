import { create } from "zustand";
import { ChatMessage, Chat } from "@/types";

interface ChatState {
  chats: Chat[];
  messages: ChatMessage[];
  activeChat: string | null;
  createPersonalChat: (userId: string, currentUserId: string) => string;
  createGroupChat: (name: string, participants: string[]) => void;
  setActiveChat: (chatId: string) => void;
  addMessage: (chatId: string, userId: string, message: string, replyTo?: string) => void;
  deleteMessage: (id: string) => void;
  getMessagesForChat: (chatId: string) => ChatMessage[];
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [
    {
      id: "general",
      name: "Общий чат",
      type: "group",
      participants: ["1", "2", "3", "4"],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      lastMessage: "У меня есть вопрос по API интеграции",
      lastMessageTime: new Date(Date.now() - 900000).toISOString(),
    },
  ],
  messages: [
    {
      id: "1",
      chatId: "general",
      userId: "1",
      message: "Привет команда! Как продвигается проект?",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "2",
      chatId: "general",
      userId: "2",
      message: "Отлично! Только что завершил дизайн новой страницы",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: "3",
      chatId: "general",
      userId: "3",
      message: "У меня есть вопрос по API интеграции",
      timestamp: new Date(Date.now() - 900000).toISOString(),
    },
  ],
  activeChat: "general",

  createPersonalChat: (userId, currentUserId) => {
    const state = get();
    
    // Check if personal chat already exists
    const existingChat = state.chats.find(
      (chat) =>
        chat.type === "personal" &&
        chat.participants.includes(userId) &&
        chat.participants.includes(currentUserId)
    );

    if (existingChat) {
      return existingChat.id;
    }

    // Create new personal chat
    const chatId = `personal-${currentUserId}-${userId}-${Date.now()}`;
    const newChat: Chat = {
      id: chatId,
      type: "personal",
      participants: [currentUserId, userId],
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      chats: [...state.chats, newChat],
    }));

    return chatId;
  },

  createGroupChat: (name, participants) =>
    set((state) => ({
      chats: [
        ...state.chats,
        {
          id: `group-${Date.now()}`,
          name,
          type: "group",
          participants,
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  setActiveChat: (chatId) => set({ activeChat: chatId }),

  addMessage: (chatId, userId, message, replyTo) =>
    set((state) => {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        chatId,
        userId,
        message,
        timestamp: new Date().toISOString(),
        replyTo,
      };

      // Update last message in chat
      const updatedChats = state.chats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              lastMessage: message,
              lastMessageTime: newMessage.timestamp,
            }
          : chat
      );

      return {
        messages: [...state.messages, newMessage],
        chats: updatedChats,
      };
    }),

  deleteMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== id),
    })),

  getMessagesForChat: (chatId) => {
    return get().messages.filter((msg) => msg.chatId === chatId);
  },
}));
