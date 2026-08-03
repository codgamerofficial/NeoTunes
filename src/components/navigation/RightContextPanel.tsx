'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useLayoutStore } from '@/store/layout-store';
import { 
  X, 
  Heart, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2, 
  ListMusic, 
  GripVertical,
  Music,
  Mic2,
  Zap,
  Sparkles,
  Trash2,
  Headphones
} from 'lucide-react';
import Soundstage3DWidget from '@/components/widgets/Soundstage3DWidget';

export default function RightContextPanel() {
  const { 
    currentTrack, 
    isPlaying, 
    currentTime,
    duration,
    togglePlay, 
    previousTrack, 
    nextTrack, 
    queue,
    clearQueue, 
    playTrack,
    seek
  } = usePlayerStore();
  
  const { isRightPanelOpen, toggleRightPanel, rightPanelTab, setRightPanelTab } = useLayoutStore();

  const [isLiked, setIsLiked] = useState(false);
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[] | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  
  const activeLineRef = useRef<HTMLParagraphElement | null>(null);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const trackTitle = currentTrack?.title || 'Tum Hi Ho';
  const trackArtist = typeof currentTrack?.artist === 'object' ? (currentTrack.artist as any)?.name : (currentTrack?.artist || 'Arijit Singh');
  const trackCover = currentTrack?.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80';
  const displayDuration = duration > 0 ? duration : 262;
  const progressPercent = displayDuration > 0 ? (currentTime / displayDuration) * 100 : 35;

  // Fetch Synced Lyrics for Right Panel Lyrics Tab
  useEffect(() => {
    if (!currentTrack?.title || rightPanelTab !== 'lyrics') return;
    let isCancelled = false;
    setLyricsLoading(true);

    const title = currentTrack.title;
    const artist = typeof currentTrack.artist === 'object' ? (currentTrack.artist as any)?.name : currentTrack.artist || '';
    const durationMs = currentTrack.durationMs || (duration ? duration * 1000 : 0);

    fetch(`/api/lyrics?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}&durationMs=${durationMs}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled) {
          if (data && data.lyrics && data.lyrics.length > 0) {
            setLyrics(data.lyrics);
          } else {
            setLyrics(null);
          }
          setLyricsLoading(false);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setLyrics(null);
          setLyricsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [currentTrack?.title, trackArtist, rightPanelTab]);

  if (!isRightPanelOpen) return null;

  const defaultSuggestedQueue = [
    { id: 'sq1', title: 'Kesariya', artist: 'Arijit Singh', durationMs: 227000, sourceType: 'youtube' as const, coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&q=80' },
    { id: 'sq2', title: 'After Hours', artist: 'The Weeknd', durationMs: 240000, sourceType: 'youtube' as const, coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=200&q=80' },
    { id: 'sq3', title: 'Heat Waves', artist: 'Glass Animals', durationMs: 238000, sourceType: 'youtube' as const, coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&q=80' },
  ];

  const activeQueue = queue && queue.length > 0 ? queue : defaultSuggestedQueue;

  return (
    <aside className="w-80 sm:w-96 flex-shrink-0 bg-[#070512] border-l border-white/10 p-4 flex flex-col gap-4 h-full z-30 select-none overflow-y-auto scrollbar-none">
      
      {/* ── 1. SOUNDSTAGE 3D WIDGET (Matching Right Side of Design Image) ── */}
      <Soundstage3DWidget />

      {/* ── 2. NOW PLAYING & CONTEXT PANEL ── */}
      <div className="p-5 rounded-[28px] bg-[#100D22] border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#00D4FF] tracking-wider uppercase">
            <span className="h-2 w-2 rounded-full bg-[#00D4FF] animate-ping" />
            NOW PLAYING
          </div>
          <button onClick={toggleRightPanel} className="p-1 rounded-full text-white/40 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Album Artwork */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
          <img src={trackCover} alt={trackTitle} className="h-full w-full object-cover" />
          <button 
            onClick={() => setIsLiked(!isLiked)}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-white/70 hover:text-[#FF2D95] transition-colors"
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'text-[#FF2D95] fill-[#FF2D95]' : ''}`} />
          </button>
        </div>

        {/* Title & Badges */}
        <div className="space-y-1">
          <h3 className="text-base font-black text-white truncate">{trackTitle}</h3>
          <p className="text-xs text-[#00D4FF] font-bold truncate">{trackArtist}</p>
          
          <div className="flex items-center gap-2 pt-1">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#7A3CFF]/20 text-[#7A3CFF] border border-[#7A3CFF]/40">
              Soundstage 3D
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40">
              Lossless FLAC
            </span>
          </div>
        </div>

        {/* Scrubber & Live Progress */}
        <div className="space-y-1 pt-1">
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              seek((clickX / rect.width) * displayDuration);
            }}
            className="h-1.5 w-full bg-white/10 rounded-full cursor-pointer overflow-hidden group hover:h-2 transition-all"
          >
            <div
              className="h-full bg-gradient-to-r from-[#00D4FF] via-[#7A3CFF] to-[#FF2D95] rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-white/40 font-bold">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(displayDuration)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
