'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { usePlayerStore } from '@/store/usePlayerStore';
import {
  Search as SearchIcon, Play, Mic, Sparkles, User, Disc, ListMusic,
  CheckCircle2, ChevronRight, Flame, TrendingUp, Clock, X, Music,
  BadgeCheck, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawQuery = searchParams.get('q') || '';
  const initialQuery = rawQuery || '';
  const inputRef = useRef<HTMLInputElement>(null);

  const { playTrack } = usePlayerStore();
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState('All');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (rawQuery) setQuery(rawQuery);
  }, [rawQuery]);

  // Load recent searches from localStorage
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
    { title: 'Bollywood Hits', color: 'from-[#00D4FF] to-[#0066FF]', icon: '🎬', bg: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80' },
    { title: 'Punjabi Hip-Hop', color: 'from-[#7A3CFF] to-[#FF2D95]', icon: '🔥', bg: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80' },
    { title: 'Lo-Fi Chill', color: 'from-[#10B981] to-[#059669]', icon: '☕', bg: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80' },
    { title: 'Global Pop', color: 'from-[#F59E0B] to-[#D97706]', icon: '🌍', bg: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80' },
    { title: 'EDM & Party', color: 'from-[#EC4899] to-[#8B5CF6]', icon: '🎉', bg: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80' },
    { title: 'Acoustic Sunset', color: 'from-[#3B82F6] to-[#1D4ED8]', icon: '🌅', bg: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80' },
    { title: 'K-Pop Hits', color: 'from-[#E11D48] to-[#FB7185]', icon: '🇰🇷', bg: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80' },
    { title: 'Indie Acoustic', color: 'from-[#A3E635] to-[#65A30D]', icon: '🎸', bg: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80' },
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
  const didYouMean = searchResults?.didYouMean || false;
  const correctedQuery = searchResults?.correctedQuery || query;
  const aiMix = searchResults?.aiMix || null;

  const getArtistName = (art: any) => {
    if (!art) return 'Artist';
    if (typeof art === 'string') return art;
    if (typeof art === 'object' && art.name) return art.name;
    return 'Artist';
  };

  const formatFollowers = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return String(n);
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
    <div className="p-6 md:p-10 space-y-8 bg-[#050505] text-white font-sans select-none pb-36 min-h-screen">

      {/* ── SEARCH BAR ── */}
      <div className="relative max-w-3xl mx-auto">
        <div className="relative flex items-center bg-[#0E1117] border border-white/15 rounded-full px-6 py-4 shadow-[0_10px_40px_rgba(0,0,0,0.6)] focus-within:border-[#00D4FF]/60 focus-within:shadow-[0_0_30px_rgba(0,212,255,0.15)] transition-all duration-300">
          <SearchIcon className="h-5 w-5 text-[#00D4FF] mr-4 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search songs, artists, albums, or ask AI..."
            className="w-full bg-transparent text-white placeholder-white/35 text-base font-medium outline-none"
          />
          {query && (
            <button onClick={() => handleQueryChange('')} className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all mr-1">
              <X className="h-4 w-4" />
            </button>
          )}
          <div className="h-5 w-px bg-white/15 mx-2" />
          <button className="p-2 rounded-full text-white/50 hover:text-[#FF2D95] hover:bg-white/5 transition-all">
            <Mic className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ── FILTER TABS ── */}
      <div className="flex gap-2 justify-center overflow-x-auto scrollbar-none">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
              activeFilter === filter
                ? 'bg-gradient-to-r from-[#00D4FF] to-[#7A3CFF] text-black shadow-[0_0_20px_rgba(0,212,255,0.4)]'
                : 'bg-[#0E1117] border border-white/10 text-white/60 hover:text-white hover:border-white/20'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* ── SEARCH RESULTS ── */}
      {query.trim() ? (
        <div className="space-y-10 max-w-5xl mx-auto">

          {/* Did You Mean */}
          {didYouMean && correctedQuery !== query && (
            <div className="text-sm text-white/50">
              Showing results for <button onClick={() => handleSearch(correctedQuery)} className="text-[#00D4FF] font-bold hover:underline">&quot;{correctedQuery}&quot;</button>
            </div>
          )}

          {/* Loading State */}
          {isLoading || isFetching ? (
            <div className="space-y-4 py-8">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-[#0E1117] animate-pulse">
                  <div className="h-12 w-12 rounded-xl bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 bg-white/10 rounded" />
                    <div className="h-3 w-32 bg-white/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : !hasResults ? (
            <div className="text-center py-16 space-y-4">
              <Music className="h-16 w-16 text-white/10 mx-auto" />
              <div className="text-lg font-bold text-white/40">No results for &quot;{query}&quot;</div>
              <div className="text-sm text-white/25">Try searching for a song, artist, or album name</div>
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

                {/* ── TOP ARTIST HERO CARD ── */}
                {(activeFilter === 'All' || activeFilter === 'Artists') && topArtist && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative rounded-[28px] overflow-hidden bg-gradient-to-r from-[#0C0B18] via-[#140D26] to-[#0A0D14] border border-white/10 p-6 sm:p-8 flex items-center gap-6 cursor-pointer group"
                    onClick={() => router.push(`/artists/${topArtist.id}`)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00D4FF]/5 to-[#7A3CFF]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <img
                      src={topArtist.coverUrl || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80'}
                      alt={topArtist.name}
                      className="h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover border-2 border-[#00D4FF]/30 shadow-[0_0_30px_rgba(0,212,255,0.2)] group-hover:scale-105 transition-transform flex-shrink-0"
                    />
                    <div className="relative z-10 min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <BadgeCheck className="h-5 w-5 text-[#00D4FF]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#00D4FF]">Verified Artist</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white group-hover:text-[#00D4FF] transition-colors truncate">{topArtist.name}</h3>
                      <div className="flex items-center gap-4 mt-2 text-xs text-white/50">
                        <span>{formatFollowers(topArtist.followers || 0)} followers</span>
                        {topArtist.genres?.length > 0 && <span>• {topArtist.genres.slice(0, 3).join(', ')}</span>}
                      </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-white/30 group-hover:text-[#00D4FF] group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </motion.div>
                )}

                {/* ── AI MIX CARD ── */}
                {activeFilter === 'All' && aiMix && (
                  <div className="rounded-[24px] overflow-hidden bg-gradient-to-r from-[#7A3CFF]/20 via-[#00D4FF]/10 to-[#FF2D95]/20 border border-white/10 p-5 flex items-center gap-4 cursor-pointer group hover:border-[#7A3CFF]/40 transition-all"
                    onClick={() => {
                      if (aiMix.tracks?.[0]) {
                        playTrack({
                          id: aiMix.tracks[0].id,
                          title: aiMix.tracks[0].title,
                          artist: aiMix.tracks[0].artist,
                          coverUrl: aiMix.tracks[0].coverUrl,
                          durationMs: aiMix.tracks[0].durationMs,
                          sourceType: 'youtube',
                        });
                      }
                    }}
                  >
                    <div className="text-3xl">{aiMix.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-base text-white">{aiMix.title}</div>
                      <div className="text-xs text-white/50 mt-0.5 truncate">{aiMix.description}</div>
                    </div>
                    <div className="p-3 rounded-full bg-[#7A3CFF] text-white shadow-[0_0_15px_#7A3CFF]">
                      <Play className="h-4 w-4 fill-white ml-0.5" />
                    </div>
                  </div>
                )}

                {/* ── ARTISTS SECTION ── */}
                {(activeFilter === 'All' || activeFilter === 'Artists') && (
                  apiArtists.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#00D4FF] flex items-center gap-2">
                        <User className="h-4 w-4" /> Artists ({apiArtists.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {apiArtists.slice(0, activeFilter === 'Artists' ? 24 : 4).map((artist: any) => (
                          <div
                            key={artist.id}
                            onClick={() => router.push(`/artists/${artist.id}`)}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-[#0E1117] border border-white/8 hover:border-[#00D4FF]/30 cursor-pointer transition-all group"
                          >
                            <img
                              src={artist.coverUrl || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80'}
                              alt={artist.name}
                              className="h-14 w-14 rounded-full object-cover border border-white/10 group-hover:scale-105 transition-transform"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 font-bold text-sm text-white group-hover:text-[#00D4FF] transition-colors">
                                <span className="truncate">{artist.name}</span>
                                {artist.verified && <CheckCircle2 className="h-3.5 w-3.5 text-[#00D4FF] flex-shrink-0" />}
                              </div>
                              <div className="text-[11px] text-white/40 mt-0.5">
                                {artist.followers ? formatFollowers(artist.followers) + ' followers' : artist.genres?.slice(0, 2).join(', ') || 'Artist'}
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-[#00D4FF] group-hover:translate-x-0.5 transition-all" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : activeFilter === 'Artists' && !topArtist ? (
                    <div className="text-white/40 text-sm py-6 text-center">No artists found matching &quot;{query}&quot;</div>
                  ) : null
                )}

                {/* ── SONGS SECTION ── */}
                {(activeFilter === 'All' || activeFilter === 'Songs') && (
                  songs.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#7A3CFF] flex items-center gap-2">
                        <Sparkles className="h-4 w-4" /> Songs ({songs.length})
                      </h4>
                      <div className="space-y-1.5">
                        {songs.slice(0, activeFilter === 'Songs' ? 50 : 10).map((song: any, idx: number) => (
                          <div
                            key={`${song.id}-${idx}`}
                            onClick={() => playTrack({
                              id: song.id,
                              title: song.title || 'Track',
                              artist: typeof song.artist === 'object' ? song.artist : { id: 'a', name: song.artist || 'Artist' },
                              coverUrl: song.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80',
                              durationMs: song.durationMs || song.duration_ms || 180000,
                              sourceType: 'youtube',
                              sourceId: song.sourceId,
                            })}
                            className="flex items-center justify-between p-3 rounded-xl bg-[#0E1117] border border-transparent hover:border-white/10 cursor-pointer transition-all group"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <span className="text-[11px] font-mono font-bold text-white/30 w-5 text-right">{idx + 1}</span>
                              <div className="relative">
                                <img
                                  src={song.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80'}
                                  alt=""
                                  className="h-11 w-11 rounded-lg object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                  <Play className="h-4 w-4 fill-white text-white" />
                                </div>
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-sm text-white group-hover:text-[#00D4FF] truncate transition-colors">{song.title}</div>
                                <div className="text-[11px] text-white/40 truncate mt-0.5">{getArtistName(song.artist)}{song.album?.name ? ` • ${song.album.name}` : ''}</div>
                              </div>
                            </div>
                            {song.isHQ && (
                              <span className="text-[9px] font-black text-[#00D4FF] bg-[#00D4FF]/10 px-2 py-0.5 rounded-full mr-2">HQ</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : activeFilter === 'Songs' ? (
                    <div className="text-white/40 text-sm py-6 text-center">No songs found matching &quot;{query}&quot;</div>
                  ) : null
                )}

                {/* ── ALBUMS SECTION ── */}
                {(activeFilter === 'All' || activeFilter === 'Albums') && (
                  apiAlbums.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#FF2D95] flex items-center gap-2">
                        <Disc className="h-4 w-4" /> Albums ({apiAlbums.length})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {apiAlbums.slice(0, activeFilter === 'Albums' ? 20 : 4).map((album: any) => (
                          <div
                            key={album.id}
                            onClick={() => router.push(`/albums/${album.id}`)}
                            className="p-3.5 rounded-2xl bg-[#0E1117] border border-white/8 hover:border-[#FF2D95]/30 cursor-pointer transition-all group space-y-3"
                          >
                            <div className="relative aspect-square rounded-xl overflow-hidden">
                              <img
                                src={album.coverUrl || album.images?.[0]?.url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80'}
                                alt={album.name || album.title}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="p-2.5 rounded-full bg-[#FF2D95] text-white shadow-[0_0_15px_#FF2D95]">
                                  <Play className="h-4 w-4 fill-white ml-0.5" />
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-xs text-white group-hover:text-[#FF2D95] truncate transition-colors">{album.name || album.title}</div>
                              <div className="text-[10px] text-white/40 truncate mt-0.5">
                                {album.artist?.name || album.artists?.[0]?.name || 'Album'}{album.releaseDate ? ` • ${album.releaseDate.substring(0, 4)}` : ''}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : activeFilter === 'Albums' ? (
                    <div className="text-white/40 text-sm py-6 text-center">No albums found matching &quot;{query}&quot;</div>
                  ) : null
                )}

                {/* ── PLAYLISTS SECTION ── */}
                {(activeFilter === 'All' || activeFilter === 'Playlists') && (
                  apiPlaylists.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#10B981] flex items-center gap-2">
                        <ListMusic className="h-4 w-4" /> Playlists ({apiPlaylists.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {apiPlaylists.slice(0, activeFilter === 'Playlists' ? 20 : 4).map((pl: any) => (
                          <div
                            key={pl.id}
                            onClick={() => router.push(`/playlists/${pl.id}`)}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-[#0E1117] border border-white/8 hover:border-[#10B981]/30 cursor-pointer transition-all group"
                          >
                            <img
                              src={pl.coverUrl || pl.images?.[0]?.url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80'}
                              alt={pl.name || pl.title}
                              className="h-14 w-14 rounded-xl object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-sm text-white group-hover:text-[#10B981] truncate transition-colors">{pl.name || pl.title}</div>
                              <div className="text-[11px] text-white/40 mt-0.5 truncate">{pl.description || pl.owner?.display_name || 'Curated playlist'}</div>
                              <div className="text-[10px] text-[#10B981] font-bold mt-1">{pl.tracks?.total ? `${pl.tracks.total} tracks` : 'Playlist'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : activeFilter === 'Playlists' ? (
                    <div className="text-white/40 text-sm py-6 text-center">No playlists found matching &quot;{query}&quot;</div>
                  ) : null
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      ) : (
        /* ── BROWSE / EMPTY STATE ── */
        <div className="space-y-10 max-w-6xl mx-auto">

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/60 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSearch(term)}
                    className="px-4 py-2 rounded-full bg-[#0E1117] border border-white/10 text-sm text-white/70 hover:text-white hover:border-white/20 transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/60 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Trending Now
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {trendingSearches.map((term, idx) => (
                <button
                  key={term}
                  onClick={() => handleSearch(term)}
                  className="flex items-center gap-3.5 px-4 py-3 rounded-xl bg-[#0E1117] border border-white/8 hover:border-white/15 text-left transition-all group"
                >
                  <span className="text-xs font-mono font-black text-white/25 w-5">{idx + 1}</span>
                  <span className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">{term}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-white/20 ml-auto group-hover:text-[#00D4FF] group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>

          {/* Browse Categories */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/60 flex items-center gap-2">
              <Flame className="h-4 w-4" /> Browse Categories
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {genreCards.map((genre) => (
                <div
                  key={genre.title}
                  onClick={() => handleSearch(genre.title)}
                  className={`relative h-36 rounded-2xl overflow-hidden p-5 cursor-pointer group border border-white/8 shadow-lg bg-gradient-to-br ${genre.color}`}
                >
                  <img src={genre.bg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25 group-hover:scale-110 transition-transform duration-500" />
                  <div className="relative z-10">
                    <div className="text-2xl mb-2">{genre.icon}</div>
                    <div className="font-black text-base text-white tracking-tight leading-snug">{genre.title}</div>
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-white/50 animate-pulse">Loading Search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
