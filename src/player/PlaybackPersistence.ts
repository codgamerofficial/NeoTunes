import { Track } from '@/types';

export interface SavedPlayerState {
  currentTrack: Track | null;
  queue: Track[];
  currentIndex: number;
  position: number;
  volume: number;
  shuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  audioQuality: string;
}

const STORAGE_KEY = 'neotunes_player_state';

export const PlaybackPersistence = {
  saveState(state: Partial<SavedPlayerState>): void {
    if (typeof window === 'undefined') return;
    try {
      const existing = this.loadState() || {};
      const updated = { ...existing, ...state };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('[PlaybackPersistence] Failed to save player state:', e);
    }
  },

  loadState(): SavedPlayerState | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data) as SavedPlayerState;
    } catch (e) {
      console.warn('[PlaybackPersistence] Failed to load player state:', e);
      return null;
    }
  },

  clearState(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  },
};
