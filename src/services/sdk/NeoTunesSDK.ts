'use client';

import { usePlaybackStore } from '@/store/playback-store';
import { Track } from '@/types';

export class NeoTunesSDK {
  public static readonly VERSION = '1.0.0';

  /**
   * Player Namespace API (Section 19 & 20)
   */
  public static player = {
    getCurrentTrack: (): Track | null => {
      return usePlaybackStore.getState().currentTrack;
    },
    getPlaybackState: () => {
      const state = usePlaybackStore.getState();
      return {
        isPlaying: state.isPlaying,
        progress: state.progress,
        duration: state.duration,
      };
    },
    play: () => usePlaybackStore.getState().setPlaying(true),
    pause: () => usePlaybackStore.getState().setPlaying(false),
    next: () => usePlaybackStore.getState().nextTrack(),
    previous: () => usePlaybackStore.getState().prevTrack(),
  };

  /**
   * Storage Namespace API (Section 15 & 60)
   */
  public static storage = {
    getItem: (extensionId: string, key: string): string | null => {
      try {
        return localStorage.getItem(`ext_${extensionId}_${key}`);
      } catch {
        return null;
      }
    },
    setItem: (extensionId: string, key: string, value: string): void => {
      try {
        localStorage.setItem(`ext_${extensionId}_${key}`, value);
      } catch {}
    },
  };
}
