import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'neotunes:preferences';

export type ThemeMode = 'dark' | 'light';

type PreferencesPayload = {
  displayName: string;
  themeMode: ThemeMode;
};

interface PreferencesState extends PreferencesPayload {
  loaded: boolean;
  loadPreferences: () => void;
  setDisplayName: (displayName: string) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  toggleTheme: () => void;
}

const defaultPreferences: PreferencesPayload = {
  displayName: '',
  themeMode: 'dark',
};

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  ...defaultPreferences,
  loaded: false,

  loadPreferences: async () => {
    if (get().loaded) return;

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PreferencesPayload>;
        set({
          displayName: parsed.displayName ?? defaultPreferences.displayName,
          themeMode: parsed.themeMode === 'light' ? 'light' : 'dark',
          loaded: true,
        });
        return;
      }

      set({ loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  setDisplayName: (displayName) => {
    const normalized = displayName.trim();
    set({ displayName: normalized });

    const payload: PreferencesPayload = {
      displayName: normalized,
      themeMode: get().themeMode,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
  },

  setThemeMode: (themeMode) => {
    set({ themeMode });

    const payload: PreferencesPayload = {
      displayName: get().displayName,
      themeMode,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {});
  },

  toggleTheme: () => {
    const nextTheme: ThemeMode = get().themeMode === 'dark' ? 'light' : 'dark';
    get().setThemeMode(nextTheme);
  },
}));
