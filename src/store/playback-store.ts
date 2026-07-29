import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Track } from '../types';

export type PlaybackStatus = 
  | 'idle' 
  | 'loading' 
  | 'preparing' 
  | 'connecting' 
  | 'buffering' 
  | 'ready' 
  | 'playing' 
  | 'paused' 
  | 'seeking' 
  | 'ended' 
  | 'error';

interface PlaybackState {
  isPlaying: boolean;
  isLoadingStream: boolean;
  playbackStatus: PlaybackStatus;
  playbackError: string | null;
  currentTrack: Track | null;
  queue: Track[];
  history: Track[];
  volume: number;
  isMuted: boolean;
  progress: number;
  buffered: number;
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
  setPlaybackStatus: (status: PlaybackStatus, error?: string | null) => void;
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
  setBuffered: (buffered: number) => void;
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
      playbackStatus: 'idle',
      playbackError: null,
      currentTrack: null,
      queue: [],
      history: [],
      volume: 1,
      isMuted: false,
      progress: 0,
      buffered: 0,
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

      setPlaybackStatus: (status, error = null) => {
        const isPlaying = status === 'playing';
        const isLoadingStream = ['loading', 'preparing', 'connecting', 'buffering'].includes(status);
        set({
          playbackStatus: status,
          isPlaying,
          isLoadingStream,
          playbackError: error,
        });
      },

      setPlaying: (playing) => {
        const status = playing ? 'playing' : 'paused';
        get().setPlaybackStatus(status);
      },

      setIsLoadingStream: (isLoadingStream) => {
        set({ isLoadingStream });
        if (isLoadingStream && get().playbackStatus !== 'loading' && get().playbackStatus !== 'preparing') {
          set({ playbackStatus: 'buffering' });
        }
      },
      
      setCurrentTrack: (track) => {
        set({ currentTrack: track, progress: 0, buffered: 0 });
        if (track) {
          const currentHistory = get().history.filter((t) => t.id !== track.id);
          set({ history: [track, ...currentHistory].slice(0, 50) });
          
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

      setQueue: (queue) => set({ queue }),
      
      addToQueue: (track) => {
        const queue = get().queue;
        if (!queue.find((t) => t.id === track.id)) {
          set({ queue: [...queue, track] });
        }
      },
      
      removeFromQueue: (trackId) => {
        set({ queue: get().queue.filter((t) => t.id !== trackId) });
      },
      
      clearQueue: () => set({ queue: [] }),

      nextTrack: () => {
        const { queue, history, currentTrack, repeatMode, shuffle } = get();
        const activeQueue = queue.length > 0 ? queue : history;
        if (activeQueue.length === 0) return;

        if (repeatMode === 'one' && currentTrack) {
          get().setProgress(0);
          get().setPlaybackStatus('preparing');
          return;
        }

        let currentIndex = currentTrack
          ? activeQueue.findIndex((t) => t.id === currentTrack.id)
          : -1;

        let nextIndex = currentIndex + 1;

        if (shuffle) {
          nextIndex = Math.floor(Math.random() * activeQueue.length);
        } else if (nextIndex >= activeQueue.length) {
          if (repeatMode === 'all') {
            nextIndex = 0;
          } else {
            set({ progress: 0 });
            get().setPlaybackStatus('ended');
            return;
          }
        }

        const target = activeQueue[nextIndex];
        if (target) {
          get().playTrack(target, activeQueue);
        }
      },

      prevTrack: () => {
        const { queue, history, currentTrack, repeatMode } = get();
        const activeQueue = queue.length > 0 ? queue : history;
        if (activeQueue.length === 0) return;

        let currentIndex = currentTrack
          ? activeQueue.findIndex((t) => t.id === currentTrack.id)
          : -1;

        let prevIndex = currentIndex - 1;

        if (prevIndex < 0) {
          if (repeatMode === 'all') {
            prevIndex = activeQueue.length - 1;
          } else {
            set({ progress: 0 });
            get().setPlaybackStatus('idle');
            return;
          }
        }

        const target = activeQueue[prevIndex];
        if (target) {
          get().playTrack(target, activeQueue);
        }
      },

      setVolume: (volume) => set({ volume }),
      toggleMute: () => set({ isMuted: !get().isMuted }),
      setProgress: (progress) => set({ progress }),
      setBuffered: (buffered) => set({ buffered }),
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
        let targetTrack = { ...track };
        const cachedSourceId = state.streamCache[track.id];
        
        if (!targetTrack.sourceId && cachedSourceId) {
          targetTrack.sourceId = cachedSourceId;
        }

        if (newQueue && newQueue.length > 0) {
          set({ queue: newQueue });
        } else {
          const existingQueue = state.queue;
          if (!existingQueue.find((t) => t.id === targetTrack.id)) {
            set({ queue: [...existingQueue, targetTrack] });
          }
        }

        get().setCurrentTrack(targetTrack);
        get().setPlaybackStatus('preparing');
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
