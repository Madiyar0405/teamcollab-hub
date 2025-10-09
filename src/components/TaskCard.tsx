import { Task } from "@/types";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MoreVertical, Trash2, User, Clock, FileText } from "lucide-react";
import { mockUsers } from "@/data/mockData";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useTaskStore } from "@/store/useTaskStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskCardProps {
  task: Task;
}

const priorityColors = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-warning/20 text-warning-foreground border-warning/50",
  high: "bg-destructive/20 text-destructive-foreground border-destructive/50",
};

const priorityLabels = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

export const TaskCard = ({ task }: TaskCardProps) => {
  const { deleteTask, events, columns } = useTaskStore();
  const assignedUser = mockUsers.find((u) => u.id === task.assignedTo);
  const createdByUser = mockUsers.find((u) => u.id === task.createdBy);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const taskEvent = events.find((e) => e.id === task.eventId);
  const taskColumn = columns.find((c) => c.id === task.columnId);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{task.title}</DialogTitle>
            <DialogDescription>Подробная информация о задаче</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Description */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold">Описание</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {task.description}
              </p>
            </div>

            <Separator />

            {/* Priority & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Приоритет</p>
                <Badge variant="outline" className={priorityColors[task.priority]}>
                  {priorityLabels[task.priority]}
                </Badge>
              </div>
              {task.dueDate && (
                <div>
                  <p className="text-sm font-medium mb-2">Срок выполнения</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(task.dueDate)}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Event & Column */}
            <div className="grid grid-cols-2 gap-4">
              {taskEvent && (
                <div>
                  <p className="text-sm font-medium mb-2">Событие</p>
                  <Badge variant="secondary">{taskEvent.title}</Badge>
                </div>
              )}
              {taskColumn && (
                <div>
                  <p className="text-sm font-medium mb-2">Колонка</p>
                  <Badge variant="secondary">{taskColumn.title}</Badge>
                </div>
              )}
            </div>

            <Separator />

            {/* Assigned User */}
            {assignedUser && (
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold">Исполнитель</h3>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={assignedUser.avatar} alt={assignedUser.name} />
                    <AvatarFallback>{assignedUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{assignedUser.name}</p>
                    <p className="text-xs text-muted-foreground">{assignedUser.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Created By */}
            {createdByUser && (
              <div>
                <p className="text-sm font-medium mb-3">Создал</p>
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={createdByUser.avatar} alt={createdByUser.name} />
                    <AvatarFallback>{createdByUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{createdByUser.name}</p>
                    <p className="text-xs text-muted-foreground">{createdByUser.email}</p>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Создано</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatFullDate(task.createdAt)}
                </p>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-medium">Обновлено</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatFullDate(task.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (!target.closest('button')) {
              setIsDialogOpen(true);
            }
          }}
        >
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base font-semibold line-clamp-2">
                  {task.title}
                </CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTask(task.id);
                    }}
                    className="text-destructive cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Удалить
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardDescription className="line-clamp-2 text-sm mt-1">
              {task.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className={priorityColors[task.priority]}>
                {priorityLabels[task.priority]}
              </Badge>
              {task.dueDate && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(task.dueDate)}
                </div>
              )}
            </div>

            {assignedUser && (
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={assignedUser.avatar} alt={assignedUser.name} />
                  <AvatarFallback className="text-xs">
                    {assignedUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {assignedUser.name}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
    </>
  );
};
