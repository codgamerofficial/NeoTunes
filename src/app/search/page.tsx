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
import { NeoTabs, TabItem } from '@/components/ui/NeoTabs';
import { NeoSection } from '@/components/ui/NeoSection';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import {
  Search as SearchIcon, 
  Play, 
  Sparkles, 
  X, 
  History, 
  Compass, 
  TrendingUp, 
  Disc3, 
  User, 
  ListMusic
} from 'lucide-react';

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
        setRecentSearches(JSON.parse(stored).slice(0, 6));
      }
    } catch {}
  }, []);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const updated = [trimmed, ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 6);
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

  const performSearch = React.useCallback(async (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setResults({ topResult: null, songs: [], artists: [], albums: [], playlists: [] });
      setIsLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    try {
      const searchData = await MusicSearchService.searchAll(trimmed);
      setResults(searchData);
      saveRecentSearch(trimmed);
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error('Search query failed:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setResults({ topResult: null, songs: [], artists: [], albums: [], playlists: [] });
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Sync initial query from URL
  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
  }, [initialQuery, query, performSearch]);

  const hasResults =
    results.topResult ||
    results.songs.length > 0 ||
    results.artists.length > 0 ||
    results.albums.length > 0 ||
    results.playlists.length > 0;

  const searchTabs: TabItem<'All' | 'Songs' | 'Artists' | 'Albums' | 'Playlists'>[] = [
    { id: 'All', label: 'All Results' },
    { id: 'Songs', label: 'Songs', count: results.songs.length },
    { id: 'Artists', label: 'Artists', count: results.artists.length },
    { id: 'Albums', label: 'Albums', count: results.albums.length },
    { id: 'Playlists', label: 'Playlists', count: results.playlists.length },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-6xl mx-auto min-h-screen text-[#F5F7FA] font-sans select-none pb-44 md:pb-28">
      
      {/* ── 1. LARGE GLASS SEARCH INPUT BAR ── */}
      <div className="relative z-20 max-w-2xl mx-auto">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-4 h-5 w-5 text-[#DFFF00] pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tracks, artists, albums, or moods..."
            className="w-full pl-12 pr-12 py-3.5 rounded-full bg-[#11141A]/90 backdrop-blur-2xl border border-white/10 focus:border-[#DFFF00] focus:ring-2 focus:ring-[#DFFF00]/30 text-white placeholder-[#9AA1AD] text-sm sm:text-base font-medium outline-none transition-all shadow-xl"
            autoFocus
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="absolute right-4 p-1.5 rounded-full hover:bg-white/10 text-[#9AA1AD] hover:text-white transition-all cursor-pointer"
              aria-label="Clear search input"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── 2. FILTER TABS (When Query Active) ── */}
      {query.trim().length > 0 && hasResults && (
        <div className="flex justify-center">
          <NeoTabs
            tabs={searchTabs}
            activeTab={activeFilter}
            onChange={setActiveFilter}
            variant="segmented"
          />
        </div>
      )}

      {/* ── 3. LOADING SKELETON STATE ── */}
      {isLoading && (
        <div className="space-y-6 pt-4">
          <NeoSkeleton variant="hero" />
          <NeoSkeleton variant="track" count={5} />
        </div>
      )}

      {/* ── 4. EMPTY SEARCH STATE (No Query) ── */}
      {!query.trim() && !isLoading && (
        <div className="space-y-8 pt-2">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#9AA1AD] flex items-center gap-2">
                  <History className="h-4 w-4 text-[#DFFF00]" /> Recent Searches
                </h3>
                <button
                  onClick={clearAllRecent}
                  className="text-xs font-semibold text-[#9AA1AD] hover:text-red-400 transition-colors cursor-pointer"
                >
                  Clear all
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term);
                      performSearch(term);
                    }}
                    className="group px-3.5 py-1.5 rounded-full bg-[#11141A] border border-white/5 hover:border-white/20 text-xs font-semibold text-white/80 hover:text-white flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span>{term}</span>
                    <span
                      onClick={(e) => removeRecentSearch(term, e)}
                      className="text-[#9AA1AD] hover:text-red-400 p-0.5 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#9AA1AD] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#DFFF00]" /> Trending Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setQuery(item);
                    performSearch(item);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-[#DFFF00]/40 text-xs font-semibold text-[#9AA1AD] hover:text-white transition-all cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Genre Explorer */}
          <div className="space-y-3">
            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#9AA1AD] flex items-center gap-2">
              <Compass className="h-4 w-4 text-[#00E5FF]" /> Browse Genres
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {DISCOVER_GENRES.map((g) => (
                <NeoCard
                  key={g.name}
                  interactive
                  onClick={() => {
                    setQuery(g.query);
                    performSearch(g.query);
                  }}
                  className="p-4 cursor-pointer hover:border-[#00E5FF]/40 transition-all flex flex-col justify-between min-h-[100px]"
                >
                  <span className="text-xs font-extrabold text-white group-hover:text-[#00E5FF]">
                    {g.name}
                  </span>
                  <span className="text-[11px] text-[#9AA1AD]">{g.genre}</span>
                </NeoCard>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 5. NO MATCHES FOUND STATE ── */}
      {query.trim().length > 0 && !isLoading && !hasResults && (
        <NeoEmptyState
          icon={SearchIcon}
          title="No matches in NeoTunes"
          description={`We couldn't find any results for "${query}". Check your spelling or try searching for another artist, song, or genre.`}
          actionText="Explore Browse"
          onAction={() => router.push('/browse')}
        />
      )}

      {/* ── 6. SEARCH RESULTS PRESENTATION ── */}
      {query.trim().length > 0 && !isLoading && hasResults && (
        <div className="space-y-8">
          
          {/* TOP RESULT CARD & TRACKS COLUMN (When Filter is 'All') */}
          {activeFilter === 'All' && results.topResult && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {(() => {
                const topTrack: Track | null = results.topResult?.type === 'song' 
                  ? (results.topResult.data as Track) 
                  : results.songs[0] || null;

                if (!topTrack) return null;

                return (
                  <div className="lg:col-span-5 space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#9AA1AD]">
                      Top Result
                    </h3>
                    <NeoCard
                      interactive
                      onClick={() => playTrack(topTrack)}
                      className="p-5 sm:p-6 space-y-4 group relative overflow-hidden bg-gradient-to-b from-[#171A21] to-[#11141A] border-white/10"
                    >
                      <Artwork
                        source={resolveArtwork(topTrack)}
                        size="large"
                        canonicalId={topTrack.id}
                        type="track"
                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border border-white/10 shadow-xl group-hover:scale-105 transition-transform"
                      />

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#DFFF00]/15 text-[#DFFF00] border border-[#DFFF00]/30 inline-block mb-1">
                          SONG
                        </span>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight group-hover:text-[#DFFF00] transition-colors truncate">
                          {topTrack.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-[#9AA1AD] font-semibold">
                          {getArtistName(topTrack.artists || topTrack.artist)}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center gap-3">
                        <NeoButton
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            playTrack(topTrack);
                          }}
                        >
                          <Play className="h-4 w-4 fill-black ml-0.5" /> Play
                        </NeoButton>
                      </div>
                    </NeoCard>
                  </div>
                );
              })()}

              {/* Top Songs Column */}
              <div className="lg:col-span-7 space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#9AA1AD]">
                  Songs
                </h3>
                <div className="space-y-1">
                  {results.songs.slice(0, 4).map((song, idx) => (
                    <NeoTrackRow
                      key={`${song.id}_${idx}`}
                      track={song}
                      index={idx}
                      showIndex={false}
                      playlistContext={results.songs}
                    />
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* SONGS LIST (When Filter is 'All' or 'Songs') */}
          {(activeFilter === 'All' || activeFilter === 'Songs') && results.songs.length > 0 && (
            <NeoSection
              title="Songs"
              actionText={activeFilter === 'All' ? 'See all songs' : undefined}
              onAction={() => setActiveFilter('Songs')}
            >
              <div className="space-y-1">
                {(activeFilter === 'Songs' ? results.songs : results.songs.slice(0, 8)).map((song, idx) => (
                  <NeoTrackRow
                    key={`${song.id}_${idx}`}
                    track={song}
                    index={idx}
                    showIndex={true}
                    playlistContext={results.songs}
                  />
                ))}
              </div>
            </NeoSection>
          )}

          {/* ARTISTS GRID */}
          {(activeFilter === 'All' || activeFilter === 'Artists') && results.artists.length > 0 && (
            <NeoSection
              title="Artists"
              actionText={activeFilter === 'All' ? 'See all artists' : undefined}
              onAction={() => setActiveFilter('Artists')}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {results.artists.map((art, idx) => (
                  <NeoCard
                    key={`${art.id}_${idx}`}
                    interactive
                    onClick={() => router.push(`/artist/${encodeURIComponent(art.name || art.id)}`)}
                    className="p-4 text-center space-y-3 group cursor-pointer"
                  >
                    <Artwork
                      source={art.imageUrl || art.avatarUrl}
                      size="medium"
                      aspectRatio="circle"
                      alt={art.name}
                      type="artist"
                      className="w-24 h-24 mx-auto rounded-full object-cover border border-white/10 shadow-lg group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-[#DFFF00] transition-colors">
                        {art.name}
                      </h4>
                      <p className="text-[11px] text-[#9AA1AD] mt-0.5">Artist</p>
                    </div>
                  </NeoCard>
                ))}
              </div>
            </NeoSection>
          )}

          {/* ALBUMS GRID */}
          {(activeFilter === 'All' || activeFilter === 'Albums') && results.albums.length > 0 && (
            <NeoSection
              title="Albums"
              actionText={activeFilter === 'All' ? 'See all albums' : undefined}
              onAction={() => setActiveFilter('Albums')}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {results.albums.map((alb, idx) => (
                  <NeoCard
                    key={`${alb.id}_${idx}`}
                    interactive
                    onClick={() => router.push(`/album/${encodeURIComponent(alb.title || alb.name || alb.id)}`)}
                    className="p-3 space-y-2.5 group cursor-pointer"
                  >
                    <Artwork
                      source={resolveArtwork(alb)}
                      size="medium"
                      canonicalId={alb.id}
                      type="album"
                      className="w-full aspect-square rounded-xl object-cover border border-white/10 shadow-md group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-[#DFFF00] transition-colors">
                        {alb.title || alb.name}
                      </h4>
                      <p className="text-[11px] text-[#9AA1AD] truncate mt-0.5">
                        {alb.artistName || (Array.isArray(alb.artists) ? alb.artists.join(', ') : 'Album')}
                      </p>
                    </div>
                  </NeoCard>
                ))}
              </div>
            </NeoSection>
          )}

          {/* PLAYLISTS GRID */}
          {(activeFilter === 'All' || activeFilter === 'Playlists') && results.playlists.length > 0 && (
            <NeoSection
              title="Playlists"
              actionText={activeFilter === 'All' ? 'See all playlists' : undefined}
              onAction={() => setActiveFilter('Playlists')}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {results.playlists.map((pl, idx) => (
                  <NeoCard
                    key={`${pl.id}_${idx}`}
                    interactive
                    onClick={() => router.push(`/playlist/${encodeURIComponent(pl.name || pl.id)}`)}
                    className="p-3 space-y-2.5 group cursor-pointer"
                  >
                    <Artwork
                      source={resolveArtwork(pl)}
                      size="medium"
                      canonicalId={pl.id}
                      type="playlist"
                      className="w-full aspect-square rounded-xl object-cover border border-white/10 shadow-md group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-[#DFFF00] transition-colors">
                        {pl.name}
                      </h4>
                      <p className="text-[11px] text-[#9AA1AD] truncate mt-0.5">
                        By {pl.owner || 'NeoTunes'}
                      </p>
                    </div>
                  </NeoCard>
                ))}
              </div>
            </NeoSection>
          )}

        </div>
      )}

    </div>
  );
}

export default function SearchPage() {
  return (
    <FeatureErrorBoundary featureName="Search">
      <Suspense fallback={<div className="p-8 text-center text-xs text-[#9AA1AD] animate-pulse">Loading Search...</div>}>
        <SearchContent />
      </Suspense>
    </FeatureErrorBoundary>
  );
}
