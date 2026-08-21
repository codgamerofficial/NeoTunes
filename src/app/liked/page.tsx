'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePlaybackStore } from '@/store/playback-store';
import { useRouter } from 'next/navigation';
import { Track, getArtistName } from '@/types';
import { Artwork } from '@/components/ui/Artwork';
import { GlassCard } from '@/components/ui/GlassCard';
import { 
  Play, 
  Pause, 
  Heart, 
  Clock, 
  Shuffle, 
  Search, 
  ArrowUpDown, 
  Sparkles, 
  Disc, 
  ChevronRight,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { resolveArtwork } from '@/utils/artwork';

type SortMode = 'recently_added' | 'alphabetical' | 'artist' | 'album';

export default function LikedPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { currentTrack, isPlaying, playTrack, addToQueue } = usePlaybackStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('recently_added');

  // Fetch Liked Songs using React Query
  const { data, isLoading } = useQuery<{ tracks: any[] }>({
    queryKey: ['liked-songs'],
    queryFn: async () => {
      const res = await fetch('/api/liked');
      if (!res.ok) throw new Error('Failed to fetch liked songs');
      return res.json();
    },
  });

  const rawTracks = data?.tracks || [];
  const tracks: Track[] = rawTracks.map((tr) => {
    const artistStr = getArtistName(tr.artists || tr.artist || 'Artist');
    return {
      id: tr.canonicalId || `spotify:track:${tr.id}`,
      canonicalId: tr.canonicalId || `spotify:track:${tr.id}`,
      source: tr.source || 'spotify',
      sourceId: tr.sourceId || tr.id,
      title: tr.title,
      artists: [artistStr],
      artist: artistStr,
      album: typeof tr.album === 'object' ? tr.album?.name || 'Single' : tr.album || 'Single',
      artworkUrl: resolveArtwork(tr),
      coverUrl: resolveArtwork(tr),
      duration: Math.floor((tr.durationMs || 180000) / 1000),
      durationMs: tr.durationMs || 180000,
      playable: true,
    };
  });

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

  // Filter & Sort Tracks
  const filteredTracks = tracks
    .filter((tr) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        tr.title.toLowerCase().includes(q) ||
        getArtistName(tr.artists || tr.artist).toLowerCase().includes(q) ||
        (typeof tr.album === 'string' ? tr.album.toLowerCase().includes(q) : false)
      );
    })
    .sort((a, b) => {
      if (sortMode === 'alphabetical') return a.title.localeCompare(b.title);
      if (sortMode === 'artist') return getArtistName(a.artists || a.artist).localeCompare(getArtistName(b.artists || b.artist));
      if (sortMode === 'album') return String(a.album || '').localeCompare(String(b.album || ''));
      return 0; // default recently_added
    });

  const handlePlayAll = () => {
    if (filteredTracks.length === 0) return;
    playTrack(filteredTracks[0], filteredTracks);
  };

  const handleShufflePlay = () => {
    if (filteredTracks.length === 0) return;
    const shuffled = [...filteredTracks].sort(() => Math.random() - 0.5);
    playTrack(shuffled[0], shuffled);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds || isNaN(seconds)) return '3:30';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-white bg-transparent">
        <Disc className="h-7 w-7 animate-spin text-[#DFFF00]" />
        <span className="mt-3 text-xs font-mono text-[#A1A1A6]">Loading Liked Songs...</span>
      </div>
    );
  }

  return (
    <FeatureErrorBoundary featureName="Liked Songs">
      <div className="p-4 sm:p-6 md:p-10 space-y-6 bg-transparent text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 max-w-5xl mx-auto min-h-screen">
        
        {/* ── 1. COMPACT CENTERED APPLE MUSIC-STYLE HEADER ── */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2 pb-4 border-b border-white/10">
          <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl bg-gradient-to-br from-[#DFFF00] via-[#00D9FF] to-[#7A3CFF] flex items-center justify-center shadow-xl border border-white/15">
            <Heart className="h-14 w-14 text-black fill-black" />
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Liked Songs</h1>
            <p className="text-xs text-[#A1A1A6] font-medium">
              <span className="text-white font-bold">Saswata Dey</span> • {tracks.length} {tracks.length === 1 ? 'song' : 'songs'} • <span className="text-[#DFFF00]">Auto-updated</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handlePlayAll}
              disabled={tracks.length === 0}
              className="px-6 py-2.5 rounded-full bg-[#DFFF00] text-black text-xs font-mono font-bold uppercase tracking-wider hover:scale-105 active:scale-95 transition-all disabled:opacity-40 cursor-pointer flex items-center gap-2 shadow-md"
            >
              <Play className="h-4 w-4 fill-black text-black" /> Play
            </button>

            <button
              onClick={handleShufflePlay}
              disabled={tracks.length === 0}
              className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-xs font-mono font-bold hover:bg-white/10 active:scale-95 transition-all disabled:opacity-40 cursor-pointer flex items-center gap-2"
            >
              <Shuffle className="h-4 w-4 text-[#00D9FF]" /> Shuffle
            </button>
          </div>
        </div>

        {/* ── 2. SEARCH & SORT BAR ── */}
        {tracks.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex items-center bg-white/[0.055] border border-white/10 rounded-2xl px-4 py-2.5 backdrop-blur-md w-full sm:w-80">
              <Search className="h-4 w-4 text-[#A1A1A6] mr-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in liked songs..."
                className="bg-transparent text-xs text-white placeholder-[#A1A1A6] focus:outline-none w-full"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <ArrowUpDown className="h-3.5 w-3.5 text-[#A1A1A6]" />
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="recently_added" className="bg-[#08090C] text-white">Recently Added</option>
                <option value="alphabetical" className="bg-[#08090C] text-white">A–Z Title</option>
                <option value="artist" className="bg-[#08090C] text-white">Artist</option>
                <option value="album" className="bg-[#08090C] text-white">Album</option>
              </select>
            </div>
          </div>
        )}

        {/* ── 3. TRACKS LIST / EMPTY STATE ── */}
        {tracks.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 text-center space-y-3 max-w-md mx-auto my-6">
            <div className="p-3 rounded-full bg-white/5 text-[#DFFF00] w-12 h-12 mx-auto flex items-center justify-center">
              <Heart className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No liked songs yet</h3>
              <p className="text-xs text-[#A1A1A6]">
                Songs you like will appear here. Tap the heart icon while playing or searching to save tracks.
              </p>
            </div>
            <button
              onClick={() => router.push('/search')}
              className="mt-2 px-6 py-2.5 rounded-full bg-[#DFFF00] text-black text-xs font-mono font-bold uppercase tracking-wider hover:scale-105 transition-all cursor-pointer inline-flex items-center gap-2 shadow-md"
            >
              Find Music
            </button>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="p-8 text-center text-[#A1A1A6] text-xs font-mono border border-white/10 rounded-2xl">
            No liked songs matching "{searchQuery}".
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredTracks.map((trk, idx) => {
                const isCurrent = (currentTrack?.canonicalId || currentTrack?.id) === trk.canonicalId;
                return (
                  <motion.div
                    key={trk.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <GlassCard
                      onClick={() => playTrack(trk, filteredTracks)}
                      className={`p-3 flex items-center justify-between cursor-pointer group hover:border-[#DFFF00]/40 transition-all ${
                        isCurrent ? 'border-[#DFFF00]/50 bg-white/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <span className="text-xs font-mono font-bold text-[#A1A1A6] w-5 text-center shrink-0">
                          {idx + 1}
                        </span>
                        <Artwork
                          source={resolveArtwork(trk)}
                          size="small"
                          canonicalId={trk.id}
                          type="track"
                          className="h-12 w-12 rounded-xl object-cover border border-white/10 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className={`text-xs font-bold truncate group-hover:text-[#DFFF00] transition-colors ${
                            isCurrent ? 'text-[#DFFF00]' : 'text-[#F5F5F7]'
                          }`}>
                            {trk.title}
                          </div>
                          <div className="text-[11px] text-[#A1A1A6] truncate mt-0.5">
                            {getArtistName(trk.artists || trk.artist)} {trk.album ? `• ${typeof trk.album === 'string' ? trk.album : 'Single'}` : ''}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            unlikeMutation.mutate(trk.id);
                          }}
                          className="p-1.5 text-[#FF2D95] hover:scale-110 transition-transform cursor-pointer"
                          title="Remove from liked songs"
                        >
                          <Heart className="h-4 w-4 fill-[#FF2D95]" />
                        </button>
                        <span className="text-xs font-mono text-[#A1A1A6]">
                          {formatDuration(trk.durationMs)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToQueue(trk);
                          }}
                          className="p-2 rounded-full bg-white/5 hover:bg-[#DFFF00] hover:text-black text-[#A1A1A6] transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                          title="Add to queue"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

      </div>
    </FeatureErrorBoundary>
  );
}
