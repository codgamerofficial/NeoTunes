'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { usePlaybackStore } from '@/store/playback-store';
import {
  Search as SearchIcon, Play, Mic, Sparkles, User, Disc, ListMusic,
  CheckCircle2, ChevronRight, TrendingUp, Clock, X, Music,
  BadgeCheck, ListPlus, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawQuery = searchParams.get('q') || '';
  const inputRef = useRef<HTMLInputElement>(null);

  const { playTrack, addToQueue } = usePlaybackStore();
  const [query, setQuery] = useState(rawQuery);
  const [activeFilter, setActiveFilter] = useState('All');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (rawQuery) setQuery(rawQuery);
  }, [rawQuery]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('neotunes-recent-searches');
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch {}
  }, []);

  const saveRecentSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 8);
    setRecentSearches(updated);
    try { localStorage.setItem('neotunes-recent-searches', JSON.stringify(updated)); } catch {}
  };

  const filters = ['All', 'Songs', 'Artists', 'Albums', 'Playlists'];

  const genreCards = [
    { title: 'Bollywood Hits', icon: '🎬', bg: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80' },
    { title: 'Punjabi Hip-Hop', icon: '🔥', bg: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80' },
    { title: 'Lo-Fi Chill', icon: '☕', bg: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80' },
    { title: 'Global Pop', icon: '🌍', bg: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80' },
    { title: 'EDM & Party', icon: '🎉', bg: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80' },
    { title: 'Acoustic Sunset', icon: '🌅', bg: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80' },
    { title: 'K-Pop Hits', icon: '🇰🇷', bg: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80' },
    { title: 'Indie Acoustic', icon: '🎸', bg: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80' },
  ];

  const trendingSearches = ['Arijit Singh', 'Blinding Lights', 'Kesariya', 'Dil Se', 'sad songs', 'workout playlist', 'Dua Lipa', 'AP Dhillon'];

  const { data: searchResults, isLoading, isFetching } = useQuery({
    queryKey: ['search-results', query],
    queryFn: async () => {
      if (!query.trim()) return null;
      saveRecentSearch(query.trim());
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!query.trim(),
    staleTime: 60000,
  });

  const songs = searchResults?.songs || searchResults?.tracks || [];
  const apiArtists = searchResults?.artists || [];
  const apiAlbums = searchResults?.albums || [];
  const apiPlaylists = searchResults?.playlists || [];
  const topArtist = searchResults?.topArtist || null;

  const getArtistName = (art: any) => {
    if (!art) return 'Artist';
    if (typeof art === 'string') return art;
    if (typeof art === 'object' && art.name) return art.name;
    return 'Artist';
  };

  const getAlbumName = (alb: any) => {
    if (!alb) return 'Single';
    if (typeof alb === 'string') return alb;
    if (typeof alb === 'object' && (alb.name || alb.title)) return alb.name || alb.title;
    return 'Single';
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val.trim()) {
      window.history.replaceState(null, '', `/search?q=${encodeURIComponent(val)}`);
    } else {
      window.history.replaceState(null, '', '/search');
    }
  };

  const handleSearch = (term: string) => {
    setQuery(term);
    setActiveFilter('All');
    window.history.replaceState(null, '', `/search?q=${encodeURIComponent(term)}`);
  };

  const hasResults = searchResults && (songs.length > 0 || apiArtists.length > 0 || apiAlbums.length > 0 || apiPlaylists.length > 0 || topArtist);

  return (
    <div className="p-6 md:p-10 space-y-8 bg-[#000000] text-[#F4F1F7] font-sans select-none pb-36 min-h-screen">

      {/* ── SEARCH HERO (Spec 6) ── */}
      <div className="relative max-w-3xl mx-auto">
        <div className="relative flex items-center bg-[#121318] border border-white/10 rounded-full px-6 py-4 shadow-2xl focus-within:border-[#AFC7FF]/60 transition-all duration-300">
          <SearchIcon className="h-5 w-5 text-[#AFC7FF] mr-4 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search songs, artists, albums, playlists..."
            className="w-full bg-transparent text-white placeholder-[#A8A7AF] text-base font-medium outline-none"
          />
          {query && (
            <button onClick={() => handleQueryChange('')} className="p-1.5 rounded-full text-[#A8A7AF] hover:text-white transition-all mr-1">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── FILTER TABS ── */}
      {query.trim() && (
        <div className="flex gap-2 justify-center overflow-x-auto scrollbar-none">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                activeFilter === filter
                  ? 'bg-[#AFC7FF] text-black shadow-[0_0_15px_rgba(175,199,255,0.4)]'
                  : 'bg-[#121318] border border-white/10 text-white/60 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      )}

      {/* ── SEARCH RESULTS ── */}
      {query.trim() ? (
        <div className="space-y-10 max-w-5xl mx-auto">

          {/* Loading State */}
          {isLoading || isFetching ? (
            <div className="space-y-4 py-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[#121318] animate-pulse">
                  <div className="h-12 w-12 rounded-xl bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 bg-white/10 rounded" />
                    <div className="h-3 w-32 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : !hasResults ? (
            <div className="text-center py-16 space-y-3 bg-[#121318] rounded-3xl border border-white/10 max-w-md mx-auto">
              <Music className="h-12 w-12 text-[#AFC7FF] mx-auto opacity-50" />
              <div className="text-base font-bold text-white">No results found for &quot;{query}&quot;</div>
              <div className="text-xs text-[#A8A7AF]">Try searching for a song, artist, album, or playlist name</div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFilter}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-10"
              >

                {/* ── TOP ARTIST CARD ── */}
                {(activeFilter === 'All' || activeFilter === 'Artists') && topArtist && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative rounded-[28px] overflow-hidden bg-[#121318] border border-white/10 p-6 sm:p-8 flex items-center gap-6 cursor-pointer group hover:border-[#AFC7FF]/40 transition-all"
                    onClick={() => router.push(`/artists/${topArtist.id}`)}
                  >
                    <img
                      src={topArtist.coverUrl || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80'}
                      alt={topArtist.name}
                      className="h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover border-2 border-[#AFC7FF]/40 shadow-xl group-hover:scale-105 transition-transform flex-shrink-0"
                    />
                    <div className="relative z-10 min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="h-5 w-5 text-[#AFC7FF]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#AFC7FF]">Verified Artist</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white group-hover:text-[#AFC7FF] transition-colors truncate">{topArtist.name}</h3>
                      <p className="text-xs text-[#A8A7AF] truncate">{topArtist.genres?.slice(0, 3).join(', ') || 'Artist'}</p>
                    </div>
                    <ChevronRight className="h-6 w-6 text-white/30 group-hover:text-[#AFC7FF] group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </motion.div>
                )}

                {/* ── SONGS SECTION (Compact Rows) ── */}
                {(activeFilter === 'All' || activeFilter === 'Songs') && (
                  songs.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#AFC7FF]">
                        Songs ({songs.length})
                      </h4>
                      <div className="space-y-1.5">
                        {songs.slice(0, activeFilter === 'Songs' ? 50 : 8).map((song: any, idx: number) => (
                          <div
                            key={`${song.id}-${idx}`}
                            className="flex items-center justify-between p-3 rounded-2xl bg-[#121318] border border-white/5 hover:border-[#AFC7FF]/30 cursor-pointer transition-all group"
                          >
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                              <span className="text-[11px] font-mono font-bold text-[#A8A7AF] w-5 text-right">{idx + 1}</span>
                              <img
                                src={song.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80'}
                                alt=""
                                className="h-11 w-11 rounded-xl object-cover flex-shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-xs text-white group-hover:text-[#AFC7FF] truncate transition-colors">{song.title}</div>
                                <div className="text-[11px] text-[#A8A7AF] truncate mt-0.5">{getArtistName(song.artist)} • {getAlbumName(song.album)}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToQueue({
                                    id: song.id,
                                    title: song.title,
                                    artist: typeof song.artist === 'object' && song.artist ? song.artist : { id: 'a', name: getArtistName(song.artist) },
                                    coverUrl: song.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80',
                                    durationMs: song.durationMs || 180000,
                                    sourceType: 'youtube',
                                  });
                                }}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#A8A7AF] hover:text-white transition-all cursor-pointer"
                                title="Add to Queue"
                              >
                                <ListPlus className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => playTrack({
                                  id: song.id,
                                  title: song.title || 'Track',
                                  artist: typeof song.artist === 'object' && song.artist ? song.artist : { id: 'a', name: getArtistName(song.artist) },
                                  coverUrl: song.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80',
                                  durationMs: song.durationMs || 180000,
                                  sourceType: 'youtube',
                                })}
                                className="p-2 rounded-xl bg-[#AFC7FF] text-black hover:scale-105 transition-transform shadow-[0_0_10px_rgba(175,199,255,0.4)] cursor-pointer"
                                title="Play Now"
                              >
                                <Play className="h-4 w-4 fill-black ml-0.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}

                {/* ── ARTISTS SECTION ── */}
                {(activeFilter === 'All' || activeFilter === 'Artists') && (
                  apiArtists.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#AFC7FF]">
                        Artists ({apiArtists.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {apiArtists.slice(0, activeFilter === 'Artists' ? 24 : 3).map((artist: any) => (
                          <div
                            key={artist.id}
                            onClick={() => router.push(`/artists/${artist.id}`)}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-[#121318] border border-white/10 hover:border-[#AFC7FF]/30 cursor-pointer transition-all group"
                          >
                            <img
                              src={artist.coverUrl || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80'}
                              alt={artist.name}
                              className="h-12 w-12 rounded-full object-cover border border-white/10 group-hover:scale-105 transition-transform flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-xs text-white group-hover:text-[#AFC7FF] transition-colors truncate">{artist.name}</div>
                              <div className="text-[10px] font-mono text-[#AFC7FF] mt-0.5">Artist</div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-[#AFC7FF] transition-all" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}

                {/* ── ALBUMS SECTION ── */}
                {(activeFilter === 'All' || activeFilter === 'Albums') && (
                  apiAlbums.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#AFC7FF]">
                        Albums ({apiAlbums.length})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {apiAlbums.slice(0, activeFilter === 'Albums' ? 20 : 4).map((album: any) => (
                          <div
                            key={album.id}
                            onClick={() => router.push(`/albums/${album.id}`)}
                            className="p-3.5 rounded-2xl bg-[#121318] border border-white/10 hover:border-[#AFC7FF]/30 cursor-pointer transition-all group space-y-2"
                          >
                            <img
                              src={album.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80'}
                              alt={getAlbumName(album)}
                              className="aspect-square w-full rounded-xl object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="font-bold text-xs text-white group-hover:text-[#AFC7FF] truncate transition-colors">{getAlbumName(album)}</div>
                            <div className="text-[11px] text-[#A8A7AF] truncate">{getArtistName(album.artist) || 'Album'}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      ) : (
        /* ── DEFAULT EMPTY SEARCH STATE ── */
        <div className="space-y-10 max-w-5xl mx-auto">

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#A8A7AF] flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#AFC7FF]" /> Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSearch(term)}
                    className="px-4 py-2 rounded-full bg-[#121318] border border-white/10 text-xs font-bold text-white/80 hover:text-white hover:border-[#AFC7FF]/40 transition-all cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#A8A7AF] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#AFC7FF]" /> Trending Now
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {trendingSearches.map((term, idx) => (
                <button
                  key={term}
                  onClick={() => handleSearch(term)}
                  className="flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-[#121318] border border-white/10 hover:border-[#AFC7FF]/40 text-left transition-all group cursor-pointer"
                >
                  <span className="text-xs font-mono font-bold text-[#AFC7FF] w-5">{idx + 1}</span>
                  <span className="text-xs font-bold text-white group-hover:text-[#AFC7FF] transition-colors">{term}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-white/30 ml-auto group-hover:text-[#AFC7FF] group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Browse Categories */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#A8A7AF]">
              Browse Categories
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {genreCards.map((genre) => (
                <div
                  key={genre.title}
                  onClick={() => handleSearch(genre.title)}
                  className="relative h-28 rounded-2xl overflow-hidden p-4 cursor-pointer group border border-white/10 bg-[#121318] shadow-lg"
                >
                  <img src={genre.bg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-500" />
                  <div className="relative z-10 space-y-1">
                    <div className="text-xl">{genre.icon}</div>
                    <div className="font-bold text-xs text-white group-hover:text-[#AFC7FF] transition-colors">{genre.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';

export default function SearchPage() {
  return (
    <FeatureErrorBoundary featureName="Search">
      <Suspense fallback={<div className="p-10 text-[#A8A7AF] text-xs font-mono animate-pulse">Loading Search...</div>}>
        <SearchContent />
      </Suspense>
    </FeatureErrorBoundary>
  );
}
