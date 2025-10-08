import { create } from "zustand";
import { Task, TaskStatus, Notification, Event, Column } from "@/types";
import { mockTasks, mockEvents, mockColumns } from "@/data/mockData";
import { toast } from "sonner";

interface TaskState {
  tasks: Task[];
  events: Event[];
  columns: Column[];
  notifications: Notification[];
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, columnId: string, eventId: string) => void;
  addEvent: (event: Omit<Event, "id" | "createdAt" | "order">) => void;
  addColumn: (column: Omit<Column, "id" | "order">) => void;
  deleteColumn: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [...mockTasks],
  events: [...mockEvents],
  columns: [...mockColumns],
  notifications: [],

  addTask: (taskData) => {
    const newTask: Task = {
      ...taskData,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({ tasks: [...state.tasks, newTask] }));

    const notification: Notification = {
      id: String(Date.now()),
      type: "task_created",
      message: `Новая задача создана: ${newTask.title}`,
      taskId: newTask.id,
      timestamp: new Date().toISOString(),
      read: false,
    };

    set((state) => ({ notifications: [notification, ...state.notifications] }));
    toast.success("Задача создана успешно!");
  },

  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      ),
    }));

    const updatedTask = get().tasks.find((t) => t.id === id);
    if (updatedTask) {
      const notification: Notification = {
        id: String(Date.now()),
        type: "task_updated",
        message: `Задача обновлена: ${updatedTask.title}`,
        taskId: id,
        timestamp: new Date().toISOString(),
        read: false,
      };

      set((state) => ({ notifications: [notification, ...state.notifications] }));
      toast.info("Задача обновлена");
    }
  },

  deleteTask: (id) => {
    const task = get().tasks.find((t) => t.id === id);
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));

    if (task) {
      toast.success(`Задача "${task.title}" удалена`);
    }
  },

  moveTask: (taskId, columnId, eventId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    const column = get().columns.find((c) => c.id === columnId);
    
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, columnId, eventId, updatedAt: new Date().toISOString() }
          : task
      ),
    }));

    if (task && column) {
      const notification: Notification = {
        id: String(Date.now()),
        type: "task_updated",
        message: `Задача "${task.title}" перемещена в "${column.title}"`,
        taskId,
        timestamp: new Date().toISOString(),
        read: false,
      };

      set((state) => ({ notifications: [notification, ...state.notifications] }));
      toast.info(`Задача перемещена в "${column.title}"`);
    }
  },

  addEvent: (eventData) => {
    const newEvent: Event = {
      ...eventData,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      order: get().events.length,
    };

    set((state) => ({ events: [...state.events, newEvent] }));
    toast.success(`Событие "${newEvent.title}" создано`);
  },

  addColumn: (columnData) => {
    const eventColumns = get().columns.filter((c) => c.eventId === columnData.eventId);
    const newColumn: Column = {
      ...columnData,
      id: String(Date.now()),
      order: eventColumns.length,
    };

    set((state) => ({ columns: [...state.columns, newColumn] }));
    toast.success(`Колонка "${newColumn.title}" создана`);
  },

  deleteColumn: (id) => {
    const column = get().columns.find((c) => c.id === id);
    const columnTasks = get().tasks.filter((t) => t.columnId === id);

    if (columnTasks.length > 0) {
      toast.error("Нельзя удалить колонку с задачами");
      return;
    }

    set((state) => ({
      columns: state.columns.filter((col) => col.id !== id),
    }));

    if (column) {
      toast.success(`Колонка "${column.title}" удалена`);
    }
  },

  markNotificationAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      ),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },
}));
