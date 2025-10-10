import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Reply, Trash2 } from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { mockUsers } from "@/data/mockData";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { motion } from "framer-motion";

interface ChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const Chat = ({ open, onOpenChange }: ChatProps) => {
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const { messages, addMessage, deleteMessage } = useChatStore();
  const { user } = useAuthStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || !user) return;
    addMessage(user.id, message.trim(), replyTo || undefined);
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 border-b">
          <SheetTitle>Командный чат</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {messages.map((msg) => {
              const sender = mockUsers.find((u) => u.id === msg.userId);
              const isOwn = msg.userId === user?.id;
              const replyMsg = msg.replyTo ? getReplyMessage(msg.replyTo) : null;
              const replySender = replyMsg ? mockUsers.find((u) => u.id === replyMsg.userId) : null;

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
                        isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {replyMsg && (
                        <div className="mb-2 pb-2 border-b border-border/50 opacity-70">
                          <div className="text-xs font-medium mb-1">
                            Ответ на {replySender?.name}
                          </div>
                          <div className="text-xs line-clamp-2">{replyMsg.message}</div>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
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
      </SheetContent>
    </Sheet>
  );
};
