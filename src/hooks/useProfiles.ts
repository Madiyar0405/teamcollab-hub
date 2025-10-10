import { useState, useEffect } from 'react';
import { userService } from '@/api/services/userService';
import { User } from '@/types';
import { toast } from 'sonner';

export function useProfiles() {
  const [profiles, setProfiles] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const data = await userService.getAll();
      setProfiles(data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (id: string, updates: Partial<User>) => {
    try {
      const updated = await userService.update(id, updates);
      setProfiles(prev => prev.map(p => p.id === id ? updated : p));
      toast.success('Профиль обновлен');
      return updated;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Ошибка обновления профиля');
      return null;
    }
  };

  return {
    profiles,
    loading,
    refetch: fetchProfiles,
    updateProfile,
  };
}

export function useProfile(userId: string) {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const data = await userService.getById(userId);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Ошибка загрузки профиля');
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    refetch: fetchProfile,
  };
}
