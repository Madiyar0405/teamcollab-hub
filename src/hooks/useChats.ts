import { useState, useEffect } from 'react';
import { chatService } from '@/api/services/chatService';
import { Chat, ChatMessage } from '@/types';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';

export function useChats(userId: string) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchChats();
    }
  }, [userId]);

  const fetchChats = async () => {
    try {
      const data = await chatService.getAll();
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Ошибка загрузки чатов');
    } finally {
      setLoading(false);
    }
  };

  const createPersonalChat = async (otherUserId: string) => {
    try {
      // Проверяем, существует ли уже личный чат
      const existingChat = chats.find(
        chat => chat.type === 'personal' && 
        chat.participants.includes(userId) && 
        chat.participants.includes(otherUserId)
      );

      if (existingChat) {
        return existingChat.id;
      }

      // Создаем новый чат
      const newChat = await chatService.create({
        type: 'personal',
        participantIds: [userId, otherUserId],
      });

      setChats(prev => [...prev, newChat]);
      return newChat.id;
    } catch (error) {
      console.error('Error creating personal chat:', error);
      toast.error('Ошибка создания чата');
      return null;
    }
  };

  const createGroupChat = async (name: string, participantIds: string[]) => {
    try {
      const newChat = await chatService.create({
        type: 'group',
        name,
        participantIds: [userId, ...participantIds],
      });

      setChats(prev => [...prev, newChat]);
      toast.success('Группа создана');
      return newChat.id;
    } catch (error) {
      console.error('Error creating group chat:', error);
      toast.error('Ошибка создания группы');
      return null;
    }
  };

  return {
    chats,
    loading,
    refetch: fetchChats,
    createPersonalChat,
    createGroupChat,
  };
}

export function useChatMessages(chatId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chatId) {
      fetchMessages();
      
      // Опционально: настроить polling для обновления сообщений
      const interval = setInterval(fetchMessages, 5000); // каждые 5 секунд
      
      return () => clearInterval(interval);
    }
  }, [chatId]);

  const fetchMessages = async () => {
    if (!chatId) return;

    try {
      const data = await chatService.getMessages(chatId);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Ошибка загрузки сообщений');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string, replyTo?: string) => {
    if (!chatId) return;

    try {
      const newMessage = await chatService.sendMessage(chatId, {
        message,
        replyTo,
      });
      
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Ошибка отправки сообщения');
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!chatId) return;

    try {
      await chatService.deleteMessage(chatId, messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      toast.success('Сообщение удалено');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Ошибка удаления сообщения');
    }
  };

  return {
    messages,
    loading,
    refetch: fetchMessages,
    sendMessage,
    deleteMessage,
  };
}
