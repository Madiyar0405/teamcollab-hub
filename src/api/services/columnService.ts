import { apiClient } from '../client';
import { Column } from '@/types';

export interface CreateColumnRequest {
  title: string;
  eventId: string;
  color?: string;
}

export const columnService = {
  getAll: async (): Promise<Column[]> => {
    const response = await apiClient.get<Column[]>('/columns');
    return response.data;
  },

  getByEventId: async (eventId: string): Promise<Column[]> => {
    const response = await apiClient.get<Column[]>(`/events/${eventId}/columns`);
    return response.data;
  },

  create: async (data: CreateColumnRequest): Promise<Column> => {
    const response = await apiClient.post<Column>('/columns', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Column>): Promise<Column> => {
    const response = await apiClient.put<Column>(`/columns/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/columns/${id}`);
  },
};
