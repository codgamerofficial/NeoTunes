'use client';

import React from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { usePlaybackStore } from '@/store/playback-store';
import { Track, getArtistName } from '@/types';

interface WaveformVisualizerProps {
  track: Track;
}

export function WaveformVisualizer({ track }: WaveformVisualizerProps) {
  const { isPlaying, progress, duration, setPlaying, nextTrack, prevTrack, setProgress } = usePlaybackStore();

  const displayDuration = duration > 0 ? duration : (track.duration || 196);
  const progressPercent = displayDuration > 0 ? Math.min(100, Math.max(0, (progress / displayDuration) * 100)) : 0;
  const artistName = getArtistName(track.artists || track.artist);
  const albumName = typeof track.album === 'object' && track.album ? ((track.album as any).name || (track.album as any).title) : (track.album || 'Single');

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 40 dynamic frequency bars for waveform visualization
  const bars = [
    30, 45, 60, 85, 40, 70, 95, 60, 40, 80, 100, 75, 50, 90, 65, 40, 85, 70, 50, 95,
    60, 80, 40, 75, 90, 55, 70, 85, 45, 65, 95, 80, 50, 75, 40, 60, 85, 70, 45, 30
  ];

  return (
    <div className="w-full p-5 sm:p-6 rounded-3xl bg-[#11141A]/95 backdrop-blur-2xl border border-white/10 space-y-4 shadow-2xl font-sans select-none">
      {/* Title & Metadata */}
      <div className="space-y-1 text-left">
        <span className="text-[10px] font-mono font-bold text-[#DFFF00] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#DFFF00]/10 border border-[#DFFF00]/20">
          WAVEFORM FREQUENCY
        </span>
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight line-clamp-1 pt-1">
          {track.title}
        </h3>
        <p className="text-xs text-[#9AA1AD] font-medium truncate">
          {artistName} • {albumName}
        </p>
      </div>

      {/* Interactive Waveform Bar Stage */}
      <div 
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const newPercent = Math.max(0, Math.min(1, clickX / rect.width));
          setProgress(newPercent * displayDuration);
        }}
        className="h-16 sm:h-20 w-full flex items-center justify-between gap-1 cursor-pointer group py-2"
        role="slider"
        aria-label="Audio waveform scrubber"
      >
        {bars.map((barHeight, idx) => {
          const barPercent = (idx / bars.length) * 100;
          const isActive = barPercent <= progressPercent;

          return (
            <span
              key={idx}
              className={`w-1 rounded-full transition-all duration-200 ${
                isActive 
                  ? 'bg-[#DFFF00] opacity-100 scale-y-105' 
                  : 'bg-white/15 opacity-50 group-hover:bg-white/30'
              }`}
              style={{
                height: `${isPlaying ? Math.max(15, (barHeight * (0.6 + Math.sin(idx + progress * 2) * 0.4))) : barHeight}%`
              }}
            />
          );
        })}
      </div>

      {/* Metadata Detail Row */}
      <div className="flex items-center justify-between text-xs font-mono text-[#9AA1AD] border-t border-white/[0.08] pt-3">
        <span>{formatTime(progress)}</span>
        <span>{formatTime(displayDuration)}</span>
      </div>

      {/* Hero Transport Controls */}
      <div className="flex items-center justify-center gap-6 pt-1">
        <button
          onClick={prevTrack}
          className="p-3 rounded-full bg-white/5 border border-white/10 text-[#9AA1AD] hover:text-white hover:bg-white/10 transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Previous track"
        >
          <SkipBack className="w-5 h-5 fill-current" />
        </button>

        <button
          onClick={() => setPlaying(!isPlaying)}
          className="h-14 w-14 rounded-full bg-[#DFFF00] text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-black text-black" />
          ) : (
            <Play className="w-6 h-6 fill-black text-black ml-0.5" />
          )}
        </button>

        <button
          onClick={nextTrack}
          className="p-3 rounded-full bg-white/5 border border-white/10 text-[#9AA1AD] hover:text-white hover:bg-white/10 transition-all cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Next track"
        >
          <SkipForward className="w-5 h-5 fill-current" />
        </button>
      </div>
    </div>
  );
}

export default WaveformVisualizer;
