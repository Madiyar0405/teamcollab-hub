import { useState, useEffect } from 'react';
import { taskService, CreateTaskRequest } from '@/api/services/taskService';
import { Task } from '@/types';
import { toast } from 'sonner';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await taskService.getAll();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Ошибка загрузки задач');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: CreateTaskRequest) => {
    try {
      const newTask = await taskService.create(taskData);
      setTasks(prev => [...prev, newTask]);
      toast.success('Задача создана');
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Ошибка создания задачи');
      return null;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updated = await taskService.update(id, updates);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      toast.success('Задача обновлена');
      return updated;
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Ошибка обновления задачи');
      return null;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskService.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success('Задача удалена');
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Ошибка удаления задачи');
      return false;
    }
  };

  const moveTask = async (taskId: string, newColumnId: string, newEventId: string) => {
    return updateTask(taskId, { 
      columnId: newColumnId, 
      eventId: newEventId 
    });
  };

  const addTask = createTask;

  return {
    tasks,
    loading,
    refetch: fetchTasks,
    createTask,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
  };
}
