import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Track } from '../types';

export type PlaybackStatus = 
  | 'idle' 
  | 'resolving'
  | 'validating'
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

export type StreamType = 'FULL' | 'PREVIEW' | null;

export interface StreamDiagnostics {
  trackId: string | null;
  provider: string;
  sourceId: string | null;
  duration: number;
  currentTime: number;
  playbackState: PlaybackStatus;
  validationResult: string;
  streamType: StreamType;
}

interface PlaybackState {
  isPlaying: boolean;
  isLoadingStream: boolean;
  playbackStatus: PlaybackStatus;
  playbackError: string | null;
  streamType: StreamType;
  diagnostics: StreamDiagnostics;
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
  
  // Soundstage DSP & Equalizer
  crossfade: number; // 0 to 12 seconds
  eqPreset: string; // 'Flat', 'Bass Boost', 'Vocal Boost', etc.
  eqGains: number[]; // 10 band values in dB [-12 to 12]
  soundstageMode: string;
  sleepTimerEndTime: number | null;
  sleepTimerMinutes: number | null;
  audioQuality: 'auto' | 'normal' | 'high' | 'very_high' | 'lossless';
  activeDeviceId: string;
  smartQueueEnabled: boolean;
  autoplayEnabled: boolean;
  autoplayFilter: string;

  // Actions
  setPlaybackStatus: (status: PlaybackStatus, error?: string | null) => void;
  setStreamType: (type: StreamType) => void;
  setDiagnostics: (diag: Partial<StreamDiagnostics>) => void;
  setPlaying: (playing: boolean) => void;
  setIsLoadingStream: (loading: boolean) => void;
  setCurrentTrack: (track: Track | null) => void;
  setQueue: (tracks: Track[]) => void;
  addToQueue: (track: Track) => void;
  addNext: (track: Track) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  clearHistory: () => void;
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
  setCrossfade: (seconds: number) => void;
  setEqPreset: (presetName: string, gains: number[]) => void;
  setEqGain: (bandIndex: number, dB: number) => void;
  setSoundstageMode: (mode: string) => void;
  setSleepTimer: (minutes: number | null) => void;
  setAudioQuality: (quality: 'auto' | 'normal' | 'high' | 'very_high' | 'lossless') => void;
  setActiveDeviceId: (id: string) => void;
  setSmartQueueEnabled: (enabled: boolean) => void;
  setAutoplayEnabled: (enabled: boolean) => void;
  setAutoplayFilter: (filter: string) => void;
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
      streamType: 'FULL',

      // Enterprise Defaults
      crossfade: 3,
      eqPreset: 'Flat',
      eqGains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      soundstageMode: 'Concert Hall',
      sleepTimerEndTime: null,
      sleepTimerMinutes: null,
      audioQuality: 'very_high',
      activeDeviceId: 'local',
      smartQueueEnabled: true,
      autoplayEnabled: true,
      autoplayFilter: 'All',

      diagnostics: {
        trackId: null,
        provider: 'YouTube Embedded Player',
        sourceId: null,
        duration: 0,
        currentTime: 0,
        playbackState: 'idle',
        validationResult: 'PASSED (Full Stream >= 60s)',
        streamType: 'FULL',
      },

      setStreamType: (streamType) => set({ streamType }),
      setDiagnostics: (diag) => set((state) => ({ diagnostics: { ...state.diagnostics, ...diag } })),
      setCinemaMode: (cinemaMode) => set({ cinemaMode }),
      setSplitView: (splitView) => set({ splitView }),
      setMiniPlayer: (miniPlayer) => set({ miniPlayer }),
      setProMode: (proMode) => set({ proMode }),
      setAudioDiagnostics: (audioDiagnostics) => set({ audioDiagnostics }),
      setCrossfade: (crossfade) => set({ crossfade }),
      setAudioQuality: (audioQuality) => set({ audioQuality }),
      setActiveDeviceId: (activeDeviceId) => set({ activeDeviceId }),
      setSmartQueueEnabled: (smartQueueEnabled) => set({ smartQueueEnabled }),
      setAutoplayEnabled: (autoplayEnabled) => set({ autoplayEnabled }),
      setAutoplayFilter: (autoplayFilter) => set({ autoplayFilter }),
      setSoundstageMode: (soundstageMode) => set({ soundstageMode }),

      setEqPreset: (presetName, gains) => set({ eqPreset: presetName, eqGains: gains }),
      setEqGain: (bandIndex, dB) => {
        const gains = [...get().eqGains];
        gains[bandIndex] = dB;
        set({ eqPreset: 'Custom', eqGains: gains });
      },

      setSleepTimer: (minutes) => {
        if (!minutes || minutes <= 0) {
          set({ sleepTimerMinutes: null, sleepTimerEndTime: null });
        } else {
          const endTime = Date.now() + minutes * 60 * 1000;
          set({ sleepTimerMinutes: minutes, sleepTimerEndTime: endTime });
        }
      },

      setPlaybackStatus: (status, error = null) => {
        const isPlaying = status === 'playing' ? true : (['paused', 'ended', 'idle', 'error'].includes(status) ? false : get().isPlaying);
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
        if (!track) {
          set({ currentTrack: null, progress: 0, buffered: 0 });
          return;
        }

        const canonicalId = track.canonicalId || track.id;
        const artworkUrl = track.artworkUrl || track.coverUrl || (track.album && typeof track.album === 'object' ? (track.album as any).coverUrl : '');
        const artistName = Array.isArray(track.artists) ? track.artists.join(', ') : (typeof track.artist === 'object' ? (track.artist as any)?.name || 'Artist' : (track.artist || 'Artist'));
        const albumName = typeof track.album === 'object' ? (track.album as any)?.name || 'NeoTunes Single' : (track.album || 'NeoTunes Single');

        const normalized: Track = {
          ...track,
          id: canonicalId,
          canonicalId,
          artworkUrl,
          coverUrl: artworkUrl,
          artist: artistName,
          artists: Array.isArray(track.artists) && track.artists.length > 0 ? track.artists : [artistName],
          album: albumName,
        };

        set({ currentTrack: normalized, progress: 0, buffered: 0, playbackError: null });

        const currentHistory = get().history.filter((t) => (t.canonicalId || t.id) !== canonicalId);
        set({ history: [normalized, ...currentHistory].slice(0, 50) });

        if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: normalized.title,
            artist: artistName,
            album: albumName,
            artwork: artworkUrl ? [{ src: artworkUrl, sizes: '512x512', type: 'image/jpeg' }] : [],
          });
        }
      },

      setQueue: (queue) => set({ queue }),
      
      addToQueue: (track) => {
        const queue = get().queue;
        if (!queue.find((t) => t.id === track.id)) {
          set({ queue: [...queue, track] });
        }
      },

      addNext: (track) => {
        const { queue, currentTrack } = get();
        if (!currentTrack) {
          set({ queue: [track] });
          return;
        }
        const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
        const filteredQueue = queue.filter((t) => t.id !== track.id);
        const insertIndex = currentIndex >= 0 ? currentIndex + 1 : filteredQueue.length;
        filteredQueue.splice(insertIndex, 0, track);
        set({ queue: filteredQueue });
      },

      reorderQueue: (fromIndex, toIndex) => {
        const queue = [...get().queue];
        const [moved] = queue.splice(fromIndex, 1);
        queue.splice(toIndex, 0, moved);
        set({ queue });
      },
      
      removeFromQueue: (trackId) => {
        set({ queue: get().queue.filter((t) => t.id !== trackId) });
      },
      
      clearQueue: () => set({ queue: [] }),
      clearHistory: () => set({ history: [] }),

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
        const { queue, history, currentTrack, repeatMode, progress } = get();

        // Section 17 Rule: If playing for > 3 seconds, restart current track first
        if (progress > 3) {
          get().setProgress(0);
          return;
        }

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

        const artistStr = typeof track.artist === 'object' ? (track.artist as any)?.name : track.artist || '';

        try {
          const res = await fetch(
            `/api/youtube/search?q=${encodeURIComponent(`${track.title} ${artistStr}`)}&title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(artistStr)}&trackId=${encodeURIComponent(track.id)}`
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
        set({ isPlaying: true });
        get().setPlaybackStatus('preparing');

        const activeQueue = newQueue || state.queue;
        const currentIndex = activeQueue.findIndex((t) => t.id === targetTrack.id);
        if (currentIndex >= 0 && currentIndex + 1 < activeQueue.length) {
          get().prefetchStream(activeQueue[currentIndex + 1]);
        }
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
        crossfade: state.crossfade,
        eqPreset: state.eqPreset,
        eqGains: state.eqGains,
        soundstageMode: state.soundstageMode,
        audioQuality: state.audioQuality,
        smartQueueEnabled: state.smartQueueEnabled,
      }),
    }
  )
);
