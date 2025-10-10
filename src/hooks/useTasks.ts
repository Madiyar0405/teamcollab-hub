import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types';
import { toast } from 'sonner';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();

    // Подписка на изменения в реальном времени
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const tasksData: Task[] = (data || []).map(t => ({
        id: t.id,
        title: t.title,
        description: t.description || '',
        eventId: t.event_id,
        columnId: t.column_id,
        priority: t.priority as 'low' | 'medium' | 'high',
        assignedTo: t.assigned_to || '',
        createdBy: t.created_by,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
        dueDate: t.due_date || undefined,
      }));

      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData: {
    title: string;
    description?: string;
    eventId: string;
    columnId: string;
    priority: 'low' | 'medium' | 'high';
    assignedTo: string;
    createdBy: string;
    dueDate?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          event_id: taskData.eventId,
          column_id: taskData.columnId,
          priority: taskData.priority,
          assigned_to: taskData.assignedTo,
          created_by: taskData.createdBy,
          due_date: taskData.dueDate,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Задача создана');
      await fetchTasks();
      return data;
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Ошибка создания задачи');
      return null;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.columnId !== undefined) updateData.column_id = updates.columnId;
      if (updates.priority !== undefined) updateData.priority = updates.priority;
      if (updates.assignedTo !== undefined) updateData.assigned_to = updates.assignedTo;
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;

      toast.success('Задача обновлена');
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Ошибка обновления задачи');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      toast.success('Задача удалена');
      await fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Ошибка удаления задачи');
    }
  };

  const moveTask = async (taskId: string, newColumnId: string, newEventId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          column_id: newColumnId,
          event_id: newEventId,
        })
        .eq('id', taskId);

      if (error) throw error;

      await fetchTasks();
    } catch (error) {
      console.error('Error moving task:', error);
      toast.error('Ошибка перемещения задачи');
    }
  };

  return {
    tasks,
    loading,
    refetch: fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
  };
}
