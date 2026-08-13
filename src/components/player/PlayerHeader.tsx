'use client';

import React from 'react';
import { ChevronDown, Music, Cast, Sliders, Maximize2, Sparkles, Volume2 } from 'lucide-react';
import { Track, getArtistName } from '@/types';

interface PlayerHeaderProps {
  track: Track | null;
  activePanel: 'lyrics' | 'visualizer' | 'equalizer' | 'queue' | 'devices' | null;
  onSelectPanel: (panel: 'lyrics' | 'visualizer' | 'equalizer' | 'queue' | 'devices' | null) => void;
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
  const primaryArtist = track ? getArtistName(track.artist).split(',')[0] : 'Artist';

  return (
    <header className="relative z-30 shrink-0 h-16 flex items-center justify-between px-4 sm:px-8 border-b border-white/5 bg-[#07090E]/80 backdrop-blur-xl select-none">
      {/* Minimize / Back Button */}
      <button
        onClick={onMinimize}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer text-xs font-semibold"
        title="Minimize Player (Esc)"
      >
        <ChevronDown className="h-4 w-4" />
        <span className="hidden sm:inline">Back</span>
      </button>

      {/* Floating Center Identity (Minimal) */}
      <div className="text-center min-w-0 max-w-[45%] px-2">
        <span className="text-[9px] font-mono font-black text-[#00D9FF] tracking-[0.25em] uppercase block">
          NOW PLAYING
        </span>
        {track && (
          <h2 className="text-xs sm:text-sm font-extrabold text-white truncate">
            {track.title}{' '}
            <span className="text-white/40 font-normal">
              • {primaryArtist}
            </span>
          </h2>
        )}
      </div>

      {/* Quick Action Toggle Buttons */}
      <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-full border border-white/10">
        <button
          onClick={() => onSelectPanel(activePanel === 'lyrics' ? null : 'lyrics')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activePanel === 'lyrics'
              ? 'bg-gradient-to-r from-[#00D9FF] to-[#6D3BFF] text-white shadow-[0_0_12px_rgba(0,217,255,0.4)]'
              : 'text-white/60 hover:text-white'
          }`}
          title="Synced Lyrics"
        >
          Lyrics
        </button>

        <button
          onClick={() => onSelectPanel(activePanel === 'visualizer' ? null : 'visualizer')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activePanel === 'visualizer'
              ? 'bg-gradient-to-r from-[#00D9FF] to-[#6D3BFF] text-white shadow-[0_0_12px_rgba(0,217,255,0.4)]'
              : 'text-white/60 hover:text-white'
          }`}
          title="Audio Visualizer"
        >
          Visualizer
        </button>

        <button
          onClick={() => onSelectPanel(activePanel === 'equalizer' ? null : 'equalizer')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activePanel === 'equalizer'
              ? 'bg-gradient-to-r from-[#00D9FF] to-[#6D3BFF] text-white shadow-[0_0_12px_rgba(0,217,255,0.4)]'
              : 'text-white/60 hover:text-white'
          }`}
          title="Studio EQ & Soundstage"
        >
          Studio EQ
        </button>

        <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

        <button
          onClick={() => onSelectPanel(activePanel === 'queue' ? null : 'queue')}
          className={`p-1.5 rounded-full transition-all cursor-pointer ${
            activePanel === 'queue' ? 'text-[#00D9FF] bg-white/10' : 'text-white/60 hover:text-white'
          }`}
          title="Queue (Q)"
        >
          <Music className="h-4 w-4" />
        </button>

        <button
          onClick={onToggleFullscreen}
          className="p-1.5 rounded-full text-white/60 hover:text-white transition-all cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen (F)'}
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
