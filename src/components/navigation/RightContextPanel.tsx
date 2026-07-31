'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useLayoutStore, RightPanelTab } from '@/store/layout-store';
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
  Cast, 
  ListMusic, 
  MoreHorizontal,
  GripVertical,
  ShieldCheck,
  Music,
  Mic2,
  Zap,
  Sparkles,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    removeFromQueue,
    seek
  } = usePlayerStore();
  
  const { isRightPanelOpen, toggleRightPanel, rightPanelTab, setRightPanelTab } = useLayoutStore();

  const [isLiked, setIsLiked] = useState(false);
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[] | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  
  const activeLineRef = useRef<HTMLParagraphElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const trackTitle = currentTrack?.title || 'No Track Playing';
  const trackArtist = typeof currentTrack?.artist === 'object' ? (currentTrack.artist as any)?.name : (currentTrack?.artist || 'Select a track');
  const trackCover = currentTrack?.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80';
  const displayDuration = duration > 0 ? duration : 210;
  const progressPercent = displayDuration > 0 ? (currentTime / displayDuration) * 100 : 0;

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

  // Active Lyric Line Index Calculation
  let activeLyricIndex = -1;
  if (lyrics && lyrics.length > 0) {
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) {
        activeLyricIndex = i;
      } else {
        break;
      }
    }
  }

  // Smooth Auto-scroll to active lyric line in Right Panel
  useEffect(() => {
    if (activeLineRef.current && rightPanelTab === 'lyrics') {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLyricIndex, rightPanelTab]);

  // Real-Time Mini Spectrum Canvas in Right Panel
  useEffect(() => {
    if (rightPanelTab !== 'visualizer' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const bars = 24;
      const barWidth = (width / bars) - 3;

      for (let i = 0; i < bars; i++) {
        const barHeight = isPlaying 
          ? Math.sin(phase + i * 0.4) * (height * 0.4) + (height * 0.45)
          : 8;

        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#00D4FF');
        gradient.addColorStop(1, '#FF2D95');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(i * (barWidth + 3), height - barHeight, barWidth, barHeight, 4);
        ctx.fill();
      }

      phase += 0.1;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [rightPanelTab, isPlaying]);

  if (!isRightPanelOpen) return null;

  const defaultSuggestedQueue = [
    { id: 'sq1', title: 'Kesariya', artist: 'Arijit Singh', durationMs: 227000, sourceType: 'youtube' as const, coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&q=80' },
    { id: 'sq2', title: 'After Hours', artist: 'The Weeknd', durationMs: 240000, sourceType: 'youtube' as const, coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=200&q=80' },
    { id: 'sq3', title: 'Heat Waves', artist: 'Glass Animals', durationMs: 238000, sourceType: 'youtube' as const, coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&q=80' },
  ];

  const activeQueue = queue && queue.length > 0 ? queue : defaultSuggestedQueue;

  return (
    <aside className="w-80 sm:w-96 flex-shrink-0 bg-[#0A0A0E] border-l border-white/10 p-4 flex flex-col gap-4 h-full z-30 select-none overflow-y-auto scrollbar-none">
      
      {/* ── 1. PLAYING NOW CARD ── */}
      <div className="p-5 rounded-[28px] bg-[#121218] border border-white/10 space-y-4 shadow-xl">
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
              Dolby Atmos
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

        {/* Playback Controls */}
        <div className="flex items-center justify-between px-2 pt-1">
          <button className="text-white/40 hover:text-white transition-colors">
            <Shuffle className="h-4 w-4" />
          </button>
          <button onClick={previousTrack} className="text-white/80 hover:text-white transition-colors">
            <SkipBack className="h-5 w-5" />
          </button>
          <button
            onClick={togglePlay}
            className="h-12 w-12 rounded-full bg-gradient-to-tr from-[#7A3CFF] to-[#00D4FF] text-black flex items-center justify-center shadow-[0_0_20px_#7A3CFF] hover:scale-105 transition-transform"
          >
            {isPlaying ? <Pause className="h-6 w-6 fill-black" /> : <Play className="h-6 w-6 fill-black ml-0.5" />}
          </button>
          <button onClick={nextTrack} className="text-white/80 hover:text-white transition-colors">
            <SkipForward className="h-5 w-5" />
          </button>
          <button className="text-white/40 hover:text-white transition-colors">
            <Repeat className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── 2. DYNAMIC CONTEXT CARD (QUEUE / LYRICS / VISUALIZER) ── */}
      <div className="flex-1 p-5 rounded-[28px] bg-[#121218] border border-white/10 space-y-4 shadow-xl flex flex-col overflow-hidden">
        
        {/* Tab Selector */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-full border border-white/10">
            {(['queue', 'lyrics', 'visualizer'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setRightPanelTab(tab)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                  rightPanelTab === tab ? 'bg-[#00D4FF] text-black shadow-[0_0_10px_#00D4FF]' : 'text-white/50 hover:text-white'
                }`}
              >
                {tab === 'queue' ? 'Up Next' : tab === 'lyrics' ? 'Lyrics' : 'Visualizer'}
              </button>
            ))}
          </div>

          {rightPanelTab === 'queue' && (
            <button
              onClick={clearQueue}
              className="p-1.5 rounded-full text-white/40 hover:text-[#FF2D95] transition-colors"
              title="Clear Queue"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* UP NEXT QUEUE VIEW */}
        {rightPanelTab === 'queue' && (
          <div className="flex-1 overflow-y-auto scrollbar-none space-y-2">
            {activeQueue.length === 0 ? (
              <div className="text-center py-8 text-xs text-white/40 italic">Queue is empty</div>
            ) : (
              activeQueue.map((tr, idx) => (
                <div
                  key={`${tr.id}-${idx}`}
                  onClick={() => playTrack(tr as any)}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/5 hover:border-[#00D4FF]/40 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xs font-mono font-bold text-white/40 w-4">{idx + 1}</span>
                    <img src={tr.coverUrl} alt="" className="h-9 w-9 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-white group-hover:text-[#00D4FF] truncate transition-colors">{tr.title}</div>
                      <div className="text-[10px] text-white/50 truncate">{typeof tr.artist === 'object' ? (tr.artist as any)?.name : tr.artist}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-white/40">
                      {formatTime((tr.durationMs || 200000) / 1000)}
                    </span>
                    <GripVertical className="h-3.5 w-3.5 text-white/20 group-hover:text-white/60" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* LYRICS VIEW IN RIGHT SIDEBAR */}
        {rightPanelTab === 'lyrics' && (
          <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col justify-center text-center p-2">
            <div className="flex items-center justify-center gap-2 text-[9px] font-mono text-[#FF2D95] uppercase font-bold tracking-widest mb-3 shrink-0">
              <Mic2 className="h-3 w-3 animate-bounce" /> 
              {lyricsLoading ? 'FETCHING LYRICS...' : lyrics ? 'LIVE KARAOKE' : 'NO LYRICS FOUND'}
            </div>

            {lyricsLoading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-2">
                <div className="h-6 w-6 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-bold text-white/40">Loading lyrics...</p>
              </div>
            ) : lyrics && lyrics.length > 0 ? (
              <div className="flex-1 overflow-y-auto scrollbar-none space-y-4 py-6 px-2">
                {lyrics.map((line, idx) => {
                  const isActive = idx === activeLyricIndex;
                  const isPast = idx < activeLyricIndex;
                  return (
                    <p
                      key={`${line.time}-${idx}`}
                      ref={isActive ? activeLineRef : null}
                      onClick={() => seek(line.time)}
                      className={`cursor-pointer transition-all ${
                        isActive
                          ? 'text-base font-black text-[#00D4FF] drop-shadow-[0_0_10px_#00D4FF]'
                          : isPast
                          ? 'text-xs font-semibold text-white/30'
                          : 'text-xs font-semibold text-white/60 hover:text-white'
                      }`}
                    >
                      {line.text}
                    </p>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 space-y-2 text-center">
                <Music className="h-8 w-8 text-white/20" />
                <p className="text-xs font-bold text-white/60">No synced lyrics available</p>
              </div>
            )}
          </div>
        )}

        {/* VISUALIZER VIEW IN RIGHT SIDEBAR */}
        {rightPanelTab === 'visualizer' && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3 p-2">
            <div className="text-[9px] font-mono text-[#00D4FF] uppercase font-bold tracking-widest flex items-center gap-1.5">
              <Zap className="h-3 w-3 animate-pulse" /> 24-Band Audio Spectrum
            </div>
            <canvas ref={canvasRef} width={260} height={140} className="w-full max-w-[260px]" />
          </div>
        )}
      </div>
    </aside>
  );
}

