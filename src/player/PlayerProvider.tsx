'use client';

import React, { useEffect } from 'react';
import { usePlayerStore } from './PlayerStore';
import { audioEngine } from './AudioEngine';

interface PlayerProviderProps {
  children: React.ReactNode;
}

export default function PlayerProvider({ children }: PlayerProviderProps) {
  const { initPlayer, isPlaying, togglePlay, nextTrack, prevTrack } = usePlayerStore();

  useEffect(() => {
    // Initialize persisted player state once on mount
    initPlayer();

    // Global keyboard listener for spacebar play/pause & media keys
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.code) {
        case 'MediaPlayPause':
        case 'Space':
          if (e.code === 'Space' && e.target !== document.body) return;
          e.preventDefault();
          togglePlay();
          break;
        case 'MediaTrackNext':
          e.preventDefault();
          nextTrack();
          break;
        case 'MediaTrackPrevious':
          e.preventDefault();
          prevTrack();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Keep audio active during browser visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('[PlayerProvider] Tab backgrounded. AudioEngine remaining active.');
      } else {
        console.log('[PlayerProvider] Tab foregrounded.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initPlayer, togglePlay, nextTrack, prevTrack]);

  return <>{children}</>;
}
