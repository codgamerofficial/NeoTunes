'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import ImageWithFallback from '../ui/ImageWithFallback';
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
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function MiniPlayer() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const {
    isPlaying,
    currentTrack,
    volume,
    isMuted,
    progress,
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

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
  const coverUrl = currentTrack.coverUrl || '/images/default-cover.png';

  return (
    <footer
      onClick={() => router.push('/player')}
      className="fixed bottom-[calc(76px+env(safe-area-inset-bottom,12px))] md:bottom-0 left-2 right-2 md:left-0 md:right-0 z-50 h-14 md:h-20 bg-[#181818]/95 md:bg-[#000000] backdrop-blur-2xl md:backdrop-blur-none rounded-2xl md:rounded-none border border-white/10 md:border-0 md:border-t md:border-[#181818] px-3 md:px-6 flex items-center justify-between cursor-pointer select-none shadow-2xl transition-all"
    >
      {/* 1. LEFT: Artwork, Title, Artist, Heart */}
      <div className="flex items-center gap-3 w-auto md:w-1/4 min-w-0 md:min-w-[200px]">
        <div className="relative h-10 w-10 md:h-12 md:w-12 rounded-lg overflow-hidden flex-shrink-0 border border-[#282828]">
          <ImageWithFallback src={coverUrl} alt={currentTrack.title} fill className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-white truncate hover:underline">{currentTrack.title}</p>
          <p className="text-[11px] text-[#B3B3B3] truncate hover:underline">{currentTrack.artist.name}</p>
        </div>
        <button onClick={handleLikeToggle} className="hidden sm:block p-1.5 text-[#B3B3B3] hover:text-white transition-colors">
          <Heart className={`h-4.5 w-4.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      {/* 2. CENTER: Playback Controls & Timeline (Desktop) / Mobile Play Pause */}
      <div className="hidden md:flex flex-col items-center gap-1.5 w-2/4 max-w-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); setShuffle(!shuffle); }}
            className={`p-1 text-xs transition-colors ${shuffle ? 'text-[#00D6FF]' : 'text-[#B3B3B3] hover:text-white'}`}
          >
            <Shuffle className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prevTrack(); }}
            className="p-1 text-[#B3B3B3] hover:text-white transition-all active:scale-95"
          >
            <SkipBack className="h-5 w-5 fill-current" />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={(e) => { e.stopPropagation(); setPlaying(!isPlaying); }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-md"
          >
            {isPlaying ? <Pause className="h-4 w-4 fill-black" /> : <Play className="h-4 w-4 fill-black translate-x-0.5" />}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); nextTrack(); }}
            className="p-1 text-[#B3B3B3] hover:text-white transition-all active:scale-95"
          >
            <SkipForward className="h-5 w-5 fill-current" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setRepeatMode(repeatMode === 'off' ? 'all' : 'off'); }}
            className={`p-1 text-xs transition-colors ${repeatMode !== 'off' ? 'text-[#00D6FF]' : 'text-[#B3B3B3] hover:text-white'}`}
          >
            <Repeat className="h-4 w-4" />
          </button>
        </div>

        {/* Timeline Bar */}
        <div className="flex items-center gap-2 w-full text-[10px] font-mono text-[#B3B3B3]">
          <span>{formatTime(progress)}</span>
          <div className="relative h-1 flex-1 bg-[#282828] rounded-full overflow-hidden group cursor-pointer">
            <div
              className="absolute inset-y-0 left-0 bg-white group-hover:bg-[#00D6FF] rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
            <input
              type="range" min={0} max={duration || 100} value={progress || 0}
              onChange={handleSeekChange}
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* MOBILE CONTROLS (Play/Pause & Next Track) */}
      <div className="flex md:hidden items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); setPlaying(!isPlaying); }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-md"
        >
          {isPlaying ? <Pause className="h-4 w-4 fill-black" /> : <Play className="h-4 w-4 fill-black translate-x-0.5" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); nextTrack(); }}
          className="p-1.5 text-[#B3B3B3] hover:text-white"
        >
          <SkipForward className="h-5 w-5 fill-current" />
        </button>
      </div>

      {/* 3. RIGHT: Volume, Lyrics, Queue, Fullscreen (Desktop Only) */}
      <div className="hidden md:flex items-center justify-end gap-3 w-1/4">
        <button
          onClick={(e) => { e.stopPropagation(); router.push('/player'); }}
          className="p-1.5 text-[#B3B3B3] hover:text-[#00D6FF] transition-colors"
          title="Lyrics"
        >
          <Mic2 className="h-4 w-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); router.push('/player'); }}
          className="p-1.5 text-[#B3B3B3] hover:text-white transition-colors"
          title="Queue"
        >
          <ListMusic className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button onClick={toggleMute} className="text-[#B3B3B3] hover:text-white p-1">
            {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <input
            type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 h-1 bg-[#282828] rounded-full outline-none accent-white hover:accent-[#00D6FF]"
          />
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); router.push('/player'); }}
          className="p-1.5 text-[#B3B3B3] hover:text-white transition-colors"
          title="Expand Player"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
    </footer>
  );
}
