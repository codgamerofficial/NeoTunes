'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useLayoutStore } from '@/store/layout-store';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Heart,
  Shuffle,
  Repeat,
  Maximize2,
  Sliders,
  Radio,
  Clock,
  Sparkles,
  Wifi
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MiniPlayer() {
  const router = useRouter();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    nextTrack,
    previousTrack,
    setVolume,
    toggleMute,
    seek,
  } = usePlayerStore();

  const { isSidebarOpen, isRightPanelOpen, toggleRightPanel, setRightPanelTab } = useLayoutStore();
  const [isLiked, setIsLiked] = useState(false);
  const [showDevices, setShowDevices] = useState(false);

  if (!currentTrack) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const displayDuration = duration > 0 ? duration : (currentTrack.durationMs ? currentTrack.durationMs / 1000 : 210);
  const progressPercent = displayDuration > 0 ? (currentTime / displayDuration) * 100 : 0;

  const leftPos = isSidebarOpen ? 'md:left-[272px]' : 'md:left-[96px]';
  const rightPos = isRightPanelOpen ? 'md:right-[340px]' : 'md:right-6';

  return (
    <div className={`fixed bottom-[76px] md:bottom-4 left-3 right-3 md:left-4 md:right-4 ${leftPos} ${rightPos} z-40 transition-all duration-300`}>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative bg-[#101010]/95 backdrop-blur-2xl border border-white/10 rounded-[28px] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Dynamic Glow Behind Player */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#00D4FF]/10 via-[#7A3CFF]/10 to-[#FF2D95]/10 blur-xl pointer-events-none" />

        {/* Top Progress Bar Scrubber */}
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newPercent = clickX / rect.width;
            seek(newPercent * displayDuration);
          }}
          className="absolute top-0 left-0 right-0 h-1 bg-white/10 cursor-pointer group"
        >
          <div
            className="h-full bg-gradient-to-r from-[#00D4FF] via-[#7A3CFF] to-[#FF2D95] rounded-full relative"
            style={{ width: `${progressPercent}%` }}
          >
            <span className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white shadow-[0_0_10px_#00D4FF] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-1">
          {/* Left Track Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1 max-w-[35%]">
            <div className="relative group cursor-pointer flex-shrink-0" onClick={() => router.push('/player')}>
              <img
                src={currentTrack.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80'}
                alt={currentTrack.title}
                className="h-14 w-14 rounded-xl object-cover border border-white/10 shadow-lg group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 rounded-xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="h-4 w-4 text-white" />
              </div>
            </div>

            <div className="min-w-0">
              <div className="font-bold text-sm text-white truncate hover:text-[#00D4FF] cursor-pointer" onClick={() => router.push('/player')}>
                {currentTrack.title}
              </div>
              <div className="text-xs text-white/50 truncate flex items-center gap-1.5 mt-0.5">
                <span>{typeof currentTrack.artist === 'object' ? (currentTrack.artist as any)?.name : currentTrack.artist}</span>
                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/30">LOSSLESS</span>
              </div>
            </div>

            <button
              onClick={() => setIsLiked(!isLiked)}
              className="p-1.5 rounded-full text-white/40 hover:text-[#FF2D95] transition-colors ml-1"
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'text-[#FF2D95] fill-[#FF2D95]' : ''}`} />
            </button>
          </div>

          {/* Center Playback Controls */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-4">
              <button onClick={previousTrack} className="text-white/60 hover:text-white transition-colors">
                <SkipBack className="h-5 w-5" />
              </button>

              <button
                onClick={togglePlay}
                className="h-11 w-11 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] text-black flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.6)] hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause className="h-5 w-5 fill-black" /> : <Play className="h-5 w-5 fill-black ml-0.5" />}
              </button>

              <button onClick={nextTrack} className="text-white/60 hover:text-white transition-colors">
                <SkipForward className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono text-white/40">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(displayDuration)}</span>
            </div>
          </div>

          {/* Right Action Tools: Lyrics, Queue, Volume, Devices, Fullscreen */}
          <div className="flex items-center gap-3 w-1/4 justify-end">
            <button
              onClick={() => {
                setRightPanelTab('lyrics');
                toggleRightPanel();
              }}
              className="p-2 rounded-full text-white/60 hover:text-[#00D4FF] hover:bg-white/5 transition-all"
              title="Lyrics"
            >
              <Sparkles className="h-4 w-4" />
            </button>

            {/* Volume Control */}
            <div className="hidden sm:flex items-center gap-2">
              <button onClick={toggleMute} className="text-white/60 hover:text-white">
                {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#00D4FF]"
              />
            </div>

            <button
              onClick={() => router.push('/player')}
              className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/5 transition-all"
              title="Fullscreen Theatre Mode"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
