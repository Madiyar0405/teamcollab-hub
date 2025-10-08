import { create } from "zustand";
import { User } from "@/types";
import { mockUsers } from "@/data/mockData";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
}

// Mock авторизация - для демонстрации
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) => set({ user }),
  setIsAuthenticated: (value) => set({ isAuthenticated: value }),

  login: async (email: string, password: string) => {
    // Имитация API запроса
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Поиск пользователя по email
    const user = mockUsers.find((u) => u.email === email);
    
    if (user && password.length > 0) {
      set({ user, isAuthenticated: true });
      localStorage.setItem("auth_user", JSON.stringify(user));
      return true;
    }
    
    return false;
  },

  register: async (name: string, email: string, password: string, role: string) => {
    // Имитация API запроса
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Проверка существующего пользователя
    const existingUser = mockUsers.find((u) => u.email === email);
    if (existingUser) {
      return false;
    }
    
    // Создание нового пользователя
    const newUser: User = {
      id: String(mockUsers.length + 1),
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      role,
      department: "Команда",
      activeTasks: 0,
      completedTasks: 0,
      joinedDate: new Date().toISOString().split("T")[0],
    };
    
    mockUsers.push(newUser);
    set({ user: newUser, isAuthenticated: true });
    localStorage.setItem("auth_user", JSON.stringify(newUser));
    return true;
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    localStorage.removeItem("auth_user");
  },
}));
