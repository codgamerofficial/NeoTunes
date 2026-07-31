'use client';

import React, { useState } from 'react';
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
  Cast, 
  ListMusic, 
  MoreHorizontal,
  GripVertical,
  ShieldCheck,
  Music
} from 'lucide-react';

export default function RightContextPanel() {
  const { currentTrack, isPlaying, togglePlay, previousTrack, nextTrack, clearQueue, playTrack } = usePlayerStore();
  const { isRightPanelOpen, toggleRightPanel } = useLayoutStore();

  const [queueTracks, setQueueTracks] = useState([
    { id: '1', title: 'Kesariya', artist: 'Arijit Singh', duration: '3:47', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&q=80' },
    { id: '2', title: 'After Hours', artist: 'The Weeknd', duration: '4:00', coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=200&q=80' },
    { id: '3', title: 'Heat Waves', artist: 'Glass Animals', duration: '3:58', coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&q=80' },
    { id: '4', title: 'Shape of You', artist: 'Ed Sheeran', duration: '3:54', coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80' },
    { id: '5', title: 'Let Me Down Slowly', artist: 'Alec Benjamin', duration: '2:49', coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80' },
  ]);

  if (!isRightPanelOpen) return null;

  const trackTitle = currentTrack?.title || 'Blinding Lights';
  const trackArtist = typeof currentTrack?.artist === 'object' ? (currentTrack.artist as any)?.name : (currentTrack?.artist || 'The Weeknd');
  const trackCover = currentTrack?.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80';

  return (
    <aside className="w-80 sm:w-96 flex-shrink-0 bg-[#0A0A0E] border-l border-white/10 p-4 flex flex-col gap-4 h-full z-30 select-none overflow-y-auto scrollbar-none">
      
      {/* ── 1. PLAYING NOW CARD ── */}
      <div className="p-5 rounded-[28px] bg-[#121218] border border-white/10 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#00D4FF] tracking-wider uppercase">
            <span className="h-2 w-2 rounded-full bg-[#00D4FF] animate-ping" />
            PLAYING NOW
          </div>
          <button onClick={toggleRightPanel} className="p-1 rounded-full text-white/40 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Album Artwork */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
          <img src={trackCover} alt={trackTitle} className="h-full w-full object-cover" />
          <button className="absolute top-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-white/70 hover:text-[#FF2D95] transition-colors">
            <Heart className="h-4 w-4" />
          </button>
        </div>

        {/* Title & Badges */}
        <div className="space-y-1">
          <h3 className="text-lg font-black text-white truncate">{trackTitle}</h3>
          <p className="text-xs text-white/50 truncate font-medium">{trackArtist}</p>
          
          <div className="flex items-center gap-2 pt-1">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#7A3CFF]/20 text-[#7A3CFF] border border-[#7A3CFF]/40">
              Dolby Atmos
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40">
              Lossless
            </span>
          </div>
        </div>

        {/* Animated Waveform Visualizer */}
        <div className="h-8 flex items-center justify-between px-2 opacity-80">
          <svg className="w-full h-full text-[#00D4FF]" viewBox="0 0 200 30" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M 0 15 Q 10 5, 20 15 T 40 15 T 60 5 T 80 25 T 100 10 T 120 20 T 140 10 T 160 25 T 180 15 T 200 15" strokeLinecap="round" />
          </svg>
        </div>

        {/* Scrubber Time */}
        <div className="flex justify-between text-[11px] font-mono text-white/40">
          <span>1:28</span>
          <span>3:20</span>
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

        {/* Action Row */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-white/40">
          <Volume2 className="h-4 w-4 hover:text-white cursor-pointer" />
          <Cast className="h-4 w-4 hover:text-white cursor-pointer" />
          <ListMusic className="h-4 w-4 hover:text-white cursor-pointer" />
          <MoreHorizontal className="h-4 w-4 hover:text-white cursor-pointer" />
        </div>
      </div>

      {/* ── 2. UP NEXT QUEUE CARD ── */}
      <div className="flex-1 p-5 rounded-[28px] bg-[#121218] border border-white/10 space-y-4 shadow-xl flex flex-col">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">UP NEXT</h4>
          <button
            onClick={() => setQueueTracks([])}
            className="text-[11px] font-bold text-white/40 hover:text-[#FF2D95] transition-colors"
          >
            Clear Queue
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-none space-y-2">
          {queueTracks.length === 0 ? (
            <div className="text-center py-8 text-xs text-white/40 italic">Queue is empty</div>
          ) : (
            queueTracks.map((tr, idx) => (
              <div
                key={tr.id}
                onClick={() => playTrack({
                  id: tr.id,
                  title: tr.title,
                  artist: tr.artist,
                  durationMs: 200000,
                  sourceType: 'youtube',
                  coverUrl: tr.coverUrl,
                })}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/5 hover:border-[#00D4FF]/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-xs font-mono font-bold text-white/40 w-4">{idx + 1}</span>
                  <img src={tr.coverUrl} alt="" className="h-9 w-9 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-white group-hover:text-[#00D4FF] truncate transition-colors">{tr.title}</div>
                    <div className="text-[10px] text-white/50 truncate">{tr.artist}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-white/40">{tr.duration}</span>
                  <GripVertical className="h-3.5 w-3.5 text-white/20 group-hover:text-white/60" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
