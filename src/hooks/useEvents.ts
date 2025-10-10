import { useState, useEffect } from 'react';
import { eventService, CreateEventRequest } from '@/api/services/eventService';
import { columnService, CreateColumnRequest } from '@/api/services/columnService';
import { Event, Column } from '@/types';
import { toast } from 'sonner';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsData, columnsData] = await Promise.all([
        eventService.getAll(),
        columnService.getAll(),
      ]);
      setEvents(eventsData);
      setColumns(columnsData);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Ошибка загрузки событий');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: CreateEventRequest) => {
    try {
      const newEvent = await eventService.create(eventData);
      setEvents(prev => [...prev, newEvent]);
      toast.success('Событие создано');
      return newEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Ошибка создания события');
      return null;
    }
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    try {
      const updated = await eventService.update(id, updates);
      setEvents(prev => prev.map(e => e.id === id ? updated : e));
      toast.success('Событие обновлено');
      return updated;
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Ошибка обновления события');
      return null;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await eventService.delete(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      toast.success('Событие удалено');
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Ошибка удаления события');
      return false;
    }
  };

  const createColumn = async (columnData: CreateColumnRequest) => {
    try {
      const newColumn = await columnService.create(columnData);
      setColumns(prev => [...prev, newColumn]);
      toast.success('Колонка создана');
      return newColumn;
    } catch (error) {
      console.error('Error creating column:', error);
      toast.error('Ошибка создания колонки');
      return null;
    }
  };

  const updateColumn = async (id: string, updates: Partial<Column>) => {
    try {
      const updated = await columnService.update(id, updates);
      setColumns(prev => prev.map(c => c.id === id ? updated : c));
      toast.success('Колонка обновлена');
      return updated;
    } catch (error) {
      console.error('Error updating column:', error);
      toast.error('Ошибка обновления колонки');
      return null;
    }
  };

  const deleteColumn = async (id: string) => {
    try {
      await columnService.delete(id);
      setColumns(prev => prev.filter(c => c.id !== id));
      toast.success('Колонка удалена');
      return true;
    } catch (error) {
      console.error('Error deleting column:', error);
      toast.error('Ошибка удаления колонки');
      return false;
    }
  };

  const addEvent = async (title: string, description: string) => {
    return createEvent({ title, description });
  };

  const addColumn = async (eventId: string, title: string, color?: string) => {
    return createColumn({ eventId, title, color });
  };

  return {
    events,
    columns,
    loading,
    refetch: fetchData,
    createEvent,
    addEvent,
    updateEvent,
    deleteEvent,
    createColumn,
    addColumn,
    updateColumn,
    deleteColumn,
  };
}
