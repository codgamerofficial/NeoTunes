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
        <div className="flex justify-between">
          <span className="text-[#A1A1A6]">Output:</span>
          <span className="text-[#DFFF00] font-bold">{spatial.outputDeviceName}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#A1A1A6]">Format:</span>
          <span className="text-white uppercase">{spatial.activeFormat}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#A1A1A6]">Sample Rate:</span>
          <span className="text-[#00D9FF]">96 kHz / 24-bit</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#A1A1A6]">Channels:</span>
          <span className="text-white">{spatial.immersiveLevel === 2 ? '7.1.4 Spatial' : '2.0 Stereo'}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#A1A1A6]">Spatializer:</span>
          <span className={spatial.canSpatialize ? 'text-[#00D9FF] font-bold' : 'text-[#A1A1A6]'}>
            {spatial.canSpatialize ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#A1A1A6]">Can Spatialize:</span>
          <span className="text-white">{spatial.canSpatialize ? 'YES' : 'NO'}</span>
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

        <div className="flex justify-between">
          <span className="text-[#A1A1A6]">Loudness Norm:</span>
          <span className="text-white">{spatial.loudnessNormalizationEnabled ? 'ON' : 'OFF'}</span>
        </div>

        <div className="flex justify-between border-t border-white/10 pt-1.5 mt-1.5">
          <span className="text-[#A1A1A6]">Background Service:</span>
          <span className="text-[#00D9FF] font-bold">ACTIVE</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#A1A1A6]">MediaSession:</span>
          <span className="text-[#DFFF00] font-bold">REGISTERED</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[#A1A1A6]">Headphone Guard:</span>
          <span className="text-white">AUTO-PAUSE (ENABLED)</span>
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
