import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Track } from '../types';

interface PlaybackState {
  isPlaying: boolean;
  isLoadingStream: boolean;
  currentTrack: Track | null;
  queue: Track[];
  history: Track[];
  volume: number;
  isMuted: boolean;
  progress: number;
  duration: number;
  shuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  playbackRate: number;
  cinemaMode: boolean;
  splitView: boolean;
  miniPlayer: boolean;
  proMode: boolean;
  audioDiagnostics: boolean;
  streamCache: Record<string, string>;
  
  // Actions
  setPlaying: (playing: boolean) => void;
  setIsLoadingStream: (loading: boolean) => void;
  setCurrentTrack: (track: Track | null) => void;
  setQueue: (tracks: Track[]) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setShuffle: (shuffle: boolean) => void;
  setRepeatMode: (mode: 'off' | 'all' | 'one') => void;
  setPlaybackRate: (rate: number) => void;
  playTrack: (track: Track, newQueue?: Track[]) => void;
  prefetchStream: (track: Track) => Promise<void>;
  cacheStreamSource: (trackId: string, sourceId: string) => void;
  setCinemaMode: (cinema: boolean) => void;
  setSplitView: (split: boolean) => void;
  setMiniPlayer: (mini: boolean) => void;
  setProMode: (pro: boolean) => void;
  setAudioDiagnostics: (diag: boolean) => void;
}

export const usePlaybackStore = create<PlaybackState>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      isLoadingStream: false,
      currentTrack: null,
      queue: [],
      history: [],
      volume: 1,
      isMuted: false,
      progress: 0,
      duration: 0,
      shuffle: false,
      repeatMode: 'off',
      playbackRate: 1,
      cinemaMode: false,
      splitView: false,
      miniPlayer: false,
      proMode: true,
      audioDiagnostics: false,
      streamCache: {},

      setCinemaMode: (cinemaMode) => set({ cinemaMode }),
      setSplitView: (splitView) => set({ splitView }),
      setMiniPlayer: (miniPlayer) => set({ miniPlayer }),
      setProMode: (proMode) => set({ proMode }),
      setAudioDiagnostics: (audioDiagnostics) => set({ audioDiagnostics }),

      setPlaying: (playing) => set({ isPlaying: playing }),
      setIsLoadingStream: (isLoadingStream) => set({ isLoadingStream }),
      
      setCurrentTrack: (track) => {
        set({ currentTrack: track, progress: 0 });
        if (track) {
          // Add to history, avoid duplicates
          const currentHistory = get().history.filter((t) => t.id !== track.id);
          set({ history: [track, ...currentHistory].slice(0, 50) });
          
          // Update Media Session
          if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
              title: track.title,
              artist: track.artist.name,
              album: track.album?.name || 'NeoTunes Single',
              artwork: track.coverUrl
                ? [{ src: track.coverUrl, sizes: '512x512', type: 'image/jpeg' }]
                : [],
            });
          }
        }
      },

      setQueue: (tracks) => set({ queue: tracks }),
      addToQueue: (track) => {
        const queue = get().queue;
        if (!queue.some((t) => t.id === track.id)) {
          set({ queue: [...queue, track] });
        }
      },
      removeFromQueue: (trackId) =>
        set({ queue: get().queue.filter((t) => t.id !== trackId) }),
      clearQueue: () => set({ queue: [], currentTrack: null, isPlaying: false, isLoadingStream: false }),
      
      nextTrack: () => {
        const { queue, currentTrack, repeatMode, shuffle } = get();
        if (queue.length === 0) return;

        if (repeatMode === 'one' && currentTrack) {
          set({ progress: 0 });
          return;
        }

        const currentIndex = currentTrack
          ? queue.findIndex((t) => t.id === currentTrack.id)
          : -1;

        let nextIndex = currentIndex + 1;

        if (shuffle) {
          nextIndex = Math.floor(Math.random() * queue.length);
        } else if (nextIndex >= queue.length) {
          if (repeatMode === 'all') {
            nextIndex = 0;
          } else {
            set({ isPlaying: false });
            return;
          }
        }

        get().playTrack(queue[nextIndex]);
      },

      prevTrack: () => {
        const { queue, currentTrack, repeatMode } = get();
        if (queue.length === 0) return;

        const currentIndex = currentTrack
          ? queue.findIndex((t) => t.id === currentTrack.id)
          : -1;

        let prevIndex = currentIndex - 1;

        if (prevIndex < 0) {
          if (repeatMode === 'all') {
            prevIndex = queue.length - 1;
          } else {
            set({ progress: 0 });
            return;
          }
        }

        get().playTrack(queue[prevIndex]);
      },

      setVolume: (volume) => set({ volume }),
      toggleMute: () => set({ isMuted: !get().isMuted }),
      setProgress: (progress) => set({ progress }),
      setDuration: (duration) => set({ duration }),
      setShuffle: (shuffle) => set({ shuffle }),
      setRepeatMode: (repeatMode) => set({ repeatMode }),
      setPlaybackRate: (playbackRate) => set({ playbackRate }),

      cacheStreamSource: (trackId, sourceId) => {
        set((state) => ({
          streamCache: { ...state.streamCache, [trackId]: sourceId },
        }));
      },

      prefetchStream: async (track) => {
        if (!track || !track.id) return;
        const state = get();
        if (track.sourceId || state.streamCache[track.id]) return;

        try {
          const res = await fetch(
            `/api/youtube/search?q=${encodeURIComponent(`${track.title} ${track.artist?.name || ''}`)}&title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist?.name || '')}&trackId=${encodeURIComponent(track.id)}`
          );
          const data = await res.json();
          const vid =
            data.videoId ||
            data.sourceId ||
            data.track?.sourceId ||
            (Array.isArray(data) && data[0]?.id) ||
            data.items?.[0]?.id?.videoId;
          if (vid) {
            get().cacheStreamSource(track.id, vid);
          }
        } catch {}
      },

      playTrack: (track, newQueue) => {
        const state = get();
        
        // STAGE 1 (0-50ms): OPTIMISTIC UI RESPONSE
        // Instantly update active track, set isPlaying = true, update queue & bottom player
        let targetTrack = { ...track };
        const cachedSourceId = state.streamCache[track.id];
        
        if (!targetTrack.sourceId && cachedSourceId) {
          targetTrack.sourceId = cachedSourceId;
        }

        if (newQueue) {
          set({ queue: newQueue });
        } else {
          get().addToQueue(targetTrack);
        }

        get().setCurrentTrack(targetTrack);
        set({ 
          isPlaying: true,
          isLoadingStream: !targetTrack.sourceId && targetTrack.sourceType !== 'cloud',
        });
      },
    }),
    {
      name: 'neotunes-playback-storage',
      partialize: (state) => ({
        queue: state.queue,
        history: state.history,
        volume: state.volume,
        repeatMode: state.repeatMode,
        shuffle: state.shuffle,
        streamCache: state.streamCache,
      }),
    }
  )
);
