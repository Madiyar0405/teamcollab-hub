import { apiClient } from '../client';
import { Task } from '@/types';

export interface CreateTaskRequest {
  title: string;
  description?: string;
  eventId: string;
  columnId: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  createdBy?: string;
  dueDate?: string;
}

export const taskService = {
  getAll: async (): Promise<Task[]> => {
    const response = await apiClient.get<Task[]>('/tasks');
    return response.data;
  },

  getById: async (id: string): Promise<Task> => {
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  create: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await apiClient.post<Task>('/tasks', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Task>): Promise<Task> => {
    const response = await apiClient.put<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};
