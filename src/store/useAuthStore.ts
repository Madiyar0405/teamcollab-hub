import { create } from "zustand";
import { User } from "@/types";
import { authService } from "@/api/services/authService";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, department: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setIsAuthenticated: (value) => set({ isAuthenticated: value }),

  initialize: async () => {
    try {
      set({ isLoading: true });
      
      // Проверяем сохраненный токен
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (savedToken && savedUser) {
        try {
          // Проверяем валидность токена, запросив текущего пользователя
          const user = await authService.getCurrentUser();
          set({ 
            user, 
            token: savedToken, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          // Токен невалиден
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      const { token, user } = await authService.login({ email, password });
      
      // Сохраняем токен и пользователя
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token, isAuthenticated: true });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },

  register: async (name: string, email: string, password: string, department: string) => {
    try {
      const { token, user } = await authService.register({ 
        name, 
        email, 
        password, 
        department 
      });
      
      // Сохраняем токен и пользователя
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token, isAuthenticated: true });
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
