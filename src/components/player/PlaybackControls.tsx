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
  showVolume?: boolean;
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
  showVolume = true,
}: PlaybackControlsProps) {
  return (
    <div className={`flex flex-col items-center space-y-1.5 sm:space-y-2 select-none shrink-0 w-full ${className}`}>
      
      {/* Primary Transport Controls (Shuffle, Prev, Hero Play/Pause, Next, Repeat) */}
      <div className="flex items-center justify-center gap-6 sm:gap-8 lg:gap-9 w-full">
        
        {/* Shuffle Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleShuffle();
          }}
          aria-label={shuffle ? 'Disable shuffle' : 'Enable shuffle'}
          className={`h-11 w-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            shuffle
              ? 'bg-[#DFFF00]/15 text-[#DFFF00] border border-[#DFFF00]/40'
              : 'text-[#9AA1AD] hover:text-white hover:bg-white/5'
          }`}
          title={shuffle ? 'Shuffle On' : 'Shuffle Off'}
        >
          <Shuffle className="h-5 w-5" />
        </button>

        {/* Previous Track Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="Previous track"
          className="h-12 w-12 rounded-full flex items-center justify-center text-white/85 hover:text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
          title="Previous Track (P / ←)"
        >
          <SkipBack className="h-6 w-6 fill-white/85" />
        </button>

        {/* Hero 68px–72px Signature Electric Lime Play/Pause Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePlay();
          }}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="h-16 w-16 sm:h-[72px] sm:w-[72px] rounded-full bg-[#DFFF00] text-black flex items-center justify-center shadow-[0_8px_25px_rgba(223,255,0,0.35)] hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
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
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Next track"
          className="h-12 w-12 rounded-full flex items-center justify-center text-white/85 hover:text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
          title="Next Track (N / →)"
        >
          <SkipForward className="h-6 w-6 fill-white/85" />
        </button>

        {/* Repeat Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleRepeat();
          }}
          aria-label={`Repeat mode: ${repeatMode}`}
          className={`h-11 w-11 rounded-full flex items-center justify-center transition-all cursor-pointer relative ${
            repeatMode !== 'off'
              ? 'bg-[#DFFF00]/15 text-[#DFFF00] border border-[#DFFF00]/40'
              : 'text-[#9AA1AD] hover:text-white hover:bg-white/5'
          }`}
          title={`Repeat: ${repeatMode}`}
        >
          <Repeat className="h-5 w-5" />
          {repeatMode === 'one' && (
            <span className="absolute text-[8px] font-black text-[#DFFF00] -top-1 -right-1 bg-black rounded-full px-1">
              1
            </span>
          )}
        </button>

      </div>

      {/* Secondary Volume Control (Desktop only) */}
      {showVolume && (
        <div className="flex items-center justify-center gap-2.5 w-44 sm:w-52 pt-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            className="text-[#9AA1AD] hover:text-white transition-colors cursor-pointer p-1"
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
            aria-label="Volume slider"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#DFFF00]"
          />
        </div>
      )}

    </div>
  );
}
