import { create } from "zustand";
import { ChatMessage } from "@/types";

interface ChatState {
  messages: ChatMessage[];
  addMessage: (userId: string, message: string, replyTo?: string) => void;
  deleteMessage: (id: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [
    {
      id: "1",
      userId: "1",
      message: "Привет команда! Как продвигается проект?",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "2",
      userId: "2",
      message: "Отлично! Только что завершил дизайн новой страницы",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: "3",
      userId: "3",
      message: "У меня есть вопрос по API интеграции",
      timestamp: new Date(Date.now() - 900000).toISOString(),
    },
  ],
  addMessage: (userId, message, replyTo) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: Date.now().toString(),
          userId,
          message,
          timestamp: new Date().toISOString(),
          replyTo,
        },
      ],
    })),
  deleteMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== id),
    })),
}));
