import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'neotunes:theme';

export type ThemeMode = 'dark' | 'light';

interface ThemeState {
  mode: ThemeMode;
  loaded: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  loadFromStorage: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'dark',
  loaded: false,

  setMode: (mode) => {
    set({ mode });
    AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => {});
  },

  toggleMode: () => {
    const newMode = get().mode === 'dark' ? 'light' : 'dark';
    set({ mode: newMode });
    AsyncStorage.setItem(STORAGE_KEY, newMode).catch(() => {});
  },

  loadFromStorage: async () => {
    if (get().loaded) return;
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') {
        set({ mode: stored, loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },
}));

// Theme colors based on mode
export const getThemeColors = (mode: ThemeMode) => ({
  background: mode === 'dark' ? '#0A0A0A' : '#F5F5F5',
  surface: mode === 'dark' ? '#1C1C1E' : '#FFFFFF',
  surfaceSecondary: mode === 'dark' ? '#2C2C2E' : '#E8E8E8',
  text: mode === 'dark' ? '#FFFFFF' : '#0A0A0A',
  textSecondary: mode === 'dark' ? '#FFF' : '#666666',
  muted: mode === 'dark' ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
  border: mode === 'dark' ? '#3C3C3E' : '#DDD',
});
