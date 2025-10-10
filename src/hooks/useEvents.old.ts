import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      const [eventsRes, columnsRes] = await Promise.all([
        supabase.from('events').select('*').order('order_index'),
        supabase.from('columns').select('*').order('order_index'),
      ]);

      if (eventsRes.error) throw eventsRes.error;
      if (columnsRes.error) throw columnsRes.error;

      const eventsData: Event[] = (eventsRes.data || []).map(e => ({
        id: e.id,
        title: e.title,
        description: e.description || '',
        createdAt: e.created_at,
        order: e.order_index,
      }));

      const columnsData: Column[] = (columnsRes.data || []).map(c => ({
        id: c.id,
        title: c.title,
        eventId: c.event_id,
        order: c.order_index,
        color: c.color || undefined,
      }));

      setEvents(eventsData);
      setColumns(columnsData);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Ошибка загрузки событий');
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (title: string, description?: string) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          title,
          description,
          order_index: events.length,
        })
        .select()
        .single();

      if (error) throw error;

      const newEvent: Event = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        createdAt: data.created_at,
        order: data.order_index,
      };

      setEvents([...events, newEvent]);
      toast.success('Событие создано');
      return newEvent;
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error('Ошибка создания события');
      return null;
    }
  };

  const addColumn = async (eventId: string, title: string, color?: string) => {
    try {
      const eventColumns = columns.filter(c => c.eventId === eventId);
      
      const { data, error } = await supabase
        .from('columns')
        .insert({
          title,
          event_id: eventId,
          order_index: eventColumns.length,
          color,
        })
        .select()
        .single();

      if (error) throw error;

      const newColumn: Column = {
        id: data.id,
        title: data.title,
        eventId: data.event_id,
        order: data.order_index,
        color: data.color || undefined,
      };

      setColumns([...columns, newColumn]);
      toast.success('Колонка создана');
      return newColumn;
    } catch (error) {
      console.error('Error adding column:', error);
      toast.error('Ошибка создания колонки');
      return null;
    }
  };

  return {
    events,
    columns,
    loading,
    refetch: fetchData,
    addEvent,
    addColumn,
  };
}
