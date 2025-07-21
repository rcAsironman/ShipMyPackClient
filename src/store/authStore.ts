import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  id: string;
  name: string;
  email: string;
  // Add other user fields as needed
};

type AuthState = {
  isLoggedIn: boolean;
  hasCheckedAuth: boolean;
  user: User | null;

  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  restoreLogin: () => Promise<void>;
  setUser: (user: User) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  hasCheckedAuth: false,
  user: null,

  login: async (user) => {
    await AsyncStorage.setItem('isLoggedIn', 'true');
    await AsyncStorage.setItem('user', JSON.stringify(user));
    set({ isLoggedIn: true, user });
  },

  logout: async () => {
    await AsyncStorage.removeItem('isLoggedIn');
    await AsyncStorage.removeItem('user');
    set({ isLoggedIn: false, user: null });
  },

  restoreLogin: async () => {
    const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
    const userStr = await AsyncStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    set({ isLoggedIn: isLoggedIn === 'true', user, hasCheckedAuth: true });
  },

  setUser: async (user) => {
    await AsyncStorage.setItem('user', JSON.stringify(user));
    set({ user });
  }
}));
