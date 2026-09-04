'use client';

import React from 'react';
import { Shuffle, Repeat, Infinity as InfinityIcon, ListMusic } from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';
import { useToast } from '@/components/ui/NeoToast';

interface SecondaryControlsProps {
  onOpenQueue: () => void;
  className?: string;
}

export default function SecondaryControls({
  onOpenQueue,
  className = '',
}: SecondaryControlsProps) {
  const { showToast } = useToast();
  const {
    shuffle,
    repeatMode,
    autoplayEnabled,
    setShuffle,
    setRepeatMode,
    setAutoplayEnabled,
  } = usePlaybackStore();

  const handleToggleShuffle = () => {
    const next = !shuffle;
    setShuffle(next);
    showToast(next ? 'Shuffle On' : 'Shuffle Off');
  };

  const handleToggleRepeat = () => {
    const next = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
    setRepeatMode(next);
    showToast(next === 'off' ? 'Repeat Off' : next === 'all' ? 'Repeat All' : 'Repeat Current Track');
  };

  const handleToggleAutoplay = () => {
    const next = !autoplayEnabled;
    setAutoplayEnabled(next);
    showToast(next ? 'Continuous Autoplay: On' : 'Continuous Autoplay: Off');
  };

  return (
    <div
      className={`w-full grid grid-cols-4 items-center justify-items-center pt-1 pb-1 select-none ${className}`}
    >
      {/* 1. Shuffle */}
      <button
        onClick={handleToggleShuffle}
        aria-label={shuffle ? 'Disable shuffle' : 'Enable shuffle'}
        title={shuffle ? 'Shuffle: On' : 'Shuffle: Off'}
        className={`p-3 transition-all cursor-pointer active:scale-90 relative ${
          shuffle ? 'text-white' : 'text-white/40 hover:text-white/70'
        }`}
      >
        <Shuffle className="w-5 h-5" />
        {shuffle && (
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#DFFF00]" />
        )}
      </button>

      {/* 2. Repeat */}
      <button
        onClick={handleToggleRepeat}
        aria-label={`Repeat mode: ${repeatMode}`}
        title={`Repeat: ${repeatMode}`}
        className={`p-3 transition-all cursor-pointer relative active:scale-90 ${
          repeatMode !== 'off' ? 'text-white' : 'text-white/40 hover:text-white/70'
        }`}
      >
        <Repeat className="w-5 h-5" />
        {repeatMode === 'one' && (
          <span className="absolute text-[8px] font-black top-2.5 right-2.5 bg-white text-black rounded-full px-1 leading-tight">
            1
          </span>
        )}
        {repeatMode === 'all' && (
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#DFFF00]" />
        )}
      </button>

      {/* 3. Continuous Autoplay Pill (Infinity) */}
      <button
        onClick={handleToggleAutoplay}
        aria-label={autoplayEnabled ? 'Disable autoplay' : 'Enable autoplay'}
        title={autoplayEnabled ? 'Continuous Autoplay: On' : 'Continuous Autoplay: Off'}
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 ${
          autoplayEnabled
            ? 'bg-white/25 text-white shadow-[0_0_15px_rgba(255,255,255,0.25)] border border-white/20'
            : 'bg-white/[0.07] text-white/60 hover:text-white hover:bg-white/[0.12] border border-white/8'
        }`}
      >
        <InfinityIcon className="w-6 h-6" />
      </button>

      {/* 4. Queue / Up Next Button */}
      <button
        onClick={onOpenQueue}
        aria-label="Open playback queue"
        title="Playback Queue"
        className="p-3 text-white/60 hover:text-white transition-colors cursor-pointer active:scale-90"
      >
        <ListMusic className="w-5 h-5" />
      </button>
    </div>
  );
}
