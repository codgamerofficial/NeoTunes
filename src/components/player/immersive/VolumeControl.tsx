'use client';

import React from 'react';
import { Volume1, Volume2, VolumeX } from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';

interface VolumeControlProps {
  className?: string;
}

export default function VolumeControl({ className = '' }: VolumeControlProps) {
  const { volume, isMuted, setVolume, toggleMute } = usePlaybackStore();

  const handleVolumeBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rawVal = (e.clientX - rect.left) / rect.width;
    const clampedVal = Math.max(0, Math.min(1, rawVal));
    setVolume(clampedVal);
  };

  const effectiveVolume = isMuted ? 0 : volume;

  return (
    <div
      className={`w-full flex items-center gap-3 px-2 py-0.5 select-none ${className}`}
    >
      {/* Mute / Low Volume Icon Button */}
      <button
        onClick={toggleMute}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        title={isMuted ? 'Unmute' : 'Mute'}
        className="text-white/60 hover:text-white transition-colors cursor-pointer p-1.5 active:scale-90"
      >
        {isMuted || volume === 0 ? (
          <VolumeX className="w-4 h-4 text-red-400" />
        ) : (
          <Volume1 className="w-4 h-4" />
        )}
      </button>

      {/* Interactive Volume Slider */}
      <div
        className="relative flex-1 h-3 flex items-center cursor-pointer group touch-none"
        onClick={handleVolumeBarClick}
        role="slider"
        aria-label="Volume slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(effectiveVolume * 100)}
      >
        <div className="h-1 w-full bg-white/20 group-hover:h-1.5 rounded-full relative overflow-hidden transition-all">
          <div
            className="h-full bg-white rounded-full transition-all duration-75"
            style={{ width: `${effectiveVolume * 100}%` }}
          />
        </div>
      </div>

      {/* High Volume Icon Button */}
      <button
        onClick={() => setVolume(1)}
        aria-label="Set full volume"
        title="Full volume"
        className="text-white/60 hover:text-white transition-colors cursor-pointer p-1.5 active:scale-90"
      >
        <Volume2 className="w-4 h-4" />
      </button>
    </div>
  );
}
