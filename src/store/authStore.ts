import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthState = {
    isLoggedIn: boolean;
    hasCheckedAuth: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    restoreLogin: () => Promise<void>;
  };
  
  export const useAuthStore = create<AuthState>((set) => ({
    isLoggedIn: false,
    hasCheckedAuth: false,
  
    login: async () => {
      await AsyncStorage.setItem('isLoggedIn', 'true');
      set({ isLoggedIn: true });
    },
  
    logout: async () => {
      await AsyncStorage.removeItem('isLoggedIn');
      set({ isLoggedIn: false });
    },
  
    restoreLogin: async () => {
      const value = await AsyncStorage.getItem('isLoggedIn');
      set({ isLoggedIn: value === 'true', hasCheckedAuth: true });
    },
  }));