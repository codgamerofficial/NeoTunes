import { create } from 'zustand';
import { Track } from '@/types';
import { audioEngine, PlaybackStatus } from './AudioEngine';
import { QueueManager } from './QueueManager';
import { mediaSession } from './MediaSession';
import { PlaybackPersistence } from './PlaybackPersistence';
import { playerEvents } from './PlayerEvents';

export interface PlayerStoreState {
  currentTrack: Track | null;
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  audioQuality: string;
  playbackStatus: PlaybackStatus;
  errorMessage: string | null;

  // Actions
  playTrack: (track: Track) => Promise<void>;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setProgress: (timeSeconds: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  setShuffle: (shuffle: boolean) => void;
  setRepeatMode: (mode: 'off' | 'all' | 'one') => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  playNext: (track: Track) => void;
  initPlayer: () => void;
}

export const usePlayerStore = create<PlayerStoreState>((set, get) => {
  // Wire AudioEngine Event Callbacks
  audioEngine.setOptions({
    onProgress: (currentTime, duration) => {
      set({ progress: currentTime, duration: duration || get().duration });
      PlaybackPersistence.saveState({ position: currentTime });
    },
    onStatusChange: (status, message) => {
      set({
        playbackStatus: status,
        isPlaying: status === 'playing',
        errorMessage: message || (status === 'error' ? 'Playback error' : null),
      });
    },
    onEnded: () => {
      get().nextTrack();
    },
  });

  // Wire Media Session Hardware Controller Callbacks
  mediaSession.setupActionHandlers({
    onPlay: () => get().togglePlay(),
    onPause: () => get().togglePlay(),
    onNext: () => get().nextTrack(),
    onPrev: () => get().prevTrack(),
    onSeekTo: ({ seekTime }) => get().setProgress(seekTime),
  });

  return {
    currentTrack: null,
    queue: [],
    currentIndex: -1,
    isPlaying: false,
    progress: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    shuffle: false,
    repeatMode: 'off',
    audioQuality: 'lossless',
    playbackStatus: 'idle',
    errorMessage: null,

    initPlayer: () => {
      const saved = PlaybackPersistence.loadState();
      if (saved) {
        set({
          currentTrack: saved.currentTrack || null,
          queue: saved.queue || [],
          currentIndex: saved.currentIndex ?? -1,
          volume: saved.volume ?? 1,
          shuffle: saved.shuffle ?? false,
          repeatMode: saved.repeatMode || 'off',
          audioQuality: saved.audioQuality || 'lossless',
        });
        if (saved.volume !== undefined) {
          audioEngine.setVolume(saved.volume);
        }
      }
    },

    playTrack: async (track: Track) => {
      const { queue } = get();
      const existingIdx = queue.findIndex((t) => t.id === track.id);
      let newQueue = queue;
      let newIdx = existingIdx;

      if (existingIdx === -1) {
        newQueue = [...queue, track];
        newIdx = newQueue.length - 1;
      }

      set({
        currentTrack: track,
        queue: newQueue,
        currentIndex: newIdx,
        progress: 0,
        errorMessage: null,
      });

      PlaybackPersistence.saveState({
        currentTrack: track,
        queue: newQueue,
        currentIndex: newIdx,
      });

      await audioEngine.loadTrack(track, true);
    },

    togglePlay: () => {
      const { currentTrack, isPlaying } = get();
      if (!currentTrack) return;

      if (isPlaying) {
        audioEngine.pause();
      } else {
        audioEngine.play();
      }
    },

    nextTrack: () => {
      const { queue, currentIndex, repeatMode, shuffle } = get();
      if (queue.length === 0) return;

      const nextIdx = QueueManager.getNextTrackIndex(queue, currentIndex, repeatMode, shuffle);
      if (nextIdx !== null && queue[nextIdx]) {
        const nextTrackItem = queue[nextIdx];
        set({
          currentTrack: nextTrackItem,
          currentIndex: nextIdx,
          progress: 0,
        });

        PlaybackPersistence.saveState({
          currentTrack: nextTrackItem,
          currentIndex: nextIdx,
        });

        audioEngine.loadTrack(nextTrackItem, true);
      } else {
        audioEngine.pause();
      }
    },

    prevTrack: () => {
      const { queue, currentIndex, repeatMode, shuffle, progress } = get();
      if (queue.length === 0) return;

      // If playing for more than 3 seconds, restart current track first
      if (progress > 3) {
        get().setProgress(0);
        return;
      }

      const prevIdx = QueueManager.getPreviousTrackIndex(queue, currentIndex, repeatMode, shuffle);
      if (prevIdx !== null && queue[prevIdx]) {
        const prevTrackItem = queue[prevIdx];
        set({
          currentTrack: prevTrackItem,
          currentIndex: prevIdx,
          progress: 0,
        });

        PlaybackPersistence.saveState({
          currentTrack: prevTrackItem,
          currentIndex: prevIdx,
        });

        audioEngine.loadTrack(prevTrackItem, true);
      }
    },

    setProgress: (timeSeconds: number) => {
      set({ progress: timeSeconds });
      audioEngine.seek(timeSeconds);
    },

    setVolume: (value: number) => {
      set({ volume: value, isMuted: value === 0 });
      audioEngine.setVolume(value);
      PlaybackPersistence.saveState({ volume: value });
    },

    toggleMute: () => {
      const { isMuted, volume } = get();
      const newMuted = !isMuted;
      set({ isMuted: newMuted });
      audioEngine.setMuted(newMuted);
    },

    setShuffle: (shuffle: boolean) => {
      set({ shuffle });
      PlaybackPersistence.saveState({ shuffle });
    },

    setRepeatMode: (repeatMode: 'off' | 'all' | 'one') => {
      set({ repeatMode });
      PlaybackPersistence.saveState({ repeatMode });
    },

    addToQueue: (track: Track) => {
      const { queue } = get();
      const newQueue = QueueManager.addToQueue(queue, track);
      set({ queue: newQueue });
      PlaybackPersistence.saveState({ queue: newQueue });
    },

    removeFromQueue: (trackId: string) => {
      const { queue, currentIndex } = get();
      const { newQueue, newIndex } = QueueManager.removeFromQueue(queue, trackId, currentIndex);
      set({ queue: newQueue, currentIndex: newIndex });
      PlaybackPersistence.saveState({ queue: newQueue, currentIndex: newIndex });
    },

    clearQueue: () => {
      const { currentTrack } = get();
      const newQueue = currentTrack ? [currentTrack] : [];
      set({ queue: newQueue, currentIndex: 0 });
      PlaybackPersistence.saveState({ queue: newQueue, currentIndex: 0 });
    },

    playNext: (track: Track) => {
      const { queue, currentIndex } = get();
      const { newQueue, newIndex } = QueueManager.playNext(queue, currentIndex, track);
      set({ queue: newQueue, currentIndex: newIndex });
      PlaybackPersistence.saveState({ queue: newQueue, currentIndex: newIndex });
    },
  };
});
