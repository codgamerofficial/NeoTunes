'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { MusicSearchService, NormalizedSearchResult } from '@/services/MusicSearchService';
import { Track, Artist, Album, Playlist, getArtistName } from '@/types';
import { resolveArtwork } from '@/utils/artwork';
import { Artwork } from '@/components/ui/Artwork';
import { NeoCard } from '@/components/ui/NeoCard';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoTrackRow } from '@/components/ui/NeoTrackRow';
import { NeoSkeleton } from '@/components/ui/NeoSkeleton';
import { NeoEmptyState } from '@/components/ui/NeoEmptyState';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import {
  Search as SearchIcon, 
  Play, 
  Sparkles, 
  X, 
  History, 
  Compass, 
  TrendingUp, 
  Command,
  Disc3,
  User,
  ListMusic
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const POPULAR_SEARCHES = [
  'Arijit Singh', 'Kesariya', 'Diljit Dosanjh', 'The Weeknd',
  'Bengali Songs', 'Anupam Roy', 'Lo-Fi Chill Beats', 'Punjabi Hype', 'Bollywood Top 50'
];

const DISCOVER_GENRES = [
  { name: 'Bollywood Hits', genre: 'Hindi Cinema', color: '#DFFF00', query: 'Arijit Singh Pritam Hits' },
  { name: 'Punjabi Hype', genre: 'Punjabi Pop', color: '#00E5FF', query: 'Diljit Dosanjh Karan Aujla' },
  { name: 'Bengali Melodies', genre: 'Bengali Folk & Rock', color: '#DFFF00', query: 'Anupam Roy Bengali Hits' },
  { name: 'Global Pop', genre: 'International Hits', color: '#00E5FF', query: 'Global Pop Top Hits' },
  { name: 'Lo-Fi Chill', genre: 'Ambient Lofi', color: '#DFFF00', query: 'Lo-Fi Chill Beats' },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const inputRef = useRef<HTMLInputElement>(null);

  const { playTrack, addToQueue, currentTrack } = usePlaybackStore();
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Songs' | 'Artists' | 'Albums' | 'Playlists'>('All');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<NormalizedSearchResult>({
    topResult: null,
    songs: [],
    artists: [],
    albums: [],
    playlists: [],
  });
  const abortControllerRef = useRef<AbortController | null>(null);

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

  const executeSearch = async (searchQuery: string) => {
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
        signal: controller.signal,
      });

      setResults(res);
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
        executeSearch(query);
      } else {
        setResults({ topResult: null, songs: [], artists: [], albums: [], playlists: [] });
        setIsLoading(false);
      }
    }, 280);

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

  const filters = ['All', 'Songs', 'Artists', 'Albums', 'Playlists'] as const;

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
    <div className="p-4 sm:p-6 md:p-10 space-y-6 text-[#F5F7FA] font-sans select-none max-w-5xl mx-auto min-h-screen pb-44 md:pb-28">
      
      {/* Search Bar */}
      <div className="space-y-4 max-w-2xl mx-auto pt-1">
        <div className="relative flex items-center bg-[#11141A] border border-white/10 focus-within:border-[#DFFF00]/50 rounded-2xl px-4 py-3.5 shadow-xl transition-all">
          <SearchIcon className="h-5 w-5 text-[#9AA1AD] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search songs, artists, albums, playlists..."
            className="w-full bg-transparent text-white placeholder-[#9AA1AD] text-sm sm:text-base font-medium outline-none"
            autoFocus
          />
          {query ? (
            <button
              onClick={() => handleQueryChange('')}
              className="p-1.5 rounded-full text-[#9AA1AD] hover:text-white transition-all cursor-pointer"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-sans font-semibold bg-white/10 rounded text-[#9AA1AD]">
              <Command className="h-3 w-3" /> K
            </kbd>
          )}
        </div>
      </div>

      {/* When NO query: Recent, Popular, and Discover */}
      {!query.trim() && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-[#9AA1AD] uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-[#DFFF00]" /> Recent Searches
                </h3>
                <button
                  onClick={clearAllRecent}
                  className="text-xs font-medium text-[#9AA1AD] hover:text-white transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-1">
                {recentSearches.map((term) => (
                  <div
                    key={term}
                    onClick={() => handleQueryChange(term)}
                    className="h-10 px-3.5 rounded-xl bg-[#11141A] border border-white/5 hover:border-white/15 text-xs font-medium text-white flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <History className="w-3.5 h-3.5 text-[#9AA1AD] shrink-0" />
                      <span className="truncate">{term}</span>
                    </div>
                    <button
                      onClick={(e) => removeRecentSearch(term, e)}
                      className="p-1 rounded-full text-[#9AA1AD] hover:text-white transition-colors"
                      aria-label={`Remove ${term}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-[#9AA1AD] uppercase tracking-wider flex items-center gap-1.5 px-1">
              <TrendingUp className="h-3.5 w-3.5 text-[#DFFF00]" /> Trending Searches
            </span>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleQueryChange(topic)}
                  className="px-3.5 py-1.5 rounded-full bg-[#11141A] hover:bg-[#171A21] border border-white/5 hover:border-[#DFFF00]/30 text-xs font-medium text-[#F5F7FA] hover:text-white transition-all cursor-pointer"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Discover Music Dimensions */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-[#9AA1AD] uppercase tracking-wider flex items-center gap-1.5 px-1">
              <Compass className="h-4 w-4 text-[#00E5FF]" /> Discover by Genre
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {DISCOVER_GENRES.map((dim) => (
                <NeoCard
                  key={dim.name}
                  interactive
                  onClick={() => handleQueryChange(dim.query)}
                  className="p-3.5 cursor-pointer group space-y-1"
                >
                  <h4 className="text-xs font-bold text-white group-hover:text-[#DFFF00] transition-colors">
                    {dim.name}
                  </h4>
                  <p className="text-[11px] text-[#9AA1AD] truncate">{dim.genre}</p>
                </NeoCard>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category Filter Chips when Query Active */}
      {query.trim() && (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 max-w-2xl mx-auto min-h-[40px]">
          {filters.map((filter) => {
            const isSelected = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#DFFF00] text-black font-bold shadow-sm'
                    : 'bg-[#11141A] text-[#9AA1AD] hover:text-white border border-white/5 hover:border-white/15'
                }`}
              >
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                <span>{filter}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Results Container */}
      <div className="space-y-6 max-w-2xl mx-auto">
        {isLoading ? (
          <NeoSkeleton variant="track" count={6} />
        ) : hasNoResults ? (
          <NeoEmptyState
            icon={SearchIcon}
            title={`No results for "${query}"`}
            description="Check your spelling, search for a different artist or song, or clear your query."
            actionLabel="Clear Search"
            onAction={() => handleQueryChange('')}
          />
        ) : (
          <div className="space-y-6">
            {/* 1. Top Result Card */}
            {(activeFilter === 'All' || activeFilter === 'Artists') && topResult && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#DFFF00] uppercase tracking-wider px-1">
                  Top Result
                </span>

                <NeoCard
                  interactive
                  onClick={() => {
                    if (topResult.type === 'artist') {
                      router.push(`/artist/${topResult.data.canonicalId || topResult.data.id}`);
                    } else if (topResult.type === 'album') {
                      router.push(`/album/${topResult.data.canonicalId || topResult.data.id}`);
                    } else if (topResult.type === 'song') {
                      playTrack(topResult.data as Track);
                    } else if (topResult.type === 'playlist') {
                      router.push(`/playlist/${topResult.data.canonicalId || topResult.data.id}`);
                    }
                  }}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <Artwork
                      source={resolveArtwork(topResult.data)}
                      size="medium"
                      canonicalId={topResult.data.id}
                      aspectRatio={topResult.type === 'artist' ? 'circle' : 'square'}
                      className="h-16 w-16 rounded-2xl object-cover border border-white/10 shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-white group-hover:text-[#DFFF00] truncate transition-colors">
                        {(topResult.data as any).title || (topResult.data as any).name}
                      </h3>
                      <p className="text-xs text-[#9AA1AD] truncate mt-0.5 font-medium">
                        {topResult.type.toUpperCase()} • {getArtistName((topResult.data as any).artists || (topResult.data as any).artist || '')}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-full bg-[#DFFF00] text-black shadow-md hover:scale-105 transition-transform shrink-0">
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                  </div>
                </NeoCard>
              </div>
            )}

            {/* 2. Songs Result List */}
            {(activeFilter === 'All' || activeFilter === 'Songs') && songs.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Songs ({songs.length})
                  </span>
                </div>

                <div className="space-y-1">
                  {songs.map((song, idx) => (
                    <NeoTrackRow
                      key={song.id}
                      track={song}
                      index={idx}
                      showIndex={false}
                      playlistContext={songs}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 3. Artists Result Grid */}
            {(activeFilter === 'All' || activeFilter === 'Artists') && artists.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider px-1">
                  Artists ({artists.length})
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {artists.map((artist) => (
                    <NeoCard
                      key={artist.id}
                      interactive
                      onClick={() => router.push(`/artist/${artist.canonicalId || artist.id}`)}
                      className="p-3.5 flex flex-col items-center text-center space-y-2.5 group"
                    >
                      <Artwork
                        source={artist.imageUrl || artist.avatarUrl}
                        size="medium"
                        aspectRatio="circle"
                        alt={artist.name}
                        className="h-20 w-20 rounded-full object-cover border border-white/10 group-hover:scale-105 transition-transform"
                      />
                      <div className="w-full">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-[#DFFF00] transition-colors">
                          {artist.name}
                        </h4>
                        <span className="text-[10px] text-[#9AA1AD] font-medium">Artist</span>
                      </div>
                    </NeoCard>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Albums Result Grid */}
            {(activeFilter === 'All' || activeFilter === 'Albums') && albums.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider px-1">
                  Albums ({albums.length})
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {albums.map((album) => (
                    <NeoCard
                      key={album.id}
                      interactive
                      onClick={() => router.push(`/album/${album.canonicalId || album.id}`)}
                      className="p-3 space-y-2 group"
                    >
                      <Artwork
                        source={album.artworkUrl || album.coverUrl}
                        size="medium"
                        alt={album.title || album.name}
                        className="w-full aspect-square rounded-xl object-cover border border-white/10 group-hover:scale-105 transition-transform"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-[#DFFF00] transition-colors">
                          {album.title || album.name}
                        </h4>
                        <p className="text-[11px] text-[#9AA1AD] truncate mt-0.5">
                          {album.artistName || 'Album'}
                        </p>
                      </div>
                    </NeoCard>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Playlists Result Grid */}
            {(activeFilter === 'All' || activeFilter === 'Playlists') && playlists.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider px-1">
                  Playlists ({playlists.length})
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {playlists.map((playlist) => (
                    <NeoCard
                      key={playlist.id}
                      interactive
                      onClick={() => router.push(`/playlist/${playlist.canonicalId || playlist.id}`)}
                      className="p-3 space-y-2 group"
                    >
                      <Artwork
                        source={playlist.artworkUrl || playlist.coverUrl}
                        size="medium"
                        alt={playlist.name}
                        className="w-full aspect-square rounded-xl object-cover border border-white/10 group-hover:scale-105 transition-transform"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-[#DFFF00] transition-colors">
                          {playlist.name}
                        </h4>
                        <p className="text-[11px] text-[#9AA1AD] truncate mt-0.5">
                          {playlist.owner ? `By ${playlist.owner}` : 'Playlist'}
                        </p>
                      </div>
                    </NeoCard>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

export default function SearchPage() {
  return (
    <FeatureErrorBoundary featureName="Search">
      <Suspense fallback={<NeoSkeleton variant="track" count={6} className="p-6" />}>
        <SearchContent />
      </Suspense>
    </FeatureErrorBoundary>
  );
}
