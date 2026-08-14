'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { MusicSearchService, NormalizedSearchResult } from '@/services/MusicSearchService';
import { Track, Artist, Album, Playlist } from '@/types';
import { Artwork } from '@/components/ui/Artwork';
import {
  Search as SearchIcon, Play, Sparkles, X, Music,
  BadgeCheck, ListPlus, MoreVertical, ChevronRight, User, Disc, ListMusic, RefreshCw, Clock, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const inputRef = useRef<HTMLInputElement>(null);

  const { playTrack, addToQueue } = usePlaybackStore();
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
  const [hasMore, setHasMore] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load Recent Searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('neotunes_recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 8));
      }
    } catch {}
  }, []);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const updated = [trimmed, ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
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

  // Perform Search with AbortController for race condition protection
  const executeSearch = async (searchQuery: string, offsetNum = 0) => {
    const q = searchQuery.trim();
    if (!q) {
      setResults({ topResult: null, songs: [], artists: [], albums: [], playlists: [] });
      setIsLoading(false);
      setHasMore(false);
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

      setHasMore(res.songs.length >= 20 || res.albums.length >= 20 || res.playlists.length >= 20);
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

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.trim()) {
        executeSearch(query, 0);
        setPage(1);
      } else {
        setResults({ topResult: null, songs: [], artists: [], albums: [], playlists: [] });
        setIsLoading(false);
      }
    }, 250);

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

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    executeSearch(query, (nextPage - 1) * 20);
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

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-6 bg-[#05060A] text-[#F4F1F7] font-sans select-none pb-36 min-h-screen">
      {/* ── TOP LOGO & SEARCH BAR ── */}
      <div className="max-w-3xl mx-auto space-y-4 pt-2">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00D9FF] via-[#7657FF] to-[#FF2E9A] flex items-center justify-center shadow-[0_0_15px_rgba(0,217,255,0.4)]">
              <Music className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">NeoTunes</span>
          </div>
        </div>

        <div className="relative flex items-center bg-[#121620] border border-white/10 rounded-2xl px-5 py-3.5 shadow-2xl focus-within:border-[#00D9FF]/60 transition-all duration-300">
          <SearchIcon className="h-5 w-5 text-white/50 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search songs, artists, albums, playlists..."
            className="w-full bg-transparent text-white placeholder-[#788094] text-sm sm:text-base font-medium outline-none"
          />
          {query && (
            <button
              onClick={() => handleQueryChange('')}
              className="p-1.5 rounded-full text-[#788094] hover:text-white transition-all mr-1 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── RECENT SEARCHES (When query is empty) ── */}
      {!query.trim() && recentSearches.length > 0 && (
        <div className="max-w-3xl mx-auto space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" /> Recent Searches
            </h3>
            <button
              onClick={() => {
                setRecentSearches([]);
                localStorage.removeItem('neotunes_recent_searches');
              }}
              className="text-[11px] font-semibold text-white/40 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term) => (
              <div
                key={term}
                onClick={() => handleQueryChange(term)}
                className="px-3.5 py-1.5 rounded-full bg-[#121620] border border-white/10 hover:border-[#00D9FF]/40 text-xs font-medium text-white/80 hover:text-white flex items-center gap-2 cursor-pointer transition-all group"
              >
                <span>{term}</span>
                <button
                  onClick={(e) => removeRecentSearch(term, e)}
                  className="text-white/30 group-hover:text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FILTER CHIPS ── */}
      {query.trim() && (
        <div className="flex gap-2 justify-start md:justify-center overflow-x-auto scrollbar-none py-1 max-w-3xl mx-auto">
          {filters.map((filter) => {
            const isSelected = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#1F2636] text-white border border-[#00D9FF]/50 shadow-[0_0_15px_rgba(0,217,255,0.2)]'
                    : 'bg-[#121620] border border-white/10 text-white/60 hover:text-white'
                }`}
              >
                <span>{filter}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── SEARCH RESULTS SECTION ── */}
      <div className="space-y-6 max-w-4xl mx-auto pt-1">
        {/* Loading Skeleton */}
        {isLoading && page === 1 ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#121620] animate-pulse border border-white/5"
              >
                <div className="h-14 w-14 rounded-xl bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-44 bg-white/10 rounded" />
                  <div className="h-3 w-28 bg-white/5 rounded" />
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
              className="space-y-8"
            >
              {/* EMPTY STATE */}
              {hasNoResults && (
                <div className="py-16 text-center space-y-4 max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-full bg-[#121620] border border-white/10 flex items-center justify-center mx-auto text-white/30">
                    <SearchIcon className="w-8 h-8 text-[#00D9FF]/40" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">No results for "{query}"</h3>
                    <p className="text-xs text-white/50 mt-1">
                      Try searching with another spelling, artist name, or album title.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => handleQueryChange('Arijit Singh')}
                      className="px-4 py-2 rounded-xl bg-[#121620] border border-white/10 hover:border-[#00D9FF]/40 text-xs font-bold text-white transition-all"
                    >
                      Browse Trending
                    </button>
                    <button
                      onClick={() => handleQueryChange('')}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white/70 hover:text-white transition-all"
                    >
                      Clear Search
                    </button>
                  </div>
                </div>
              )}

              {/* TOP RESULT CARD */}
              {(activeFilter === 'All' || activeFilter === 'Artists') && topResult && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#00D9FF] uppercase tracking-wider px-1">
                    Top Result
                  </span>

                  <div
                    onClick={() => {
                      if (topResult.type === 'artist') {
                        router.push(`/artists/${topResult.data.canonicalId || topResult.data.id}`);
                      } else if (topResult.type === 'album') {
                        router.push(`/albums/${topResult.data.canonicalId || topResult.data.id}`);
                      } else if (topResult.type === 'playlist') {
                        router.push(`/playlists/${topResult.data.canonicalId || topResult.data.id}`);
                      } else if (topResult.type === 'song') {
                        playTrack(topResult.data as Track);
                      }
                    }}
                    className="p-5 rounded-3xl bg-[#121620] border border-white/10 hover:border-[#00D9FF]/40 cursor-pointer transition-all flex items-center justify-between group shadow-xl"
                  >
                    <div className="flex items-center gap-4">
                      <Artwork
                        source={(topResult.data as any).artworkUrl || (topResult.data as any).imageUrl || (topResult.data as any).coverUrl}
                        size="large"
                        aspectRatio={topResult.type === 'artist' ? 'circle' : 'square'}
                        canonicalId={topResult.data.canonicalId || topResult.data.id}
                        type={topResult.type as any}
                      />
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <BadgeCheck className="w-4 h-4 text-[#00D9FF]" />
                          <span className="text-[10px] font-bold text-[#00D9FF] uppercase tracking-wider">
                            {topResult.type}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-white group-hover:text-[#00D9FF] transition-colors">
                          {(topResult.data as any).name || (topResult.data as any).title}
                        </h3>
                        <p className="text-xs text-white/50 mt-0.5">
                          {topResult.type === 'artist'
                            ? (topResult.data as Artist).genres?.slice(0, 3).join(', ') || 'Artist'
                            : (topResult.data as Track).artists?.join(', ') || (topResult.data as Album).artistName || 'NeoTunes Catalog'}
                        </p>
                      </div>
                    </div>

                    <div className="w-12 h-12 rounded-full bg-[#00D9FF]/10 group-hover:bg-[#00D9FF] text-[#00D9FF] group-hover:text-black flex items-center justify-center transition-all">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
              )}

              {/* SONGS LIST */}
              {(activeFilter === 'All' || activeFilter === 'Songs') && songs.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-extrabold text-white tracking-wide">Songs</h2>

                  <div className="space-y-2">
                    {songs.map((song) => {
                      const canonicalKey = song.canonicalId || `${song.source}:${song.sourceId || song.id}`;
                      const artistStr = Array.isArray(song.artists) ? song.artists.join(', ') : (song.artist as any)?.name || song.artist || 'Artist';

                      return (
                        <div
                          key={canonicalKey}
                          onClick={() => playTrack(song, songs)}
                          className="flex items-center justify-between p-3 rounded-2xl bg-[#121620] border border-white/5 hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <Artwork
                              source={song.artworkUrl || song.coverUrl}
                              size="medium"
                              canonicalId={canonicalKey}
                              type="track"
                            />
                            <div className="min-w-0 flex-1 pr-2">
                              <h3 className="font-bold text-sm text-white group-hover:text-[#00D9FF] truncate transition-colors">
                                {song.title}
                              </h3>
                              <p className="text-xs text-white/50 truncate mt-0.5 font-medium">
                                {artistStr} • {song.album || 'Single'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {song.duration > 0 && (
                              <span className="text-xs font-mono text-white/40 hidden sm:block">
                                {Math.floor(song.duration / 60)}:
                                {String(song.duration % 60).padStart(2, '0')}
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToQueue(song);
                              }}
                              className="p-2 text-white/40 group-hover:text-white transition-colors cursor-pointer shrink-0"
                              aria-label="Track Options"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </div>
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {artists.map((art) => {
                      const canonicalKey = art.canonicalId || art.id;
                      return (
                        <div
                          key={canonicalKey}
                          onClick={() => router.push(`/artists/${art.canonicalId || art.id}`)}
                          className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#121620] border border-white/10 hover:border-[#00D9FF]/40 cursor-pointer transition-all group"
                        >
                          <Artwork
                            source={art.imageUrl || art.avatarUrl}
                            size="medium"
                            aspectRatio="circle"
                            canonicalId={canonicalKey}
                            type="artist"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs text-white group-hover:text-[#00D9FF] truncate block">
                              {art.name}
                            </span>
                            <span className="text-[10px] text-white/50 font-mono">Artist</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ALBUMS GRID */}
              {(activeFilter === 'All' || activeFilter === 'Albums') && albums.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-extrabold text-white tracking-wide">Albums</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {albums.map((alb) => {
                      const canonicalKey = alb.canonicalId || alb.id;
                      return (
                        <div
                          key={canonicalKey}
                          onClick={() => router.push(`/albums/${alb.canonicalId || alb.id}`)}
                          className="p-3 rounded-2xl bg-[#121620] border border-white/10 hover:border-[#00D9FF]/40 cursor-pointer transition-all group space-y-2"
                        >
                          <Artwork
                            source={alb.artworkUrl || alb.coverUrl}
                            size="full"
                            className="aspect-square rounded-xl"
                            canonicalId={canonicalKey}
                            type="album"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-white group-hover:text-[#00D9FF] truncate block">
                              {alb.title || alb.name}
                            </span>
                            <span className="text-[10px] text-white/50 truncate block mt-0.5">
                              {Array.isArray(alb.artists) ? alb.artists.join(', ') : alb.artistName || 'Album'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PLAYLISTS GRID */}
              {(activeFilter === 'All' || activeFilter === 'Playlists') && playlists.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-lg font-extrabold text-white tracking-wide">Playlists</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {playlists.map((pl) => {
                      const canonicalKey = pl.canonicalId || pl.id;
                      return (
                        <div
                          key={canonicalKey}
                          onClick={() => router.push(`/playlists/${pl.canonicalId || pl.id}`)}
                          className="p-3 rounded-2xl bg-[#121620] border border-white/10 hover:border-[#00D9FF]/40 cursor-pointer transition-all group space-y-2"
                        >
                          <Artwork
                            source={pl.artworkUrl || pl.coverUrl}
                            size="full"
                            className="aspect-square rounded-xl"
                            canonicalId={canonicalKey}
                            type="playlist"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-white group-hover:text-[#00D9FF] truncate block">
                              {pl.name}
                            </span>
                            <span className="text-[10px] text-white/50 truncate block mt-0.5">
                              {pl.owner || 'NeoTunes'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* LOAD MORE BUTTON */}
              {hasMore && !isLoading && (
                <div className="pt-4 text-center">
                  <button
                    onClick={handleLoadMore}
                    className="px-6 py-2.5 rounded-full bg-[#121620] border border-white/10 hover:border-[#00D9FF]/50 text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    Load More
                  </button>
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
