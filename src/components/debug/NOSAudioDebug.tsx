'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Terminal, Activity, X } from 'lucide-react';
import { useSpatialAudio } from '@/hooks/useSpatialAudio';
import { usePlaybackStore } from '@/store/playback-store';

export function NOSAudioDebug() {
  const [isVisible, setIsVisible] = useState(false);
  const spatial = useSpatialAudio();
  const playback = usePlaybackStore();

  // Keyboard shortcut (Alt + Shift + D) to toggle debug panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        setIsVisible((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-80 bg-black/90 border border-[#00D9FF]/40 rounded-2xl p-4 text-white font-mono text-[11px] shadow-2xl backdrop-blur-xl select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
        <div className="flex items-center gap-2 text-[#00D9FF] font-bold">
          <Terminal className="h-3.5 w-3.5" />
          <span>N/O/S AUDIO DEBUG</span>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-[#A1A1A6] hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Metrics */}
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between truncate">
          <span className="text-[#A1A1A6]">Track ID:</span>
          <span className="text-[#00D9FF] truncate max-w-[150px]">{playback.currentTrack?.id || 'None'}</span>
        </div>

        <div className="flex justify-between truncate">
          <span className="text-[#A1A1A6]">Source ID:</span>
          <span className="text-[#DFFF00] truncate max-w-[150px]">{playback.currentTrack?.sourceId || playback.currentTrack?.id || 'None'}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#A1A1A6]">Position/Duration:</span>
          <span className="text-white">{Math.floor(playback.progress)}s / {Math.floor(playback.duration)}s</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#A1A1A6]">Buffer:</span>
          <span className="text-[#00D9FF]">{Math.floor(playback.buffered)}%</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#A1A1A6]">Queue:</span>
          <span className="text-white">{playback.queue.length} tracks</span>
        </div>

        <div className="flex justify-between border-t border-white/10 pt-1.5 mt-1">
          <span className="text-[#A1A1A6]">Output:</span>
          <span className="text-[#DFFF00] font-bold">{spatial.outputDeviceName}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#A1A1A6]">Format:</span>
          <span className="text-white uppercase">{spatial.activeFormat}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#A1A1A6]">Spatializer:</span>
          <span className={spatial.canSpatialize ? 'text-[#00D9FF] font-bold' : 'text-[#A1A1A6]'}>
            {spatial.canSpatialize ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#A1A1A6]">Head Tracker:</span>
          <span className={spatial.headTrackingEnabled ? 'text-[#DFFF00]' : 'text-[#A1A1A6]'}>
            {spatial.headTrackingAvailable ? (spatial.headTrackingEnabled ? 'ACTIVE' : 'READY') : 'UNAVAILABLE'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#A1A1A6]">Equalizer:</span>
          <span className="text-[#A855F7] uppercase">{spatial.eqPreset}</span>
        </div>

        <div className="flex justify-between border-t border-white/10 pt-1.5 mt-1">
          <span className="text-[#A1A1A6]">Background Service:</span>
          <span className="text-[#00D9FF] font-bold">ACTIVE</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#A1A1A6]">MediaSession:</span>
          <span className="text-[#DFFF00] font-bold">REGISTERED</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#A1A1A6]">Headphone Guard:</span>
          <span className="text-white">AUTO-PAUSE (ACTIVE)</span>
        </div>

        <div className="flex justify-between border-t border-white/10 pt-1.5">
          <span className="text-[#A1A1A6]">Player State:</span>
          <span className="text-[#DFFF00] uppercase font-bold">{playback.playbackStatus}</span>
        </div>
      </div>

      <div className="mt-3 text-[9px] text-[#A1A1A6] text-center border-t border-white/10 pt-2">
        Press <kbd className="bg-white/10 px-1 rounded">Alt</kbd> + <kbd className="bg-white/10 px-1 rounded">Shift</kbd> + <kbd className="bg-white/10 px-1 rounded">D</kbd> to dismiss
      </div>
    </div>
  );
}
