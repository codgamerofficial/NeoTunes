'use client';

import React from 'react';
import { ArrowLeft, Mic2, ListMusic, Headphones, Maximize2, Minimize2 } from 'lucide-react';
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
    <header className="shrink-0 h-[68px] w-full grid grid-cols-[auto_1fr_auto] items-center px-4 sm:px-6 lg:px-8 border-b border-white/[0.06] bg-[#050608]/80 backdrop-blur-2xl select-none z-30">
      
      {/* LEFT: Back Button */}
      <div className="flex items-center justify-start">
        <button
          onClick={onMinimize}
          aria-label="Back to previous page"
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer text-xs font-bold shrink-0 min-h-[44px]"
          title="Back (Esc)"
        >
          <ArrowLeft className="h-4 w-4 text-[#DFFF00]" />
          <span>Back</span>
        </button>
      </div>

      {/* CENTER: Now Playing Context */}
      <div className="text-center min-w-0 px-4 max-w-[clamp(300px,45vw,800px)] mx-auto">
        <span className="text-[10px] font-bold text-[#DFFF00] tracking-[0.2em] uppercase block truncate">
          NOW PLAYING
        </span>
        {track && (
          <h2 className="text-xs sm:text-sm font-bold text-white truncate leading-tight mt-0.5">
            {track.title}{' '}
            <span className="text-[#9AA1AD] font-normal">
              • {primaryArtist}
            </span>
          </h2>
        )}
      </div>

      {/* RIGHT: Context Tabs & Fullscreen Icon Buttons */}
      <div className="flex items-center justify-end gap-1.5 sm:gap-2">
        {/* Lyrics Button */}
        <button
          onClick={() => onSelectPanel(activePanel === 'lyrics' ? null : 'lyrics')}
          aria-label="Lyrics"
          className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
            activePanel === 'lyrics'
              ? 'bg-[#DFFF00] text-black border-[#DFFF00] shadow-[0_0_12px_rgba(223,255,0,0.3)]'
              : 'bg-white/5 border-white/10 text-[#9AA1AD] hover:text-white hover:bg-white/10'
          }`}
          title="Lyrics (L)"
        >
          <Mic2 className="h-4 w-4" />
        </button>

        {/* Queue Button */}
        <button
          onClick={() => onSelectPanel(activePanel === 'queue' ? null : 'queue')}
          aria-label="Up Next Queue"
          className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
            activePanel === 'queue'
              ? 'bg-[#DFFF00] text-black border-[#DFFF00] shadow-[0_0_12px_rgba(223,255,0,0.3)]'
              : 'bg-white/5 border-white/10 text-[#9AA1AD] hover:text-white hover:bg-white/10'
          }`}
          title="Queue (Q)"
        >
          <ListMusic className="h-4 w-4" />
        </button>

        {/* Devices Button */}
        <button
          onClick={() => onSelectPanel(activePanel === 'devices' ? null : 'devices')}
          aria-label="Audio Devices"
          className={`h-9 w-9 rounded-full flex items-center justify-center border transition-all cursor-pointer hidden sm:flex ${
            activePanel === 'devices'
              ? 'bg-[#DFFF00] text-black border-[#DFFF00] shadow-[0_0_12px_rgba(223,255,0,0.3)]'
              : 'bg-white/5 border-white/10 text-[#9AA1AD] hover:text-white hover:bg-white/10'
          }`}
          title="Audio Devices"
        >
          <Headphones className="h-4 w-4" />
        </button>

        <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

        {/* Fullscreen Button */}
        <button
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          className="h-9 w-9 rounded-full bg-white/5 border border-white/10 text-[#9AA1AD] hover:text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen (F)'}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

    </header>
  );
}
