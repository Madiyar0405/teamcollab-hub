import { useTaskStore } from "@/store/useTaskStore";
import { TaskCard } from "./TaskCard";
import { DroppableColumn } from "./DroppableColumn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent, 
  PointerSensor, 
  useSensor, 
  useSensors,
  useDroppable,
  DragOverEvent
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const KanbanBoard = () => {
  const { tasks, events, columns, moveTask, addEvent, addColumn, deleteColumn } = useTaskStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const taskId = active.id as string;
      const overId = over.id as string;

      // Проверяем, если over это колонка
      const targetColumn = columns.find((col) => col.id === overId);
      if (targetColumn) {
        moveTask(taskId, targetColumn.id, targetColumn.eventId);
      }
    }

    setActiveId(null);
  };

  const handleAddEvent = () => {
    if (newEventTitle.trim()) {
      addEvent({ title: newEventTitle, description: "" });
      setNewEventTitle("");
      setIsEventDialogOpen(false);
    }
  };

  const handleAddColumn = () => {
    if (newColumnTitle.trim() && selectedEventId) {
      addColumn({
        title: newColumnTitle,
        eventId: selectedEventId,
        color: "bg-slate-100/50 border-slate-300/30",
      });
      setNewColumnTitle("");
      setIsColumnDialogOpen(false);
    }
  };

  const activeTask = tasks.find((task) => task.id === activeId);

  return (
    <div className="space-y-8">
      <div className="flex gap-4">
        <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Добавить событие
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новое событие</DialogTitle>
              <DialogDescription>Создайте новое событие для организации задач</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="event-title">Название события</Label>
                <Input
                  id="event-title"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="Q3 2024 - Развитие"
                />
              </div>
              <Button onClick={handleAddEvent} className="w-full">
                Создать
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isColumnDialogOpen} onOpenChange={setIsColumnDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Добавить колонку
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новая колонка</DialogTitle>
              <DialogDescription>Добавьте новую колонку в выбранное событие</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="event-select">Выберите событие</Label>
                <select
                  id="event-select"
                  className="w-full p-2 border rounded-md bg-background"
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                >
                  <option value="">Выберите событие</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="column-title">Название колонки</Label>
                <Input
                  id="column-title"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="В процессе"
                />
              </div>
              <Button onClick={handleAddColumn} className="w-full" disabled={!selectedEventId}>
                Создать
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-12">
          {events.sort((a, b) => a.order - b.order).map((event) => {
            const eventColumns = columns
              .filter((col) => col.eventId === event.id)
              .sort((a, b) => a.order - b.order);

            return (
              <div key={event.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      {event.title}
                    </h2>
                    {event.description && (
                      <p className="text-muted-foreground text-sm mt-1">{event.description}</p>
                    )}
                  </div>
                  <Badge variant="secondary">
                    {tasks.filter((t) => t.eventId === event.id).length} задач
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {eventColumns.map((column) => {
                    const columnTasks = tasks.filter((task) => task.columnId === column.id);

                    return (
                      <DroppableColumn
                        key={column.id}
                        id={column.id}
                        items={columnTasks.map((t) => t.id)}
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card className={`${column.color || "bg-card"} border-2 h-full`}>
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold">
                                  {column.title}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">
                                    {columnTasks.length}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => deleteColumn(column.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3 min-h-[300px]">
                              {columnTasks.map((task) => (
                                <TaskCard key={task.id} task={task} />
                              ))}
                            </CardContent>
                          </Card>
                        </motion.div>
                      </DroppableColumn>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
