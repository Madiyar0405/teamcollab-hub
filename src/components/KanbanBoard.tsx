import { TaskStatus } from "@/types";
import { useTaskStore } from "@/store/useTaskStore";
import { TaskCard } from "./TaskCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import { motion } from "framer-motion";

const columns: { status: TaskStatus; title: string; color: string }[] = [
  { status: "todo", title: "К выполнению", color: "bg-info/10 border-info/30" },
  { status: "in-progress", title: "В работе", color: "bg-warning/10 border-warning/30" },
  { status: "done", title: "Завершено", color: "bg-success/10 border-success/30" },
];

export const KanbanBoard = () => {
  const { tasks, moveTask } = useTaskStore();
  const [activeId, setActiveId] = useState<string | null>(null);

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
      const newStatus = over.id as TaskStatus;

      // Проверяем, что это валидный статус
      if (["todo", "in-progress", "done"].includes(newStatus)) {
        moveTask(taskId, newStatus);
      }
    }

    setActiveId(null);
  };

  const activeTask = tasks.find((task) => task.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.status);

          return (
            <SortableContext
              key={column.status}
              id={column.status}
              items={columnTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`${column.color} border-2`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">
                        {column.title}
                      </CardTitle>
                      <Badge variant="secondary" className="ml-2">
                        {columnTasks.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 min-h-[400px]">
                    {columnTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            </SortableContext>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
};
