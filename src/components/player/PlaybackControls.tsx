'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX } from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  shuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  volume: number;
  isMuted: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  className?: string;
}

export default function PlaybackControls({
  isPlaying,
  shuffle,
  repeatMode,
  volume,
  isMuted,
  onTogglePlay,
  onPrev,
  onNext,
  onToggleShuffle,
  onToggleRepeat,
  onVolumeChange,
  onToggleMute,
  className = '',
}: PlaybackControlsProps) {
  return (
    <div className={`flex flex-col items-center space-y-4 select-none ${className}`}>
      {/* Primary Transport Controls */}
      <div className="flex items-center gap-6 sm:gap-8">
        {/* Shuffle Button */}
        <button
          onClick={onToggleShuffle}
          className={`p-2.5 rounded-full transition-all cursor-pointer ${
            shuffle
              ? 'bg-[#DFFF00]/15 text-[#DFFF00] border border-[#DFFF00]/40'
              : 'text-white/40 hover:text-white'
          }`}
          title={shuffle ? 'Shuffle On' : 'Shuffle Off'}
        >
          <Shuffle className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* Previous Track Button */}
        <button
          onClick={onPrev}
          className="p-2.5 text-white/70 hover:text-white transition-colors cursor-pointer hover:scale-110 active:scale-95"
          title="Previous Track (←)"
        >
          <SkipBack className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>

        {/* 68px Signature N/OS Play/Pause Hero Button */}
        <button
          onClick={onTogglePlay}
          className="h-16 w-16 sm:h-18 sm:w-18 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:bg-[#DFFF00] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {isPlaying ? (
            <Pause className="h-7 w-7 sm:h-8 sm:w-8 fill-black text-black" />
          ) : (
            <Play className="h-7 w-7 sm:h-8 sm:w-8 fill-black text-black ml-1" />
          )}
        </button>

        {/* Next Track Button */}
        <button
          onClick={onNext}
          className="p-2.5 text-white/70 hover:text-white transition-colors cursor-pointer hover:scale-110 active:scale-95"
          title="Next Track (→)"
        >
          <SkipForward className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>

        {/* Repeat Button */}
        <button
          onClick={onToggleRepeat}
          className={`p-2.5 rounded-full transition-all cursor-pointer ${
            repeatMode !== 'off'
              ? 'bg-[#DFFF00]/15 text-[#DFFF00] border border-[#DFFF00]/40'
              : 'text-white/40 hover:text-white'
          }`}
          title={`Repeat: ${repeatMode}`}
        >
          <Repeat className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      {/* Secondary Volume Control */}
      <div className="flex items-center gap-2.5 w-48 sm:w-56 pt-1">
        <button
          onClick={onToggleMute}
          className="text-white/50 hover:text-white transition-colors cursor-pointer"
          title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="h-4 w-4 text-red-400" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>

        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={isMuted ? 0 : volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#DFFF00]"
          title="Volume Control"
        />
      </div>
    </div>
  );
}
