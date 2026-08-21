'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { MusicSearchService, NormalizedSearchResult } from '@/services/MusicSearchService';
import { Track, Artist, Album, Playlist, getArtistName } from '@/types';
import { resolveArtwork } from '@/utils/artwork';
import { Artwork } from '@/components/ui/Artwork';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassPill } from '@/components/ui/GlassPill';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import {
  Search as SearchIcon, 
  Play, 
  Sparkles, 
  X, 
  Music, 
  BadgeCheck, 
  Plus, 
  MoreHorizontal, 
  ChevronRight, 
  User, 
  Disc, 
  ListMusic, 
  History, 
  Compass, 
  Flame, 
  Zap, 
  Music2, 
  Moon, 
  Dumbbell, 
  Heart, 
  Brain, 
  Radio,
  Command
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const POPULAR_SEARCHES = [
  'Arijit Singh', 'Kesariya', 'Diljit Dosanjh', 'Tujhe Kitna Chahne Lage',
  'Bengali Songs', 'Anupam Roy', 'The Weeknd', 'Lo-Fi Chill Beats', 'Punjabi Hype'
];

const DISCOVER_DIMENSIONS = [
  { code: 'DIMENSION 01', name: 'Bollywood Hits', genre: 'Hindi Cinema', color: '#DFFF00', icon: Flame, query: 'Arijit Singh Pritam Hits' },
  { code: 'DIMENSION 02', name: 'Punjabi Hype', genre: 'Punjabi Pop', color: '#00D9FF', icon: Zap, query: 'Diljit Dosanjh Karan Aujla' },
  { code: 'DIMENSION 03', name: 'Bengali Melodies', genre: 'Bengali Folk & Rock', color: '#DFFF00', icon: Music2, query: 'Anupam Roy Bengali Hits' },
  { code: 'DIMENSION 04', name: 'Global Pop', genre: 'International Hits', color: '#00D9FF', icon: Disc, query: 'Global Pop Top Hits' },
  { code: 'DIMENSION 05', name: 'Lo-Fi Chill', genre: 'Ambient Lofi', color: '#DFFF00', icon: Moon, query: 'Lo-Fi Chill Beats' },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const inputRef = useRef<HTMLInputElement>(null);

  const { playTrack, addToQueue, currentTrack } = usePlaybackStore();
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState('All');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<NormalizedSearchResult>({
    topResult: null,
    songs: [],
    artists: [],
    albums: [],
    playlists: [],
  });
  const [page, setPage] = useState(1);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load Recent Searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('neotunes_recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      }
    } catch {}
  }, []);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const updated = [trimmed, ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
      try {
        localStorage.setItem('neotunes_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== term);
      try {
        localStorage.setItem('neotunes_recent_searches', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('neotunes_recent_searches');
  };

  // Perform Search with AbortController for race condition protection
  const executeSearch = async (searchQuery: string, offsetNum = 0) => {
    const q = searchQuery.trim();
    if (!q) {
      setResults({ topResult: null, songs: [], artists: [], albums: [], playlists: [] });
      setIsLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);

    try {
      const res = await MusicSearchService.searchAll(q, {
        limit: 20,
        offset: offsetNum,
        signal: controller.signal,
      });

      if (offsetNum === 0) {
        setResults(res);
      } else {
        setResults((prev) => ({
          topResult: prev.topResult || res.topResult,
          songs: [...prev.songs, ...res.songs],
          artists: [...prev.artists, ...res.artists],
          albums: [...prev.albums, ...res.albums],
          playlists: [...prev.playlists, ...res.playlists],
        }));
      }

      saveRecentSearch(q);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.warn('Search execution error:', err);
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  // 300ms Debounced live search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.trim()) {
        executeSearch(query, 0);
        setPage(1);
      } else {
        setResults({ topResult: null, songs: [], artists: [], albums: [], playlists: [] });
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.trim()) {
      window.history.replaceState(null, '', `/search?q=${encodeURIComponent(val)}`);
    } else {
      window.history.replaceState(null, '', '/search');
    }
  };

  const filters = ['All', 'Songs', 'Artists', 'Albums', 'Playlists'];

  const songs = results.songs;
  const artists = results.artists;
  const albums = results.albums;
  const playlists = results.playlists;
  const topResult = results.topResult;

  const hasNoResults =
    !isLoading &&
    query.trim().length > 0 &&
    songs.length === 0 &&
    artists.length === 0 &&
    albums.length === 0 &&
    playlists.length === 0;

  const formatTime = (seconds?: number) => {
    if (!seconds || isNaN(seconds)) return '3:15';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-8 bg-transparent text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 min-h-screen max-w-[1450px] mx-auto">
      
      {/* ── GLASS SEARCH INPUT BAR (58px Height, 20px Radius) ── */}
      <div className="max-w-2xl mx-auto space-y-4 pt-2">
        <div className="relative flex items-center bg-white/[0.055] border border-white/10 focus-within:border-[#DFFF00] rounded-2xl px-4 py-3.5 shadow-2xl transition-all duration-300 backdrop-blur-xl">
          <SearchIcon className="h-5 w-5 text-[#A1A1A6] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search songs, artists, albums, playlists..."
            className="w-full bg-transparent text-white placeholder-[#A1A1A6] text-sm sm:text-base font-medium outline-none"
            autoFocus
          />
          {query ? (
            <button
              onClick={() => handleQueryChange('')}
              className="p-1.5 rounded-full text-[#A1A1A6] hover:text-white transition-all mr-1 cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold bg-white/10 rounded border border-white/10 text-[#A1A1A6]">
              <Command className="h-3 w-3" /> K
            </kbd>
          )}
        </div>
      </div>

      {/* ── RECENT SEARCHES (Max 5 items, Compact single-item delete) ── */}
      {!query.trim() && recentSearches.length > 0 && (
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono font-bold text-[#A1A1A6] uppercase tracking-widest flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[#DFFF00]" /> RECENT SEARCHES
            </h3>
            <button
              onClick={clearAllRecent}
              className="text-xs font-mono font-bold text-[#A1A1A6] hover:text-white transition-colors cursor-pointer"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-1.5">
            {recentSearches.map((term) => (
              <div
                key={term}
                onClick={() => handleQueryChange(term)}
                className="h-11 px-4 rounded-xl bg-white/[0.045] border border-white/10 hover:border-white/20 text-xs font-medium text-white flex items-center justify-between cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <History className="w-4 h-4 text-[#A1A1A6] shrink-0" />
                  <span className="truncate">{term}</span>
                </div>
                <button
                  onClick={(e) => removeRecentSearch(term, e)}
                  className="p-1 rounded-full text-[#A1A1A6] hover:text-white transition-colors"
                  aria-label={`Remove ${term}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── POPULAR SEARCHES (38px Compact Glass Pills) ── */}
      {!query.trim() && (
        <div className="max-w-2xl mx-auto space-y-3 pt-2">
          <span className="text-xs font-mono font-bold text-[#A1A1A6] uppercase tracking-widest flex items-center gap-1.5 px-1">
            <Sparkles className="h-3.5 w-3.5 text-[#DFFF00]" /> POPULAR SEARCHES
          </span>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((topic) => (
              <button
                key={topic}
                onClick={() => handleQueryChange(topic)}
                className="px-4 py-2 rounded-full bg-white/[0.045] hover:bg-white/[0.09] border border-white/10 hover:border-[#DFFF00]/40 text-xs font-mono font-bold text-[#F5F5F7] hover:text-white transition-all cursor-pointer h-[38px] flex items-center justify-center"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── DISCOVER FREQUENCIES (2-Col Mobile / 5-Col Desktop) ── */}
      {!query.trim() && (
        <div className="max-w-2xl mx-auto space-y-4 pt-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold text-[#A1A1A6] uppercase tracking-widest flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-[#00D9FF]" /> DISCOVER FREQUENCIES
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {DISCOVER_DIMENSIONS.map((dim) => {
              const Icon = dim.icon;
              return (
                <GlassCard
                  key={dim.code}
                  onClick={() => handleQueryChange(dim.query)}
                  className="p-3.5 cursor-pointer group space-y-2 hover:border-[#DFFF00]/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-[#A1A1A6]">
                      {dim.code}
                    </span>
                    <div className="p-1.5 rounded-lg bg-white/10 text-[#DFFF00]">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-white truncate group-hover:text-[#DFFF00] transition-colors">
                      {dim.name}
                    </h3>
                    <p className="text-[10px] text-[#A1A1A6] truncate mt-0.5 font-mono">{dim.genre}</p>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* ── FILTER CATEGORY CHIPS ── */}
      {query.trim() && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 max-w-2xl mx-auto min-h-[40px]">
          {filters.map((filter) => {
            const isSelected = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-xs font-mono font-bold shrink-0 transition-all cursor-pointer h-[38px] flex items-center gap-2 ${
                  isSelected
                    ? 'bg-white/[0.09] text-white border border-[#DFFF00] shadow-sm font-extrabold'
                    : 'bg-white/[0.045] text-[#A1A1A6] hover:text-white border border-white/10 hover:border-white/20'
                }`}
              >
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#DFFF00]" />}
                <span>{filter}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── SEARCH RESULTS STAGE ── */}
      <div className="space-y-6 max-w-2xl mx-auto">
        
        {/* SHIMMER LOADING SKELETONS */}
        {isLoading && page === 1 ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.045] border border-white/10 animate-pulse"
              >
                <div className="h-12 w-12 rounded-xl bg-white/10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-40 bg-white/10 rounded" />
                  <div className="h-3 w-24 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter + query}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="space-y-6"
            >
              {/* NO RESULTS STATE */}
              {hasNoResults && (
                <GlassCard className="p-8 text-center space-y-4 max-w-md mx-auto">
                  <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#A1A1A6]">
                    <SearchIcon className="w-6 h-6 text-[#DFFF00]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">No results for "{query}"</h3>
                    <p className="text-xs text-[#A1A1A6] mt-1">
                      Check spelling, try searching by artist name, or clear filters.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => handleQueryChange('Arijit Singh')}
                      className="px-4 py-2 rounded-full bg-[#DFFF00] text-black text-xs font-mono font-bold uppercase tracking-wider"
                    >
                      Browse Trending
                    </button>
                    <button
                      onClick={() => handleQueryChange('')}
                      className="px-4 py-2 rounded-full bg-white/5 text-white/70 text-xs font-mono font-bold"
                    >
                      Clear Search
                    </button>
                  </div>
                </GlassCard>
              )}

              {/* TOP RESULT CARD */}
              {(activeFilter === 'All' || activeFilter === 'Artists') && topResult && (
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-[#DFFF00] uppercase tracking-wider px-1">
                    TOP RESULT
                  </span>

                  <GlassCard
                    onClick={() => {
                      if (topResult.type === 'artist') {
                        router.push(`/artists/${topResult.data.canonicalId || topResult.data.id}`);
                      } else if (topResult.type === 'album') {
                        router.push(`/albums/${topResult.data.canonicalId || topResult.data.id}`);
                      } else if (topResult.type === 'song') {
                        playTrack(topResult.data as Track);
                      }
                    }}
                    className="p-4 flex items-center justify-between cursor-pointer group hover:border-[#DFFF00]/40"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <Artwork
                        source={resolveArtwork(topResult.data)}
                        size="medium"
                        canonicalId={topResult.data.id}
                        type={topResult.type === 'artist' ? 'artist' : 'track'}
                        className="h-16 w-16 rounded-2xl object-cover border border-white/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white group-hover:text-[#DFFF00] truncate transition-colors">
                          {(topResult.data as any).title || (topResult.data as any).name}
                        </div>
                        <div className="text-xs text-[#A1A1A6] truncate mt-0.5">
                          {topResult.type.toUpperCase()} • {getArtistName((topResult.data as any).artists || (topResult.data as any).artist || '')}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-full bg-[#DFFF00] text-black shadow-md hover:scale-105 transition-transform shrink-0">
                      <Play className="w-5 h-5 fill-black text-black ml-0.5" />
                    </div>
                  </GlassCard>
                </div>
              )}

              {/* SONGS LIST (`SearchResultRow` 56px Artwork) */}
              {(activeFilter === 'All' || activeFilter === 'Songs') && songs.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      SONGS ({songs.length})
                    </span>
                  </div>

                  <div className="space-y-2">
                    {songs.map((song) => {
                      const isCurrent = currentTrack?.id === song.id;
                      return (
                        <GlassCard
                          key={song.id}
                          onClick={() => playTrack(song)}
                          className="p-3 flex items-center justify-between cursor-pointer group hover:border-[#DFFF00]/40 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <Artwork
                              source={resolveArtwork(song)}
                              size="medium"
                              canonicalId={song.id}
                              type="track"
                              className="h-14 w-14 rounded-xl object-cover border border-white/10 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className={`text-xs font-bold truncate group-hover:text-[#DFFF00] transition-colors ${
                                isCurrent ? 'text-[#DFFF00]' : 'text-[#F5F5F7]'
                              }`}>
                                {song.title}
                              </div>
                              <div className="text-[11px] text-[#A1A1A6] truncate mt-0.5">
                                {getArtistName(song.artists || song.artist)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 px-2">
                            <span className="text-xs font-mono text-[#A1A1A6]">
                              {formatTime(song.duration)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToQueue(song);
                              }}
                              className="p-2 rounded-full bg-white/5 hover:bg-[#DFFF00] hover:text-black text-[#A1A1A6] transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                              title="Add to queue"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </GlassCard>
                      );
                    })}
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

export default function SearchPage() {
  return (
    <FeatureErrorBoundary featureName="Search">
      <Suspense fallback={
        <div className="p-10 text-center text-xs font-mono text-[#A1A1A6]">
          Loading search engine...
        </div>
      }>
        <SearchContent />
      </Suspense>
    </FeatureErrorBoundary>
  );
}
