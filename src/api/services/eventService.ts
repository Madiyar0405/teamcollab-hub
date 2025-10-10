import { apiClient } from '../client';
import { Event } from '@/types';

export interface CreateEventRequest {
  title: string;
  description?: string;
}

export const eventService = {
  getAll: async (): Promise<Event[]> => {
    const response = await apiClient.get<Event[]>('/events');
    return response.data;
  },

  getById: async (id: string): Promise<Event> => {
    const response = await apiClient.get<Event>(`/events/${id}`);
    return response.data;
  },

  create: async (data: CreateEventRequest): Promise<Event> => {
    const response = await apiClient.post<Event>('/events', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Event>): Promise<Event> => {
    const response = await apiClient.put<Event>(`/events/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/events/${id}`);
  },
};
