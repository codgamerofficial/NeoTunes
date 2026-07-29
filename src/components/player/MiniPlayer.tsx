'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import ImageWithFallback from '../ui/ImageWithFallback';
import { motion, AnimatePresence } from 'framer-motion';
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
  ListMusic,
  Mic2,
  Maximize2,
  Loader2,
  Sparkles,
  AlertCircle,
  Brain,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function MiniPlayer() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const {
    isPlaying,
    isLoadingStream,
    playbackStatus,
    playbackError,
    currentTrack,
    volume,
    isMuted,
    progress,
    buffered,
    duration,
    shuffle,
    repeatMode,
    setPlaying,
    setVolume,
    toggleMute,
    nextTrack,
    prevTrack,
    setShuffle,
    setRepeatMode,
    setProgress,
  } = usePlaybackStore();

  // Fetch liked status
  const { data: likedData, refetch: refetchLike } = useQuery({
    queryKey: ['liked-status', currentTrack?.id],
    queryFn: async () => {
      if (!currentTrack?.id) return { liked: false };
      const res = await fetch(`/api/liked?trackId=${currentTrack.id}`);
      if (!res.ok) return { liked: false };
      return res.json();
    },
    enabled: !!currentTrack?.id,
  });

  if (!currentTrack || pathname === '/auth') {
    return null;
  }

  const isLiked = likedData?.liked || false;

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentTrack) return;
    try {
      const res = await fetch('/api/liked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: currentTrack.id, track: currentTrack }),
      });
      if (res.ok) {
        refetchLike();
        queryClient.invalidateQueries({ queryKey: ['liked-songs'] });
      }
    } catch { /* ignore */ }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setProgress(value);
    window.dispatchEvent(new CustomEvent('seek-track', { detail: { time: value } }));
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? Math.min((progress / duration) * 100, 100) : 0;
  const bufferedPercent = duration > 0 ? Math.min((buffered / duration) * 100, 100) : 0;
  const coverUrl = currentTrack.coverUrl || '/images/default-cover.png';

  const isBufferingOrLoading = ['loading', 'preparing', 'connecting', 'buffering'].includes(playbackStatus) || isLoadingStream;

  return (
    <motion.footer
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring' as const, damping: 25, stiffness: 300 }}
      className="fixed bottom-[calc(72px+env(safe-area-inset-bottom,12px))] md:bottom-0 left-2 right-2 md:left-0 md:right-0 z-50 h-16 md:h-22 bg-[#121620]/95 md:bg-[#0B0E14]/95 backdrop-blur-2xl rounded-2xl md:rounded-none border border-white/10 md:border-0 md:border-t md:border-white/10 px-3 md:px-6 flex items-center justify-between cursor-pointer select-none shadow-[0_10px_40px_rgba(0,0,0,0.8)] transition-all overflow-hidden"
    >
      {/* Mobile Top Thin Progress Line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#282828] md:hidden">
        <div
          className="h-full bg-white/20 transition-all"
          style={{ width: `${bufferedPercent}%` }}
        />
        <div
          className="h-full bg-[#00D6FF] transition-all -mt-0.5"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 1. LEFT: Artwork, Marquee Title, Artist, AI Badge & Heart */}
      <div 
        onClick={() => router.push('/player')}
        className="flex items-center gap-3 w-auto md:w-1/3 min-w-0 group"
      >
        <div className="relative h-11 w-11 md:h-14 md:w-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/15 shadow-xl group-hover:scale-105 transition-transform duration-300">
          <ImageWithFallback src={coverUrl} alt={currentTrack.title} fill className="object-cover" />
          
          {/* Animated Soundwave Equalizer ONLY when actively PLAYING */}
          {isPlaying && !isBufferingOrLoading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
              <span className="inline-flex items-end gap-[2px] h-4">
                <span className="w-[3px] h-2.5 bg-[#00D6FF] rounded-full animate-bounce" />
                <span className="w-[3px] h-4 bg-[#3B82F6] rounded-full animate-bounce [animation-delay:0.15s]" />
                <span className="w-[3px] h-3 bg-[#8B5CF6] rounded-full animate-bounce [animation-delay:0.3s]" />
                <span className="w-[3px] h-2 bg-[#EC4899] rounded-full animate-bounce [animation-delay:0.45s]" />
              </span>
            </div>
          )}

          {/* Loading / Buffering Spinner Overlay */}
          {isBufferingOrLoading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-[#00D6FF] animate-spin" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className="text-xs md:text-sm font-extrabold text-white truncate group-hover:text-[#00D6FF] transition-colors">
              {currentTrack.title}
            </p>
            <span className="hidden lg:inline-flex items-center gap-1 text-[9px] font-mono font-bold text-[#00D6FF] bg-[#00D6FF]/10 px-2 py-0.5 rounded-full border border-[#00D6FF]/20 flex-shrink-0">
              <Sparkles className="h-2.5 w-2.5" /> FLAC 24-bit
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex-shrink-0">
              FULL STREAM
            </span>
          </div>

          {/* Status Subtitle */}
          {isBufferingOrLoading ? (
            <p className="text-[11px] font-mono text-[#00D6FF] flex items-center gap-1 animate-pulse">
              <Brain className="h-3 w-3" />
              <span>{playbackStatus === 'buffering' ? 'Buffering stream...' : 'Connecting audio...'}</span>
            </p>
          ) : playbackStatus === 'error' ? (
            <p className="text-[11px] font-mono text-rose-400 flex items-center gap-1 truncate">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{playbackError || 'Playback error'}</span>
            </p>
          ) : (
            <p className="text-[11px] text-[#B3B3B3] truncate group-hover:text-white transition-colors">
              {currentTrack.artist.name} {currentTrack.album?.name ? `• ${currentTrack.album.name}` : ''}
            </p>
          )}
        </div>

        <button 
          onClick={handleLikeToggle} 
          className="hidden sm:flex items-center justify-center min-h-[44px] min-w-[44px] text-[#B3B3B3] hover:text-rose-500 transition-colors"
          title="Save to Liked Songs"
        >
          <Heart className={`h-4.5 w-4.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      {/* 2. CENTER: Controls & Dual Progress Timeline */}
      <div className="hidden md:flex flex-col items-center gap-1.5 w-1/3 max-w-xl">
        <div className="flex items-center gap-5">
          <button
            onClick={(e) => { e.stopPropagation(); setShuffle(!shuffle); }}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center text-xs transition-colors ${shuffle ? 'text-[#00D6FF]' : 'text-[#B3B3B3] hover:text-white'}`}
            title="Shuffle Queue"
          >
            <Shuffle className="h-4 w-4" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prevTrack(); }}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#B3B3B3] hover:text-white transition-all active:scale-90"
            title="Previous Song"
          >
            <SkipBack className="h-5 w-5 fill-current" />
          </button>

          {/* PLAY / PAUSE / LOADING BUTTON */}
          <button
            onClick={(e) => { e.stopPropagation(); setPlaying(!isPlaying); }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isBufferingOrLoading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin text-black" />
            ) : isPlaying ? (
              <Pause className="h-4.5 w-4.5 fill-black text-black" />
            ) : (
              <Play className="h-4.5 w-4.5 fill-black text-black translate-x-0.5" />
            )}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); nextTrack(); }}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#B3B3B3] hover:text-white transition-all active:scale-90"
            title="Next Song"
          >
            <SkipForward className="h-5 w-5 fill-current" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setRepeatMode(repeatMode === 'off' ? 'all' : 'off'); }}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center text-xs transition-colors ${repeatMode !== 'off' ? 'text-[#00D6FF]' : 'text-[#B3B3B3] hover:text-white'}`}
            title="Repeat Mode"
          >
            <Repeat className="h-4 w-4" />
          </button>
        </div>

        {/* Timeline Bar with Buffered Layer */}
        <div className="flex items-center gap-3 w-full text-[10px] font-mono text-[#B3B3B3]">
          <span>{formatTime(progress)}</span>
          <div className="relative h-1.5 flex-1 bg-[#282828] rounded-full overflow-hidden group cursor-pointer">
            {/* Buffered progress line */}
            <div
              className="absolute inset-y-0 left-0 bg-white/20 rounded-full transition-all"
              style={{ width: `${bufferedPercent}%` }}
            />
            {/* Played progress line */}
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00D6FF] via-[#3B82F6] to-[#8B5CF6] group-hover:brightness-125 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
            <input
              type="range" min={0} max={duration || 100} value={progress || 0}
              disabled={duration <= 0}
              onChange={handleSeekChange}
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* MOBILE CONTROLS */}
      <div className="flex md:hidden items-center gap-1">
        <button
          onClick={(e) => { e.stopPropagation(); setPlaying(!isPlaying); }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-lg"
        >
          {isBufferingOrLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-black" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4 fill-black text-black" />
          ) : (
            <Play className="h-4 w-4 fill-black text-black translate-x-0.5" />
          )}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); nextTrack(); }}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#B3B3B3] hover:text-white"
        >
          <SkipForward className="h-5 w-5 fill-current" />
        </button>
      </div>

      {/* 3. RIGHT: Volume, Lyrics, Queue, Full Player Trigger */}
      <div className="hidden md:flex items-center justify-end gap-3 w-1/3">
        <button
          onClick={(e) => { e.stopPropagation(); router.push('/player'); }}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#B3B3B3] hover:text-[#00D6FF] transition-colors"
          title="Lyrics View"
        >
          <Mic2 className="h-4.5 w-4.5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); router.push('/player'); }}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#B3B3B3] hover:text-white transition-colors"
          title="Playback Queue"
        >
          <ListMusic className="h-4.5 w-4.5" />
        </button>
        
        {/* Volume Controls */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={toggleMute} className="text-[#B3B3B3] hover:text-white p-1">
            {isMuted || volume === 0 ? <VolumeX className="h-4.5 w-4.5 text-rose-400" /> : <Volume2 className="h-4.5 w-4.5" />}
          </button>
          <input
            type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-[#282828] accent-[#00D6FF] rounded-full cursor-pointer"
          />
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); router.push('/player'); }}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#B3B3B3] hover:text-white transition-colors ml-2"
          title="Expand Full Player"
        >
          <Maximize2 className="h-4.5 w-4.5" />
        </button>
      </div>
    </motion.footer>
  );
}
