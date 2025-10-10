import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProfiles } from "@/hooks/useProfiles";
import { useAuthStore } from "@/store/useAuthStore";
import { useChats } from "@/hooks/useChats";
import { toast } from "sonner";

interface CreateGroupChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (chatId: string) => void;
}

export const CreateGroupChatDialog = ({
  open,
  onOpenChange,
  onCreated,
}: CreateGroupChatDialogProps) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { user } = useAuthStore();
  const { profiles } = useProfiles();
  const { createGroupChat } = useChats(user?.id || '');

  const handleCreate = async () => {
    if (!groupName.trim()) {
      toast.error("Введите название группы");
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error("Выберите хотя бы одного участника");
      return;
    }

    if (!user) return;

    const chatId = await createGroupChat(groupName, selectedUsers);
    if (chatId) {
      onCreated(chatId);
      setGroupName("");
      setSelectedUsers([]);
    }
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Создать групповой чат</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Название группы</Label>
            <Input
              id="group-name"
              placeholder="Введите название..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Участники ({selectedUsers.length})</Label>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-3">
                {profiles
                  .filter((u) => u.id !== user?.id)
                  .map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-accent p-2 rounded-md"
                      onClick={() => toggleUser(u.id)}
                    >
                      <Checkbox
                        checked={selectedUsers.includes(u.id)}
                        onCheckedChange={() => toggleUser(u.id)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.role}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleCreate}>Создать</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
