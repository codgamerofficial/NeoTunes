'use client';

import React from 'react';
import { ArrowLeft, Music, Maximize2, Headphones } from 'lucide-react';
import { Track, getArtistName } from '@/types';

export type ContextTab = 'queue' | 'lyrics' | 'recs' | 'devices';

interface PlayerHeaderProps {
  track: Track | null;
  activePanel: ContextTab | null;
  onSelectPanel: (panel: ContextTab | null) => void;
  onMinimize: () => void;
  onToggleFullscreen: () => void;
  isFullscreen?: boolean;
}

export default function PlayerHeader({
  track,
  activePanel,
  onSelectPanel,
  onMinimize,
  onToggleFullscreen,
  isFullscreen = false,
}: PlayerHeaderProps) {
  const primaryArtist = track ? getArtistName(track.artist) : 'Artist';

  return (
    <header className="sticky top-0 z-40 shrink-0 h-16 w-full grid grid-cols-[auto_1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-8 border-b border-white/10 bg-[#07090E]/90 backdrop-blur-2xl select-none pt-safe">
      {/* LEFT: Back Button */}
      <div className="flex items-center justify-start">
        <button
          onClick={onMinimize}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer text-xs font-bold tracking-wide shrink-0"
          title="Go Back (Esc)"
        >
          <ArrowLeft className="h-4 w-4 text-[#00D4FF]" />
          <span>Back</span>
        </button>
      </div>

      {/* CENTER: Sticky Now Playing Title */}
      <div className="text-center min-w-0 px-3">
        <span className="text-[9px] font-mono font-black text-[#00D4FF] tracking-[0.25em] uppercase block truncate">
          NOW PLAYING
        </span>
        {track && (
          <h2 className="text-xs sm:text-sm font-extrabold text-white truncate leading-tight">
            {track.title}{' '}
            <span className="text-white/40 font-normal">
              • {primaryArtist}
            </span>
          </h2>
        )}
      </div>

      {/* RIGHT: Quick Action Tabs & Fullscreen */}
      <div className="flex items-center justify-end gap-1 sm:gap-1.5">
        <div className="flex items-center gap-1 sm:gap-1.5 bg-black/60 p-1 rounded-full border border-white/10 shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => onSelectPanel(activePanel === 'lyrics' ? null : 'lyrics')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activePanel === 'lyrics'
                ? 'bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] text-black shadow-[0_0_14px_rgba(0,212,255,0.4)]'
                : 'text-white/60 hover:text-white'
            }`}
            title="Synced Lyrics"
          >
            Lyrics
          </button>

          <button
            onClick={() => onSelectPanel(activePanel === 'queue' ? null : 'queue')}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              activePanel === 'queue' ? 'text-[#00D4FF] bg-white/10' : 'text-white/60 hover:text-white'
            }`}
            title="Queue (Q)"
          >
            <Music className="h-4 w-4" />
          </button>

          <button
            onClick={() => onSelectPanel(activePanel === 'devices' ? null : 'devices')}
            className={`p-1.5 rounded-full transition-all cursor-pointer hidden sm:block ${
              activePanel === 'devices' ? 'text-[#00D4FF] bg-white/10' : 'text-white/60 hover:text-white'
            }`}
            title="Audio Devices"
          >
            <Headphones className="h-4 w-4" />
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

          <button
            onClick={onToggleFullscreen}
            className="p-1.5 rounded-full text-white/60 hover:text-white transition-all cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen (F)'}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
