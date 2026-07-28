'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePlaybackStore } from '@/store/playback-store';
import { useRouter } from 'next/navigation';
import { Play, Pause, Heart, Clock, Shuffle, Music, Disc } from 'lucide-react';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

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
  const { currentTrack, isPlaying, playTrack, setPlaying } = usePlaybackStore();

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
      <div className="flex h-[60vh] flex-col items-center justify-center text-white bg-[#121212]">
        <Disc className="h-8 w-8 animate-spin text-[#29B6F6]" />
        <span className="mt-3 text-xs font-mono text-[#B3B3B3]">Loading Liked Songs...</span>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#121212] text-white font-sans select-none pb-24">
      
      {/* 1. HERO HEADER BANNER */}
      <div className="p-6 md:p-10 bg-gradient-to-b from-indigo-900/60 via-[#181818] to-[#121212] flex flex-col sm:flex-row items-end gap-6 pb-8 border-b border-[#181818]">
        <div className="relative h-44 w-44 rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-[#29B6F6] flex items-center justify-center shadow-2xl flex-shrink-0 border border-white/10">
          <Heart className="h-20 w-20 text-white fill-white" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-[#29B6F6] uppercase tracking-wider">PLAYLIST</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none">Liked Songs</h1>
          <p className="text-xs text-[#B3B3B3] font-medium pt-1">
            <span className="text-white font-bold">Saswata Dey</span> • {tracks.length} saved songs
          </p>
        </div>
      </div>

      {/* 2. ACTION BAR */}
      <div className="px-6 md:px-10 py-6 flex items-center gap-6">
        <button
          onClick={handlePlayAll}
          disabled={tracks.length === 0}
          className="h-14 w-14 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          <Play className="h-6 w-6 fill-black translate-x-0.5" />
        </button>

        <button
          onClick={handlePlayAll}
          disabled={tracks.length === 0}
          className="text-[#B3B3B3] hover:text-white transition-colors"
        >
          <Shuffle className="h-6 w-6" />
        </button>
      </div>

      {/* 3. TRACKS TABLE LIST */}
      <div className="px-6 md:px-10 space-y-4">
        {tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-[#B3B3B3] space-y-3">
            <Heart className="h-12 w-12 text-[#282828]" />
            <p className="text-sm font-bold text-white">Songs you like will appear here</p>
            <p className="text-xs max-w-sm">Save songs by clicking the heart icon while playing or searching.</p>
            <button
              onClick={() => router.push('/search')}
              className="mt-2 px-5 py-2.5 rounded-full bg-[#181818] hover:bg-[#282828] text-xs font-bold text-white border border-[#282828] transition-all"
            >
              Find Songs to Save
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-4 py-2 text-xs font-mono text-[#B3B3B3] border-b border-[#181818] uppercase">
              <span className="col-span-1">#</span>
              <span className="col-span-6">Title</span>
              <span className="col-span-4 hidden sm:block">Album</span>
              <span className="col-span-1 text-right flex justify-end">
                <Clock className="h-4 w-4" />
              </span>
            </div>

            {/* Table Rows */}
            {tracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id + idx}
                  onClick={() => playTrack(track, tracks)}
                  className={`grid grid-cols-12 items-center px-4 py-3 rounded-xl cursor-pointer group transition-all ${
                    isCurrent ? 'bg-[#181818] text-[#29B6F6]' : 'hover:bg-[#181818] text-white'
                  }`}
                >
                  <span className="col-span-1 text-xs font-mono text-[#B3B3B3] font-bold group-hover:hidden">
                    {idx + 1}
                  </span>
                  <Play className="h-4 w-4 hidden group-hover:block text-white" />

                  {/* Title & Cover */}
                  <div className="col-span-6 flex items-center gap-3 min-w-0 pr-4">
                    <div className="relative h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 border border-[#282828]">
                      <ImageWithFallback src={track.coverUrl || '/images/default-cover.png'} alt={track.title} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${isCurrent ? 'text-[#29B6F6]' : 'text-white group-hover:text-[#29B6F6]'}`}>
                        {cleanTitle(track.title)}
                      </p>
                      <p className="text-[11px] text-[#B3B3B3] truncate">{track.artist?.name || 'Artist'}</p>
                    </div>
                  </div>

                  {/* Album */}
                  <div className="col-span-4 hidden sm:block text-xs text-[#B3B3B3] truncate pr-4">
                    {track.album?.name || 'Single'}
                  </div>

                  {/* Like & Duration */}
                  <div className="col-span-1 flex items-center justify-end gap-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        unlikeMutation.mutate(track.id);
                      }}
                      className="text-rose-500 hover:text-rose-400 p-1"
                    >
                      <Heart className="h-4 w-4 fill-rose-500" />
                    </button>
                    <span className="text-xs font-mono text-[#B3B3B3]">
                      {formatDuration(track.durationMs)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
