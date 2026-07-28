'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { usePlaybackStore } from '@/store/playback-store';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search as SearchIcon,
  Play,
  Pause,
  Heart,
  X,
  CheckCircle2,
  Music,
  Disc,
  Users,
  Clock,
  Video,
  ListMusic,
  Radio as RadioIcon,
  Sparkles,
  SlidersHorizontal,
  Plus,
  Share2,
  MoreHorizontal,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface UnifiedSearchTrack {
  id: string;
  title: string;
  artist: { name: string; avatarUrl?: string };
  album?: { name: string; coverUrl?: string; releaseDate?: string };
  durationMs: number;
  coverUrl: string;
  sourceType: 'youtube' | 'cloud';
  sourceId?: string;
  explicit?: boolean;
}

type FilterCategory = 'All' | 'Songs' | 'Artists' | 'Albums' | 'Playlists' | 'Videos' | 'Podcasts' | 'Radio' | 'Library';
type SortOption = 'relevance' | 'popularity' | 'newest' | 'oldest' | 'alphabetical' | 'duration';

const CATEGORIES = [
  { id: 'pop', title: 'Pop & Charts', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80' },
  { id: 'hiphop', title: 'Hip-Hop & Rap', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80' },
  { id: 'bollywood', title: 'Bollywood Romantic', cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80' },
  { id: 'lofi', title: 'Lo-Fi Study Beats', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80' },
  { id: 'indie', title: 'Indie Acoustic', cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80' },
  { id: 'rock', title: 'Rock Classics', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80' },
  { id: 'classical', title: 'Classical & Ambient', cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80' },
  { id: 'edm', title: 'EDM & Synthwave', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80' },
];

const INITIAL_TRENDING = [
  'Perfect Ed Sheeran', 'Kesariya Arijit Singh', 'Blinding Lights The Weeknd',
  'Flowers Miley Cyrus', 'Houdini Eminem', 'Coldplay Yellow'
];

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('All');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Ed Sheeran Perfect', 'Arijit Singh', 'Lo-Fi Chill Beats'
  ]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { playTrack, currentTrack, isPlaying, setPlaying } = usePlaybackStore();

  /* Live Search Debounce (200ms) */
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);
    return () => clearTimeout(handler);
  }, [query]);

  // Execute Universal Search API Query
  const { data, isLoading } = useQuery<{
    tracks?: UnifiedSearchTrack[];
    songs?: UnifiedSearchTrack[];
    artists?: any[];
    albums?: any[];
    playlists?: any[];
    videos?: UnifiedSearchTrack[];
    topArtist?: any;
  }>({
    queryKey: ['universal-search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return {};
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery.trim())}`);
      if (!res.ok) return {};
      return res.json();
    },
    enabled: debouncedQuery.trim().length > 0,
  });

  const rawSongs: UnifiedSearchTrack[] = data?.tracks?.length ? data.tracks : (data?.songs?.length ? data.songs : []);
  const rawArtists = data?.artists || [];
  const rawAlbums = data?.albums || [];
  const rawPlaylists = data?.playlists || [];

  // Sort Songs based on selected Sort Option
  const getSortedSongs = () => {
    let list = [...rawSongs];
    if (sortBy === 'duration') list.sort((a, b) => b.durationMs - a.durationMs);
    else if (sortBy === 'alphabetical') list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  };

  const sortedSongs = getSortedSongs();
  const topResult = sortedSongs[0] || null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const cleanTitle = (title: string) => {
    if (!title) return 'Track';
    return title.split('_')[0].split('ft.')[0].trim();
  };

  const formatTime = (ms: number) => {
    if (!ms) return '3:30';
    const totalSec = Math.floor(ms / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectSearch = (qStr: string) => {
    setQuery(qStr);
    if (!recentSearches.includes(qStr)) {
      setRecentSearches(prev => [qStr, ...prev.slice(0, 4)]);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 bg-[#121212] text-white font-sans select-none pb-28">
      
      {/* ═══ TOAST NOTIFICATION ═══ */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] rounded-full bg-[#181818] border border-[#282828] px-5 py-2 text-xs font-semibold text-white shadow-xl flex items-center gap-2"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#29B6F6]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. UNIVERSAL LIVE SEARCH BAR */}
      <div className="space-y-4 max-w-4xl">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-4 h-5 w-5 text-[#B3B3B3]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists, albums, playlists, or videos..."
            className="w-full bg-[#181818] border border-[#282828] focus:border-[#29B6F6] rounded-full pl-12 pr-12 py-3.5 text-sm font-semibold text-white placeholder-[#B3B3B3] outline-none transition-all shadow-inner"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 text-[#B3B3B3] hover:text-white p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {(['All', 'Songs', 'Artists', 'Albums', 'Playlists', 'Videos', 'Podcasts', 'Radio'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 ${
                  activeFilter === cat
                    ? 'bg-white text-black font-extrabold shadow-md'
                    : 'bg-[#181818] hover:bg-[#282828] text-[#B3B3B3] hover:text-white border border-[#282828]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs text-[#B3B3B3]">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-[#181818] border border-[#282828] text-white text-xs font-semibold rounded-full px-3 py-1 outline-none cursor-pointer"
            >
              <option value="relevance">Relevance</option>
              <option value="duration">Duration</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. INITIAL / EMPTY QUERY STATE */}
      {!query.trim() ? (
        <div className="space-y-10">
          
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-[#B3B3B3] uppercase tracking-wider flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#29B6F6]" /> Recent Searches
                </h3>
                <button onClick={() => setRecentSearches([])} className="text-xs text-[#B3B3B3] hover:text-white">
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((qStr, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSearch(qStr)}
                    className="px-4 py-2 rounded-full bg-[#181818] hover:bg-[#282828] border border-[#282828] text-xs font-bold text-white transition-all"
                  >
                    {qStr}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-[#B3B3B3] uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#29B6F6]" /> Trending Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {INITIAL_TRENDING.map((qStr, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSearch(qStr)}
                  className="px-4 py-2 rounded-full bg-[#181818] hover:bg-[#282828] border border-[#282828] text-xs font-semibold text-[#B3B3B3] hover:text-white transition-all"
                >
                  {qStr}
                </button>
              ))}
            </div>
          </div>

          {/* Browse All Categories Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-white tracking-tight">Browse Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => handleSelectSearch(cat.title)}
                  className="relative h-36 rounded-2xl overflow-hidden cursor-pointer group shadow-lg border border-[#282828]"
                >
                  <ImageWithFallback src={cat.cover} alt={cat.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-transparent p-4 flex items-end">
                    <h3 className="text-base font-extrabold text-white group-hover:text-[#29B6F6] transition-colors">{cat.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (

        /* 3. ACTIVE SEARCH RESULTS STATE (GROUPED SECTIONS) */
        <div className="space-y-10">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-[#B3B3B3]">
              <Disc className="h-8 w-8 animate-spin text-[#29B6F6]" />
              <span className="ml-3 text-xs font-mono">Searching all connected music sources...</span>
            </div>
          ) : sortedSongs.length === 0 ? (
            
            /* SMART NO RESULTS FALLBACK */
            <div className="text-center py-16 space-y-6">
              <div className="space-y-2">
                <Music className="h-10 w-10 mx-auto text-[#282828]" />
                <p className="text-sm font-bold text-white">No exact match found for &quot;{query}&quot;</p>
                <p className="text-xs text-[#B3B3B3]">Here are suggested songs and trending playlists for you:</p>
              </div>

              {/* Suggested fallback grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
                {CATEGORIES.slice(0, 4).map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectSearch(cat.title)}
                    className="p-4 rounded-2xl bg-[#181818] hover:bg-[#282828] border border-[#282828] cursor-pointer group"
                  >
                    <div className="relative h-24 w-full rounded-xl overflow-hidden mb-3">
                      <ImageWithFallback src={cat.cover} alt={cat.title} fill className="object-cover" />
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#29B6F6]">{cat.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* ⭐ SECTION 1: TOP RESULT & SONGS */}
              {(activeFilter === 'All' || activeFilter === 'Songs') && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Top Result Card */}
                  {topResult && (
                    <div className="space-y-3">
                      <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                        ⭐ Top Result
                      </h2>
                      <div
                        onClick={() => playTrack(topResult, sortedSongs)}
                        className="p-6 rounded-2xl bg-[#181818] hover:bg-[#282828] cursor-pointer transition-all border border-[#282828] group space-y-4 relative"
                      >
                        <div className="relative h-32 w-32 rounded-xl overflow-hidden shadow-xl border border-[#282828]">
                          <ImageWithFallback src={topResult.coverUrl} alt={topResult.title} fill className="object-cover" />
                        </div>
                        <div>
                          <h3 className="text-xl font-extrabold text-white group-hover:text-[#29B6F6] transition-colors truncate">
                            {cleanTitle(topResult.title)}
                          </h3>
                          <p className="text-sm font-medium text-[#B3B3B3] mt-1">{topResult.artist?.name || 'Artist'}</p>
                          <div className="flex items-center gap-2 mt-3">
                            <span className="text-[10px] font-mono font-bold text-[#29B6F6] bg-[#29B6F6]/10 px-2.5 py-0.5 rounded-full border border-[#29B6F6]/20">
                              Hi-Res Lossless
                            </span>
                            <span className="text-[10px] font-mono text-[#B3B3B3] uppercase">
                              {topResult.sourceType}
                            </span>
                          </div>
                        </div>

                        <button className="absolute bottom-6 right-6 h-12 w-12 rounded-full bg-[#29B6F6] text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="h-5 w-5 fill-black translate-x-0.5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 🎵 SECTION 2: SONGS ({count}) - MULTIPLE VERSIONS SUPPORT */}
                  <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                        🎵 Songs ({sortedSongs.length})
                      </h2>
                    </div>

                    <div className="space-y-1">
                      {sortedSongs.map((track, idx) => {
                        const isCurrent = currentTrack?.id === track.id;
                        return (
                          <div
                            key={track.id + idx}
                            onClick={() => playTrack(track, sortedSongs)}
                            className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer group transition-all ${
                              isCurrent ? 'bg-[#181818] text-[#29B6F6]' : 'hover:bg-[#181818] text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className="w-5 text-center text-xs font-mono text-[#B3B3B3] font-bold group-hover:hidden">
                                {idx + 1}
                              </span>
                              <Play className="h-4 w-4 hidden group-hover:block text-white" />
                              
                              <div className="relative h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 border border-[#282828]">
                                <ImageWithFallback src={track.coverUrl} alt={track.title} fill className="object-cover" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className={`text-xs font-bold truncate ${isCurrent ? 'text-[#29B6F6]' : 'text-white group-hover:text-[#29B6F6]'}`}>
                                  {track.title}
                                </p>
                                <p className="text-[11px] text-[#B3B3B3] truncate">
                                  {track.artist?.name || 'Artist'} • {track.album?.name || 'Single'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="hidden sm:inline-block text-[10px] font-mono text-[#29B6F6] bg-[#29B6F6]/10 px-2 py-0.5 rounded border border-[#29B6F6]/20">
                                FLAC 24-bit
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); showToast('Saved to Liked Songs'); }}
                                className="text-[#B3B3B3] hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                              >
                                <Heart className="h-4 w-4" />
                              </button>
                              <span className="text-xs font-mono text-[#B3B3B3] w-12 text-right">
                                {formatTime(track.durationMs)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 👤 SECTION 3: ARTISTS */}
              {(activeFilter === 'All' || activeFilter === 'Artists') && rawArtists.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-[#181818]">
                  <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                    👤 Artists ({rawArtists.length})
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-5">
                    {rawArtists.slice(0, 5).map((art: any) => (
                      <div
                        key={art.id}
                        onClick={() => handleSelectSearch(art.name)}
                        className="p-4 rounded-2xl bg-[#181818] hover:bg-[#282828] cursor-pointer transition-all border border-transparent hover:border-[#282828] group text-center space-y-3"
                      >
                        <div className="relative aspect-square w-full rounded-full overflow-hidden shadow-lg bg-[#282828] mx-auto border-2 border-transparent group-hover:border-[#29B6F6] transition-all">
                          <ImageWithFallback src={art.coverUrl || art.images?.[0]?.url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80'} alt={art.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <h3 className="text-sm font-bold text-white group-hover:text-[#29B6F6] transition-colors truncate flex items-center justify-center gap-1">
                          {art.name} <CheckCircle2 className="h-3.5 w-3.5 text-[#29B6F6]" />
                        </h3>
                        <p className="text-[10px] text-[#B3B3B3]">Artist</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 💿 SECTION 4: ALBUMS */}
              {(activeFilter === 'All' || activeFilter === 'Albums') && rawAlbums.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-[#181818]">
                  <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                    💿 Albums ({rawAlbums.length})
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-5">
                    {rawAlbums.slice(0, 5).map((alb: any) => (
                      <div
                        key={alb.id}
                        onClick={() => handleSelectSearch(alb.name)}
                        className="p-4 rounded-2xl bg-[#181818] hover:bg-[#282828] cursor-pointer transition-all border border-transparent hover:border-[#282828] group space-y-3"
                      >
                        <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-lg bg-[#282828]">
                          <ImageWithFallback src={alb.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80'} alt={alb.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          <button className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-[#29B6F6] text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="h-4 w-4 fill-black translate-x-0.5" />
                          </button>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-[#29B6F6] transition-colors truncate">{alb.name}</h3>
                          <p className="text-xs text-[#B3B3B3] truncate">{alb.artist?.name || 'Artist'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 📃 SECTION 5: PLAYLISTS */}
              {(activeFilter === 'All' || activeFilter === 'Playlists') && rawPlaylists.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-[#181818]">
                  <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                    📃 Playlists ({rawPlaylists.length})
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-5">
                    {rawPlaylists.slice(0, 5).map((pl: any) => (
                      <div
                        key={pl.id}
                        onClick={() => handleSelectSearch(pl.name)}
                        className="p-4 rounded-2xl bg-[#181818] hover:bg-[#282828] cursor-pointer transition-all border border-transparent hover:border-[#282828] group space-y-3"
                      >
                        <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-lg bg-[#282828]">
                          <ImageWithFallback src={pl.coverUrl || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80'} alt={pl.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white group-hover:text-[#29B6F6] transition-colors truncate">{pl.name}</h3>
                          <p className="text-xs text-[#B3B3B3] truncate">By {pl.owner || 'NeoTune'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
