'use client';

import React, { useEffect } from 'react';
import { usePlaybackStore } from '@/store/playback-store';
import { audioEngine } from './AudioEngine';
import { mediaSession } from './MediaSession';

interface PlayerProviderProps {
  children: React.ReactNode;
}

export default function PlayerProvider({ children }: PlayerProviderProps) {
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const currentTrack = usePlaybackStore((s) => s.currentTrack);
  const setPlaying = usePlaybackStore((s) => s.setPlaying);
  const nextTrack = usePlaybackStore((s) => s.nextTrack);
  const prevTrack = usePlaybackStore((s) => s.prevTrack);
  const setProgress = usePlaybackStore((s) => s.setProgress);
  const setDuration = usePlaybackStore((s) => s.setDuration);
  const setPlaybackStatus = usePlaybackStore((s) => s.setPlaybackStatus);

  useEffect(() => {
    // Wire AudioEngine Event Callbacks
    audioEngine.setOptions({
      onProgress: (currentTime, duration) => {
        setProgress(currentTime);
        if (duration && duration > 0) {
          setDuration(duration);
        }
        mediaSession.updatePositionState(duration || 0, currentTime);
      },
      onStatusChange: (status, message) => {
        setPlaybackStatus(status, message);
        mediaSession.updatePlaybackState(status === 'playing' ? 'playing' : status === 'paused' ? 'paused' : 'none');
      },
      onEnded: () => {
        nextTrack();
      },
    });

    // Wire MediaSession Action Handlers
    mediaSession.setupActionHandlers({
      onPlay: () => setPlaying(true),
      onPause: () => setPlaying(false),
      onNext: () => nextTrack(),
      onPrev: () => prevTrack(),
      onSeekTo: ({ seekTime }) => {
        setProgress(seekTime);
        audioEngine.seek(seekTime);
      },
    });

    // Global keyboard listener for spacebar play/pause & media keys
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.code) {
        case 'MediaPlayPause':
        case 'Space':
          if (e.code === 'Space' && e.target !== document.body) return;
          e.preventDefault();
          setPlaying(!usePlaybackStore.getState().isPlaying);
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
  }, [setPlaying, nextTrack, prevTrack, setProgress, setDuration, setPlaybackStatus]);

  // Sync MediaSession metadata whenever currentTrack changes
  useEffect(() => {
    mediaSession.updateMetadata(currentTrack);
  }, [currentTrack]);

  return <>{children}</>;
}
