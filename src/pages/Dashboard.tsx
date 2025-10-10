import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { KanbanBoard } from "@/components/KanbanBoard";
import { TaskSearch } from "@/components/TaskSearch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { useTasks } from "@/hooks/useTasks";
import { useEvents } from "@/hooks/useEvents";
import { useProfiles } from "@/hooks/useProfiles";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/useAuthStore";

export default function Dashboard() {
  const { tasks, addTask } = useTasks();
  const { events, columns } = useEvents();
  const { profiles } = useProfiles();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskEventId, setNewTaskEventId] = useState("");
  const [newTaskColumnId, setNewTaskColumnId] = useState("");

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !newTaskAssignee || !newTaskEventId || !newTaskColumnId || !user) return;

    await addTask({
      title: newTaskTitle,
      description: newTaskDescription,
      eventId: newTaskEventId,
      columnId: newTaskColumnId,
      priority: newTaskPriority,
      assignedTo: newTaskAssignee,
      createdBy: user.id,
    });

    // Reset form
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskPriority("medium");
    setNewTaskAssignee("");
    setNewTaskEventId("");
    setNewTaskColumnId("");
    setIsDialogOpen(false);
  };

  const totalTasks = tasks.length;
  const totalEmployees = profiles.length;
  const totalEvents = events.length;
  const totalColumns = columns.length;

  const availableColumns = newTaskEventId 
    ? columns.filter(col => col.eventId === newTaskEventId)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Дашборд</h1>
          <p className="text-muted-foreground">Управление задачами вашей команды</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Card className="border-2 border-info/30 bg-info/5">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-info">{totalTasks}</div>
              <p className="text-sm text-muted-foreground">Всего задач</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-warning/30 bg-warning/5">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-warning">{totalEvents}</div>
              <p className="text-sm text-muted-foreground">События</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-success/30 bg-success/5">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-success">{totalColumns}</div>
              <p className="text-sm text-muted-foreground">Колонок</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{totalEmployees}</div>
              <p className="text-sm text-muted-foreground">Сотрудников</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <div className="flex-1">
            <TaskSearch />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Фильтры
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Новая задача
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Создать задачу</DialogTitle>
                <DialogDescription>
                  Добавьте новую задачу для команды
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="task-title">Название</Label>
                  <Input
                    id="task-title"
                    placeholder="Название задачи"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="task-description">Описание</Label>
                  <Textarea
                    id="task-description"
                    placeholder="Подробное описание задачи"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="task-priority">Приоритет</Label>
                  <Select value={newTaskPriority} onValueChange={(value: any) => setNewTaskPriority(value)}>
                    <SelectTrigger id="task-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Низкий</SelectItem>
                      <SelectItem value="medium">Средний</SelectItem>
                      <SelectItem value="high">Высокий</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="task-event">Событие</Label>
                  <Select value={newTaskEventId} onValueChange={setNewTaskEventId}>
                    <SelectTrigger id="task-event">
                      <SelectValue placeholder="Выберите событие" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="task-column">Колонка</Label>
                  <Select 
                    value={newTaskColumnId} 
                    onValueChange={setNewTaskColumnId}
                    disabled={!newTaskEventId}
                  >
                    <SelectTrigger id="task-column">
                      <SelectValue placeholder="Выберите колонку" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableColumns.map((col) => (
                        <SelectItem key={col.id} value={col.id}>
                          {col.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="task-assignee">Исполнитель</Label>
                  <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee}>
                    <SelectTrigger id="task-assignee">
                      <SelectValue placeholder="Выберите исполнителя" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleCreateTask}>Создать</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Kanban Board */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <KanbanBoard />
        </motion.div>
      </main>
    </div>
  );
}
