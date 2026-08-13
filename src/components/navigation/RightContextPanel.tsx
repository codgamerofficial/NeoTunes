'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePlaybackStore } from '@/store/playback-store';
import { useLayoutStore } from '@/store/layout-store';
import { 
  X, 
  Heart, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  ListMusic, 
  Disc,
  Volume2
} from 'lucide-react';
import Soundstage3DWidget from '@/components/widgets/Soundstage3DWidget';

export default function RightContextPanel() {
  const { 
    currentTrack, 
    isPlaying, 
    progress,
    duration,
    setPlaying, 
    prevTrack, 
    nextTrack, 
    queue,
    setProgress
  } = usePlaybackStore();
  
  const { isRightPanelOpen, toggleRightPanel, rightPanelTab } = useLayoutStore();

  const [isLiked, setIsLiked] = useState(false);
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[] | null>(null);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const trackTitle = currentTrack?.title || 'Patar Bashori';
  const trackArtist = typeof currentTrack?.artist === 'object' ? (currentTrack.artist as any)?.name : (currentTrack?.artist || 'Ishaan, Sunidhi');
  const trackCover = currentTrack?.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80';
  const displayDuration = duration > 0 ? duration : 262;
  const progressPercent = displayDuration > 0 ? (progress / displayDuration) * 100 : 35;

  if (!isRightPanelOpen) return null;

  return (
    <aside className="w-80 sm:w-96 flex-shrink-0 bg-[#000000] border-l border-white/10 p-4 flex flex-col gap-4 h-full z-30 select-none overflow-y-auto scrollbar-none">
      
      {/* ── 1. SOUNDSTAGE 3D WIDGET ── */}
      <Soundstage3DWidget />

      {/* ── 2. NOW PLAYING & CONTEXT PANEL ── */}
      <div className="p-5 rounded-[28px] bg-[#121318] border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#AFC7FF] tracking-wider uppercase">
            <span className="h-2 w-2 rounded-full bg-[#AFC7FF] animate-pulse" />
            NOW PLAYING
          </div>
          <button onClick={toggleRightPanel} className="p-1 rounded-full text-white/40 hover:text-white transition-colors cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Album Artwork */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
          <img src={trackCover} alt={trackTitle} className="h-full w-full object-cover" />
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-white/70 hover:text-[#FF2D95] transition-colors cursor-pointer"
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'text-[#FF2D95] fill-[#FF2D95]' : ''}`} />
          </button>
        </div>

        {/* Title & Badges */}
        <div className="space-y-1">
          <h3 className="text-base font-black text-white truncate">{trackTitle}</h3>
          <p className="text-xs text-[#AFC7FF] font-bold truncate">{trackArtist}</p>
          
          <div className="flex items-center gap-2 pt-1">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#7A3CFF]/20 text-[#7A3CFF] border border-[#7A3CFF]/40">
              Soundstage 3D
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#AFC7FF]/20 text-[#AFC7FF] border border-[#AFC7FF]/40">
              256kbps AAC
            </span>
          </div>
        </div>

        {/* Scrubber & Live Progress */}
        <div className="space-y-1 pt-1">
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              setProgress((clickX / rect.width) * displayDuration);
            }}
            className="h-1.5 w-full bg-white/10 rounded-full cursor-pointer overflow-hidden group hover:h-2 transition-all"
          >
            <div
              className="h-full bg-[#AFC7FF] rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-[#A8A7AF] font-bold">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(displayDuration)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
