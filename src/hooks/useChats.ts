import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Chat, ChatMessage } from '@/types';
import { toast } from 'sonner';

export function useChats(userId: string) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchChats();

      // Подписка на обновления чатов
      const channel = supabase
        .channel('chats-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chats',
          },
          () => {
            fetchChats();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  const fetchChats = async () => {
    try {
      // Получаем чаты где пользователь участник
      const { data: chatParticipants, error: participantsError } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('user_id', userId);

      if (participantsError) throw participantsError;

      const chatIds = chatParticipants?.map(cp => cp.chat_id) || [];

      if (chatIds.length === 0) {
        setChats([]);
        setLoading(false);
        return;
      }

      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .in('id', chatIds)
        .order('last_message_time', { ascending: false, nullsFirst: false });

      if (chatsError) throw chatsError;

      // Получаем участников для каждого чата
      const chatsWithParticipants = await Promise.all(
        (chatsData || []).map(async (chat) => {
          const { data: participants } = await supabase
            .from('chat_participants')
            .select('user_id')
            .eq('chat_id', chat.id);

          return {
            id: chat.id,
            name: chat.name,
            type: chat.type as 'personal' | 'group',
            participants: participants?.map(p => p.user_id) || [],
            createdAt: chat.created_at,
            lastMessage: chat.last_message,
            lastMessageTime: chat.last_message_time,
          };
        })
      );

      setChats(chatsWithParticipants);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPersonalChat = async (otherUserId: string) => {
    try {
      // Проверяем, существует ли уже личный чат
      const { data: existingParticipants } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('user_id', userId);

      const myChats = existingParticipants?.map(p => p.chat_id) || [];

      if (myChats.length > 0) {
        const { data: otherParticipants } = await supabase
          .from('chat_participants')
          .select('chat_id')
          .eq('user_id', otherUserId)
          .in('chat_id', myChats);

        const commonChats = otherParticipants?.map(p => p.chat_id) || [];

        if (commonChats.length > 0) {
          const { data: existingChat } = await supabase
            .from('chats')
            .select('*')
            .eq('id', commonChats[0])
            .eq('type', 'personal')
            .single();

          if (existingChat) {
            return existingChat.id;
          }
        }
      }

      // Создаем новый чат
      const { data: newChat, error: chatError } = await supabase
        .from('chats')
        .insert({
          type: 'personal',
        })
        .select()
        .single();

      if (chatError) throw chatError;

      // Добавляем участников
      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert([
          { chat_id: newChat.id, user_id: userId },
          { chat_id: newChat.id, user_id: otherUserId },
        ]);

      if (participantsError) throw participantsError;

      await fetchChats();
      return newChat.id;
    } catch (error) {
      console.error('Error creating personal chat:', error);
      toast.error('Ошибка создания чата');
      return null;
    }
  };

  const createGroupChat = async (name: string, participantIds: string[]) => {
    try {
      const { data: newChat, error: chatError } = await supabase
        .from('chats')
        .insert({
          name,
          type: 'group',
        })
        .select()
        .single();

      if (chatError) throw chatError;

      const participants = [userId, ...participantIds].map(id => ({
        chat_id: newChat.id,
        user_id: id,
      }));

      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert(participants);

      if (participantsError) throw participantsError;

      toast.success('Группа создана');
      await fetchChats();
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

      // Подписка на новые сообщения
      const channel = supabase
        .channel(`chat-${chatId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `chat_id=eq.${chatId}`,
          },
          () => {
            fetchMessages();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [chatId]);

  const fetchMessages = async () => {
    if (!chatId) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const messagesData: ChatMessage[] = (data || []).map(m => ({
        id: m.id,
        chatId: m.chat_id,
        userId: m.user_id,
        message: m.message,
        timestamp: m.created_at,
        replyTo: m.reply_to || undefined,
      }));

      setMessages(messagesData);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string, replyTo?: string) => {
    if (!chatId) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          message,
          reply_to: replyTo,
        });

      if (error) throw error;

      // Обновляем последнее сообщение в чате
      await supabase
        .from('chats')
        .update({
          last_message: message,
          last_message_time: new Date().toISOString(),
        })
        .eq('id', chatId);

      // Сообщение появится через realtime subscription
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Ошибка отправки сообщения');
    }
  };

  const deleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      await fetchMessages();
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
