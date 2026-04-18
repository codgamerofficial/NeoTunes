import { create } from 'zustand';
import { useRecentStore } from './recentStore';

export interface Track {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  url?: string;
  color: string;
  source?: string;
  searchQuery?: string;
}

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];

  // Playback time (in seconds) — updated by audio engine every 500ms
  currentTime: number;
  duration: number;

  // Seek bridge — audio engine registers this fn so store can call it
  _seekFn: ((seconds: number) => void) | null;

  // Actions
  setCurrentTrack: (track: Track) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setQueue: (tracks: Track[]) => void;
  nextTrack: () => void;
  prevTrack: () => void;

  // Time actions
  setCurrentTime: (t: number) => void;
  setDuration: (d: number) => void;
  seekTo: (seconds: number) => void;
  registerSeekFn: (fn: (seconds: number) => void) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  queue: [],
  currentTime: 0,
  duration: 0,
  _seekFn: null,

  setCurrentTrack: async (track) => {
    set({ currentTrack: track, isPlaying: true, currentTime: 0, duration: 0 });
    useRecentStore.getState().addRecentTrack(track);
    
    if (track.source === 'spotify_proxy' && track.searchQuery) {
      // Lazy load actual audio from youtube proxy
      const { fetchResolve } = require('../lib/apiClient');
      const resolved = await fetchResolve(track.searchQuery);
      if (resolved && resolved.id) {
        set((state) => {
          if (state.currentTrack?.id === track.id) {
            return { currentTrack: { ...track, id: resolved.id, source: resolved.resolvedSource } };
          }
          return state;
        });
      }
    }
  },

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setQueue: (tracks) => set({ queue: tracks }),

  nextTrack: () => {
    const { currentTrack, queue } = get();
    if (!currentTrack || queue.length === 0) return;
    const index = queue.findIndex(t => t.id === currentTrack.id);
    if (index >= 0 && index < queue.length - 1) {
      set({ currentTrack: queue[index + 1], isPlaying: true, currentTime: 0, duration: 0 });
    }
  },
  prevTrack: () => {
    const { currentTrack, queue } = get();
    if (!currentTrack || queue.length === 0) return;
    const index = queue.findIndex(t => t.id === currentTrack.id);
    if (index > 0) {
      set({ currentTrack: queue[index - 1], isPlaying: true, currentTime: 0, duration: 0 });
    }
  },

  // Time
  setCurrentTime: (t) => set({ currentTime: t }),
  setDuration: (d) => set({ duration: d }),
  seekTo: (seconds) => {
    const fn = get()._seekFn;
    if (fn) fn(seconds);
    set({ currentTime: seconds });
  },
  registerSeekFn: (fn) => set({ _seekFn: fn }),
}));
