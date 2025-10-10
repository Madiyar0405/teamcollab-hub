import { create } from "zustand";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, department: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setIsAuthenticated: (value) => set({ isAuthenticated: value }),

  initialize: async () => {
    try {
      set({ isLoading: true });
      
      // Проверяем текущую сессию
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Загружаем профиль пользователя
        setTimeout(async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            const user: User = {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`,
              role: 'user',
              department: profile.department || 'Команда',
              activeTasks: 0,
              completedTasks: 0,
              joinedDate: new Date(profile.joined_date).toISOString().split('T')[0],
            };
            set({ user, session, isAuthenticated: true, isLoading: false });
          }
        }, 0);
      } else {
        set({ user: null, session: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          const user: User = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`,
            role: 'user',
            department: profile.department || 'Команда',
            activeTasks: 0,
            completedTasks: 0,
            joinedDate: new Date(profile.joined_date).toISOString().split('T')[0],
          };
          set({ user, session: data.session, isAuthenticated: true });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },

  register: async (name: string, email: string, password: string, department: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            name,
            department,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Профиль создается автоматически через триггер
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          const user: User = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`,
            role: 'user',
            department: profile.department || 'Команда',
            activeTasks: 0,
            completedTasks: 0,
            joinedDate: new Date(profile.joined_date).toISOString().split('T')[0],
          };
          set({ user, session: data.session, isAuthenticated: true });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null, session: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
}));
