// Типы для всего приложения

export type TaskStatus = "todo" | "in-progress" | "done";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  activeTasks: number;
  completedTasks: number;
  joinedDate: string;
}

export interface Column {
  id: string;
  title: string;
  eventId: string;
  order: number;
  color?: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  order: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  eventId: string;
  columnId: string;
  priority: "low" | "medium" | "high";
  assignedTo: string; // User ID
  createdBy: string; // User ID
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  // Для обратной совместимости
  status?: TaskStatus;
}

export interface Notification {
  id: string;
  type: "task_created" | "task_updated" | "task_completed" | "task_assigned";
  message: string;
  taskId: string;
  timestamp: string;
  read: boolean;
}
