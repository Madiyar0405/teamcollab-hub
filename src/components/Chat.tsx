import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Reply, Trash2, Plus, Users, ArrowLeft } from "lucide-react";
import { useChats, useChatMessages } from "@/hooks/useChats";
import { useAuthStore } from "@/store/useAuthStore";
import { useProfiles } from "@/hooks/useProfiles";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { CreateGroupChatDialog } from "@/components/CreateGroupChatDialog";
import { Separator } from "@/components/ui/separator";

interface ChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const Chat = ({ open, onOpenChange }: ChatProps) => {
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [showChatList, setShowChatList] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  
  const { user } = useAuthStore();
  const { chats, createPersonalChat, createGroupChat } = useChats(user?.id || '');
  const { messages, sendMessage, deleteMessage } = useChatMessages(activeChat);
  const { profiles } = useProfiles();
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentChat = chats.find((c) => c.id === activeChat);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !user || !activeChat) return;
    
    await sendMessage(message.trim(), replyTo || undefined);
    setMessage("");
    setReplyTo(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getReplyMessage = (id: string) => {
    return messages.find((msg) => msg.id === id);
  };

  const getChatName = (chat: typeof currentChat) => {
    if (!chat) return "";
    if (chat.type === "group") return chat.name || "Групповой чат";
    
    // For personal chat, show the other user's name
    const otherUserId = chat.participants.find((id) => id !== user?.id);
    const otherUser = profiles.find((u) => u.id === otherUserId);
    return otherUser?.name || "Личный чат";
  };

  const handleStartPersonalChat = async (userId: string) => {
    if (!user) return;
    const chatId = await createPersonalChat(userId);
    if (chatId) {
      setActiveChat(chatId);
      setShowChatList(false);
    }
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChat(chatId);
    setShowChatList(false);
  };

  const getChatParticipants = (chat: typeof currentChat) => {
    if (!chat) return [];
    return profiles.filter((u) => chat.participants.includes(u.id));
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
          <AnimatePresence mode="wait">
            {showChatList ? (
              <motion.div
                key="chat-list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full"
              >
                <SheetHeader className="p-6 pb-4 border-b">
                  <div className="flex items-center justify-between">
                    <SheetTitle>Чаты</SheetTitle>
                    <Button
                      size="sm"
                      onClick={() => setShowCreateGroup(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Создать группу
                    </Button>
                  </div>
                </SheetHeader>

                <ScrollArea className="flex-1">
                  <div className="p-4">
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                        Личные чаты
                      </h3>
                      <div className="space-y-2">
                        {profiles
                          .filter((u) => u.id !== user?.id)
                          .map((u) => (
                            <Button
                              key={u.id}
                              variant="ghost"
                              className="w-full justify-start h-auto p-3"
                              onClick={() => handleStartPersonalChat(u.id)}
                            >
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={u.avatar} />
                                <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 text-left">
                                <p className="font-medium">{u.name}</p>
                                <p className="text-xs text-muted-foreground">{u.role}</p>
                              </div>
                            </Button>
                          ))}
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div>
                      <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                        Групповые чаты
                      </h3>
                      <div className="space-y-2">
                        {chats
                          .filter((c) => c.type === "group")
                          .map((chat) => (
                            <Button
                              key={chat.id}
                              variant="ghost"
                              className="w-full justify-start h-auto p-3"
                              onClick={() => handleSelectChat(chat.id)}
                            >
                              <div className="h-10 w-10 mr-3 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-medium">{chat.name}</p>
                                {chat.lastMessage && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {chat.lastMessage}
                                  </p>
                                )}
                              </div>
                              {chat.lastMessageTime && (
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(chat.lastMessageTime), {
                                    locale: ru,
                                  })}
                                </span>
                              )}
                            </Button>
                          ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </motion.div>
            ) : (
              <motion.div
                key="chat-messages"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col h-full"
              >
                <SheetHeader className="p-6 pb-4 border-b">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowChatList(true)}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                      <SheetTitle>{getChatName(currentChat)}</SheetTitle>
                      {currentChat?.type === "group" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {getChatParticipants(currentChat).length} участников
                        </p>
                      )}
                    </div>
                  </div>
                </SheetHeader>

                <ScrollArea className="flex-1 px-6" ref={scrollRef}>
                  <div className="space-y-4 py-4">
                    {messages.map((msg) => {
                      const sender = profiles.find((u) => u.id === msg.userId);
                      const isOwn = msg.userId === user?.id;
                      const replyMsg = msg.replyTo ? getReplyMessage(msg.replyTo) : null;
                      const replySender = replyMsg
                        ? profiles.find((u) => u.id === replyMsg.userId)
                        : null;

                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                        >
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={sender?.avatar} />
                            <AvatarFallback>{sender?.name.charAt(0)}</AvatarFallback>
                          </Avatar>

                          <div className={`flex-1 max-w-[75%] ${isOwn ? "items-end" : ""}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{sender?.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(msg.timestamp), {
                                  addSuffix: true,
                                  locale: ru,
                                })}
                              </span>
                            </div>

                            <div
                              className={`rounded-lg p-3 ${
                                isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                              }`}
                            >
                              {replyMsg && (
                                <div className="mb-2 pb-2 border-b border-border/50 opacity-70">
                                  <div className="text-xs font-medium mb-1">
                                    Ответ на {replySender?.name}
                                  </div>
                                  <div className="text-xs line-clamp-2">
                                    {replyMsg.message}
                                  </div>
                                </div>
                              )}
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {msg.message}
                              </p>
                            </div>

                            <div className="flex gap-1 mt-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => setReplyTo(msg.id)}
                              >
                                <Reply className="h-3 w-3 mr-1" />
                                Ответить
                              </Button>
                              {isOwn && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs text-destructive"
                                  onClick={() => deleteMessage(msg.id)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Удалить
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  {replyTo && (
                    <div className="mb-2 p-2 bg-muted rounded-md flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium">Ответ на сообщение</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {getReplyMessage(replyTo)?.message}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyTo(null)}
                        className="h-6 w-6 p-0 flex-shrink-0"
                      >
                        ×
                      </Button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Напишите сообщение..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button onClick={handleSend} size="icon" disabled={!message.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SheetContent>
      </Sheet>

      <CreateGroupChatDialog 
        open={showCreateGroup} 
        onOpenChange={setShowCreateGroup}
        onCreated={(chatId) => {
          setShowCreateGroup(false);
          setActiveChat(chatId);
          setShowChatList(false);
        }}
      />
    </>
  );
};
