import { create } from "zustand";
import { Task, TaskStatus, Notification } from "@/types";
import { mockTasks } from "@/data/mockData";
import { toast } from "sonner";

interface TaskState {
  tasks: Task[];
  notifications: Notification[];
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, newStatus: TaskStatus) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [...mockTasks],
  notifications: [],

  addTask: (taskData) => {
    const newTask: Task = {
      ...taskData,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({ tasks: [...state.tasks, newTask] }));

    // Создание уведомления
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

  moveTask: (id, newStatus) => {
    const task = get().tasks.find((t) => t.id === id);
    
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
          : task
      ),
    }));

    if (task) {
      const statusNames: Record<TaskStatus, string> = {
        todo: "К выполнению",
        "in-progress": "В работе",
        done: "Завершено",
      };

      const notification: Notification = {
        id: String(Date.now()),
        type: newStatus === "done" ? "task_completed" : "task_updated",
        message: `Задача "${task.title}" перемещена в "${statusNames[newStatus]}"`,
        taskId: id,
        timestamp: new Date().toISOString(),
        read: false,
      };

      set((state) => ({ notifications: [notification, ...state.notifications] }));
      
      if (newStatus === "done") {
        toast.success(`Задача завершена: ${task.title}`);
      }
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
