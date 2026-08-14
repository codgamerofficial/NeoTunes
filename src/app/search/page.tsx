'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { usePlaybackStore } from '@/store/playback-store';
import { MusicSearchService, NormalizedSearchResult } from '@/services/MusicSearchService';
import {
  Search as SearchIcon, Play, Sparkles, X, Music,
  BadgeCheck, ListPlus, MoreVertical, ChevronRight, User, Disc, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTrackArtwork } from '@/utils/artwork';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawQuery = searchParams.get('q') || 'Dai dai';
  const inputRef = useRef<HTMLInputElement>(null);

  const { playTrack, addToQueue } = usePlaybackStore();
  const [query, setQuery] = useState(rawQuery);
  const [activeFilter, setActiveFilter] = useState('Songs');

  useEffect(() => {
    if (rawQuery) setQuery(rawQuery);
  }, [rawQuery]);

  const filters = ['All', 'Songs', 'Artists', 'Albums', 'Playlists'];

  // Normalized search query powered by MusicSearchService
  const { data: searchResults, isLoading } = useQuery<NormalizedSearchResult>({
    queryKey: ['music-search', query],
    queryFn: async () => {
      return MusicSearchService.searchAll(query);
    },
    enabled: !!query.trim(),
    staleTime: 60000,
  });

  const songs = searchResults?.songs || [];
  const artists = searchResults?.artists || [];
  const albums = searchResults?.albums || [];
  const playlists = searchResults?.playlists || [];
  const topResult = searchResults?.topResult || null;

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.trim()) {
      window.history.replaceState(null, '', `/search?q=${encodeURIComponent(val)}`);
    } else {
      window.history.replaceState(null, '', '/search');
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-6 bg-[#05060A] text-[#F4F1F7] font-sans select-none pb-36 min-h-screen">
      
      {/* ── SEARCH INPUT BAR (Matching Screenshot 2 - Clean Single Search Input) ── */}
      <div className="relative max-w-3xl mx-auto pt-2">
        <div className="relative flex items-center bg-[#171B26] border border-white/10 rounded-full px-5 py-3 shadow-2xl focus-within:border-[#00D9FF]/60 transition-all duration-300">
          <SearchIcon className="h-5 w-5 text-white/60 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search songs, artists, albums, playlists..."
            className="w-full bg-transparent text-white placeholder-[#9298A8] text-base font-medium outline-none"
          />
          {query && (
            <button onClick={() => handleQueryChange('')} className="p-1.5 rounded-full text-[#9298A8] hover:text-white transition-all mr-1 cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── FILTER CHIPS ROW (Screenshot 2: All | Songs | Artists | Albums | Playlists) ── */}
      {query.trim() && (
        <div className="flex gap-2 justify-start md:justify-center overflow-x-auto scrollbar-none py-1">
          {filters.map((filter) => {
            const isSelected = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#1F2636] text-white border border-[#00D9FF]/40 shadow-lg'
                    : 'bg-[#121620] border border-white/10 text-white/60 hover:text-white'
                }`}
              >
                {isSelected && filter === 'Songs' && <span>✓</span>}
                <span>{filter}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── SEARCH RESULTS SECTION ── */}
      <div className="space-y-6 max-w-4xl mx-auto pt-1">
        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-[#121620] animate-pulse border border-white/5">
                <div className="h-14 w-14 rounded-xl bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-white/10 rounded" />
                  <div className="h-3 w-24 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="space-y-8"
            >
              {/* TOP ARTIST RESULT CARD */}
              {(activeFilter === 'All' || activeFilter === 'Artists') && topResult && topResult.type === 'artist' && (
                <div 
                  onClick={() => router.push(`/artists/${topResult.data.id}`)}
                  className="p-5 rounded-3xl bg-[#121620] border border-white/10 hover:border-[#00D9FF]/40 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <img 
                      src={topResult.data.avatarUrl} 
                      alt={topResult.data.name} 
                      className="w-16 h-16 rounded-full object-cover border border-[#00D9FF]/40"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <BadgeCheck className="w-4 h-4 text-[#00D9FF]" />
                        <span className="text-[10px] font-bold text-[#00D9FF] uppercase tracking-wider">Top Artist</span>
                      </div>
                      <h3 className="text-lg font-black text-white group-hover:text-[#00D9FF] transition-colors">{topResult.data.name}</h3>
                      <p className="text-xs text-white/50">{topResult.data.genres?.join(', ')}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                </div>
              )}

              {/* SONGS LIST (Screenshot 2: Exact matching songs list with 3-dots) */}
              {(activeFilter === 'All' || activeFilter === 'Songs') && songs.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-extrabold text-white tracking-wide">Songs</h2>

                  <div className="space-y-2">
                    {songs.map((song, idx) => {
                      const artwork = getTrackArtwork(song);
                      const artistStr = typeof song.artist === 'string' ? song.artist : song.artist.name;

                      return (
                        <div
                          key={song.id || idx}
                          onClick={() => {
                            playTrack({
                              id: song.id,
                              title: song.title,
                              artist: artistStr,
                              album: song.album || 'Single',
                              coverUrl: artwork,
                              durationMs: song.durationMs || 225000,
                              sourceType: song.sourceType || 'stream',
                            } as any);
                          }}
                          className="flex items-center justify-between p-3 rounded-2xl bg-[#121620] border border-white/5 hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer group"
                        >
                          {/* Left: Artwork + Title + Play Count */}
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <img
                              src={artwork}
                              alt={song.title}
                              className="h-14 w-14 rounded-xl object-cover border border-white/10 shrink-0 bg-black/40"
                            />
                            <div className="min-w-0 flex-1 pr-2">
                              <h3 className="font-bold text-sm text-white group-hover:text-[#00D9FF] truncate transition-colors">
                                {song.title}
                              </h3>
                              <p className="text-xs text-white/50 truncate mt-0.5 font-medium">
                                {song.plays || `${Math.floor(Math.random() * 30 + 1)} lakh plays`}
                              </p>
                            </div>
                          </div>

                          {/* Right: 3-Dots Action Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToQueue({
                                id: song.id,
                                title: song.title,
                                artist: artistStr,
                                coverUrl: artwork,
                                durationMs: song.durationMs || 225000,
                                sourceType: song.sourceType || 'stream',
                              } as any);
                            }}
                            className="p-2 text-white/40 group-hover:text-white transition-colors cursor-pointer shrink-0"
                            aria-label="Track Options"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ARTISTS GRID */}
              {(activeFilter === 'All' || activeFilter === 'Artists') && artists.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-extrabold text-white tracking-wide">Artists</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {artists.map((art) => (
                      <div
                        key={art.id}
                        onClick={() => router.push(`/artists/${art.id}`)}
                        className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#121620] border border-white/10 hover:border-[#00D9FF]/40 cursor-pointer transition-all group"
                      >
                        <img 
                          src={art.avatarUrl} 
                          alt={art.name} 
                          className="w-12 h-12 rounded-full object-cover border border-white/10"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-xs text-white group-hover:text-[#00D9FF] truncate block">
                            {art.name}
                          </span>
                          <span className="text-[10px] text-white/50 font-mono">Artist</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';

export default function SearchPage() {
  return (
    <FeatureErrorBoundary featureName="Search">
      <Suspense fallback={<div className="p-10 text-[#9298A8] text-xs font-mono animate-pulse">Loading Search...</div>}>
        <SearchContent />
      </Suspense>
    </FeatureErrorBoundary>
  );
}
