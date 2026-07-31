'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useRouter } from 'next/navigation';
import { Play, Pause, Heart, Clock, Shuffle, Music, Disc, Sparkles, Download } from 'lucide-react';
import { motion } from 'framer-motion';

interface Track {
  id: string;
  title: string;
  artist: { name: string };
  album?: { name: string; coverUrl?: string };
  durationMs: number;
  coverUrl?: string;
  sourceType: 'youtube' | 'cloud';
  sourceId?: string;
}

export default function LikedPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { currentTrack, isPlaying, playTrack } = usePlayerStore();

  // Fetch Liked Songs using React Query
  const { data, isLoading } = useQuery<{ tracks: Track[] }>({
    queryKey: ['liked-songs'],
    queryFn: async () => {
      const res = await fetch('/api/liked');
      if (!res.ok) throw new Error('Failed to fetch liked songs');
      return res.json();
    },
  });

  const tracks = data?.tracks || [];

  // Unlike track mutation
  const unlikeMutation = useMutation({
    mutationFn: async (trackId: string) => {
      const res = await fetch('/api/liked', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId }),
      });
      if (!res.ok) throw new Error('Failed to unlike track');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liked-songs'] });
    },
  });

  const handlePlayAll = () => {
    if (tracks.length === 0) return;
    playTrack(tracks[0], tracks);
  };

  const cleanTitle = (title: string) => {
    if (!title) return 'Track';
    return title.split('_')[0].split('ft.')[0].split('(Official')[0].trim();
  };

  const formatDuration = (ms: number) => {
    if (!ms) return '3:30';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-white bg-[#050505]">
        <Disc className="h-8 w-8 animate-spin text-[#00D4FF]" />
        <span className="mt-3 text-xs font-mono text-white/50">Loading Liked Songs...</span>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#050505] text-white font-sans select-none pb-36">
      
      {/* 1. HERO HEADER BANNER */}
      <div className="p-6 md:p-10 bg-gradient-to-b from-[#7A3CFF]/20 via-[#0E1117] to-[#050505] flex flex-col sm:flex-row items-end gap-6 pb-8 border-b border-white/8">
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="relative h-44 w-44 rounded-[28px] bg-gradient-to-br from-[#00D4FF] via-[#7A3CFF] to-[#FF2D95] flex items-center justify-center shadow-[0_20px_60px_rgba(122,60,255,0.4)] flex-shrink-0 border border-white/10"
        >
          <Heart className="h-20 w-20 text-white fill-white drop-shadow-lg" />
        </motion.div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold text-[#00D4FF] uppercase tracking-[0.3em]">PLAYLIST</span>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">Liked Songs</h1>
          <p className="text-xs text-white/50 font-medium pt-1">
            <span className="text-white font-bold">Saswata Dey</span> • {tracks.length} saved songs • <span className="text-[#00D4FF]">Auto-updated</span>
          </p>
        </div>
      </div>

      {/* 2. ACTION BAR */}
      <div className="px-6 md:px-10 py-5 flex items-center gap-5">
        <button
          onClick={handlePlayAll}
          disabled={tracks.length === 0}
          className="h-14 w-14 rounded-full bg-gradient-to-tr from-[#00D4FF] to-[#7A3CFF] text-black flex items-center justify-center shadow-[0_0_25px_rgba(0,212,255,0.5)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          <Play className="h-6 w-6 fill-black translate-x-0.5" />
        </button>

        <button
          onClick={handlePlayAll}
          disabled={tracks.length === 0}
          className="text-white/40 hover:text-[#00D4FF] transition-colors"
          title="Shuffle play"
        >
          <Shuffle className="h-5 w-5" />
        </button>

        <button
          className="text-white/40 hover:text-[#00D4FF] transition-colors"
          title="Download all"
        >
          <Download className="h-5 w-5" />
        </button>
      </div>

      {/* 3. TRACKS TABLE LIST */}
      <div className="px-6 md:px-10 space-y-4">
        {tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="p-6 rounded-full bg-white/5 border border-white/10">
              <Heart className="h-12 w-12 text-white/20" />
            </div>
            <div>
              <p className="text-base font-bold text-white">Songs you like will appear here</p>
              <p className="text-xs text-white/40 max-w-sm mt-1">Save songs by clicking the heart icon while playing or searching.</p>
            </div>
            <button
              onClick={() => router.push('/search')}
              className="mt-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] text-black text-xs font-bold hover:scale-105 transition-transform shadow-[0_0_15px_#00D4FF]"
            >
              Find Songs to Save
            </button>
          </div>
        ) : (
          <div className="space-y-0.5">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-4 py-2.5 text-[10px] font-mono text-white/30 border-b border-white/8 uppercase tracking-wider">
              <span className="col-span-1">#</span>
              <span className="col-span-6">Title</span>
              <span className="col-span-4 hidden sm:block">Album</span>
              <span className="col-span-1 text-right flex justify-end">
                <Clock className="h-3.5 w-3.5" />
              </span>
            </div>

            {/* Table Rows */}
            {tracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <motion.div
                  key={track.id + idx}
                  onClick={() => playTrack(track, tracks)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`grid grid-cols-12 items-center px-4 py-3 rounded-xl cursor-pointer group transition-all ${
                    isCurrent ? 'bg-[#00D4FF]/10 border border-[#00D4FF]/20' : 'hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  {/* Track Number / Play Icon */}
                  <span className="col-span-1">
                    <span className={`text-xs font-mono font-bold group-hover:hidden ${isCurrent ? 'text-[#00D4FF]' : 'text-white/30'}`}>
                      {idx + 1}
                    </span>
                    <Play className="h-4 w-4 hidden group-hover:block text-[#00D4FF] fill-[#00D4FF]" />
                  </span>

                  {/* Title & Cover */}
                  <div className="col-span-6 flex items-center gap-3 min-w-0 pr-4">
                    <div className="relative h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                      <img
                        src={track.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&q=80'}
                        alt={track.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${isCurrent ? 'text-[#00D4FF]' : 'text-white group-hover:text-[#00D4FF]'} transition-colors`}>
                        {cleanTitle(track.title)}
                      </p>
                      <p className="text-[11px] text-white/40 truncate">
                        {typeof track.artist === 'object' ? (track.artist as any)?.name : (track.artist || 'Artist')}
                      </p>
                    </div>
                  </div>

                  {/* Album */}
                  <div className="col-span-4 hidden sm:block text-xs text-white/30 truncate pr-4">
                    {track.album?.name || 'Single'}
                  </div>

                  {/* Like & Duration */}
                  <div className="col-span-1 flex items-center justify-end gap-2.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        unlikeMutation.mutate(track.id);
                      }}
                      className="text-[#FF2D95] hover:text-[#FF2D95]/70 p-1 transition-colors"
                    >
                      <Heart className="h-3.5 w-3.5 fill-[#FF2D95]" />
                    </button>
                    <span className="text-[10px] font-mono text-white/30 hidden sm:inline">
                      {formatDuration(track.durationMs)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
