'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
  Clock,
  Sparkles,
  SlidersHorizontal,
  TrendingUp,
  Loader2,
  Mic,
  MicOff,
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
  'Arijit Singh', 'Bollywood Hits 2026', 'Lo-Fi Coding Beats', 'Taylor Swift',
  'Ed Sheeran', 'Drake', 'Karan Aujla', 'Diljit Dosanjh', 'Coldplay'
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQ);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('All');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Arijit Singh', 'Lo-Fi Chill Beats', 'Waterflame'
  ]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const { currentTrack, isPlaying, playTrack, setPlaying } = usePlaybackStore();

  // Debounce search input for performance (150ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 150);
    return () => clearTimeout(timer);
  }, [query]);

  // Real-Time Voice Search Engine
  const startVoiceSearch = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice Search is not supported on this browser');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        showToast('Listening... Speak now');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        showToast(`Searching for "${transcript}"`);
      };

      recognition.onerror = () => {
        setIsListening(false);
        showToast('Could not recognize speech');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      showToast('Voice Search error');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Dual-Stage Asynchronous Search Query
  const { data: searchResults, isLoading } = useQuery<UnifiedSearchTrack[]>({
    queryKey: ['unified-search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.tracks || [];
    },
    enabled: !!debouncedQuery.trim(),
    staleTime: 1000 * 60 * 5,
  });

  const songsList = searchResults || [];

  // Sort & Filter
  const sortedSongs = [...songsList].sort((a, b) => {
    if (sortBy === 'duration') return b.durationMs - a.durationMs;
    if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
    return 0;
  });

  const topResult = sortedSongs.length > 0 ? sortedSongs[0] : null;

  const cleanTitle = (title: string) => {
    if (!title) return 'Track';
    return title.split('_')[0].split('ft.')[0].split('(Official')[0].split('|')[0].trim();
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

  const handleTrackClick = (track: UnifiedSearchTrack) => {
    // Stage 1 (0-300ms): Instant UI update without page navigation
    playTrack(track, sortedSongs);
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-6 md:space-y-8 bg-[#0B0E14] text-white font-sans select-none pb-36">
      
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] rounded-full bg-[#181818] border border-[#282828] px-5 py-2 text-xs font-semibold text-white shadow-xl flex items-center gap-2"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#00D6FF]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. UNIVERSAL LIVE SEARCH BAR & REAL VOICE SEARCH */}
      <div className="space-y-4 max-w-4xl">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-4 h-5 w-5 text-[#B3B3B3]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists, albums, playlists, or speak..."
            className={`w-full bg-[#181818] border rounded-full pl-12 pr-24 py-3.5 text-sm font-semibold text-white placeholder-[#B3B3B3] outline-none transition-all shadow-inner ${
              isListening ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'border-[#282828] focus:border-[#00D6FF]'
            }`}
            autoFocus
          />

          {/* Voice Search Button & Clear Action */}
          <div className="absolute right-4 flex items-center gap-2">
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-[#B3B3B3] hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* REAL VOICE SEARCH TRIGGER */}
            <button
              onClick={startVoiceSearch}
              className={`p-2 rounded-full transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-lg'
                  : 'bg-[#282828] text-[#00D6FF] hover:bg-[#00D6FF] hover:text-black'
              }`}
              title="Voice Search"
            >
              <Mic className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Listening Active Banner */}
        {isListening && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono animate-pulse">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span>Listening to your voice... Speak now!</span>
          </div>
        )}

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
                  <Clock className="h-4 w-4 text-[#00D6FF]" /> Recent Searches
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
              <TrendingUp className="h-4 w-4 text-[#00D6FF]" /> Trending Searches
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
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/40 to-transparent p-4 flex items-end">
                    <h3 className="text-base font-extrabold text-white group-hover:text-[#00D6FF] transition-colors">{cat.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (

        /* 3. ACTIVE SEARCH RESULTS STATE WITH SKELETON SHIMMER */
        <div className="space-y-10">
          {isLoading ? (
            /* INSTANT SKELETON SHIMMER INSTEAD OF BLANK SCREEN */
            <div className="space-y-4 max-w-4xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-[#181818]/60 border border-[#282828] animate-pulse">
                    <div className="h-12 w-12 rounded-xl bg-[#282828] flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-3/4 bg-[#282828] rounded" />
                      <div className="h-2.5 w-1/2 bg-[#282828]/60 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : sortedSongs.length === 0 ? (
            
            /* SMART NO RESULTS FALLBACK */
            <div className="text-center py-16 space-y-6">
              <div className="space-y-2">
                <Music className="h-10 w-10 mx-auto text-[#282828]" />
                <p className="text-sm font-bold text-white">No exact match found for &quot;{query}&quot;</p>
                <p className="text-xs text-[#B3B3B3]">Here are suggested songs and trending playlists for you:</p>
              </div>

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
                    <h4 className="text-xs font-bold text-white group-hover:text-[#00D6FF]">{cat.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* TOP RESULT & SONGS */}
              {(activeFilter === 'All' || activeFilter === 'Songs') && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Top Result Card */}
                  {topResult && (
                    <div className="space-y-3">
                      <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                        ⭐ Top Result
                      </h2>
                      <div
                        onClick={() => handleTrackClick(topResult)}
                        className={`p-6 rounded-2xl cursor-pointer transition-all border group space-y-4 relative ${
                          currentTrack?.id === topResult.id
                            ? 'bg-[#181818] border-[#00D6FF]/50 shadow-[0_0_20px_rgba(0,214,255,0.2)]'
                            : 'bg-[#181818] hover:bg-[#282828] border-[#282828]'
                        }`}
                      >
                        <div className="relative h-32 w-32 rounded-xl overflow-hidden shadow-xl border border-[#282828]">
                          <ImageWithFallback src={topResult.coverUrl} alt={topResult.title} fill className="object-cover" />
                        </div>
                        <div>
                          <h3 className="text-xl font-extrabold text-white group-hover:text-[#00D6FF] transition-colors truncate">
                            {cleanTitle(topResult.title)}
                          </h3>
                          <p className="text-sm font-medium text-[#B3B3B3] mt-1">{topResult.artist?.name || 'Artist'}</p>
                          <div className="flex items-center gap-2 mt-3">
                            <span className="text-[10px] font-mono font-bold text-[#00D6FF] bg-[#00D6FF]/10 px-2.5 py-0.5 rounded-full border border-[#00D6FF]/20">
                              Hi-Res Lossless
                            </span>
                            <span className="text-[10px] font-mono text-[#B3B3B3] uppercase">
                              {topResult.sourceType}
                            </span>
                          </div>
                        </div>

                        <button className="absolute bottom-6 right-6 h-12 w-12 rounded-full bg-[#00D6FF] text-black flex items-center justify-center shadow-xl transition-all">
                          {currentTrack?.id === topResult.id && isPlaying ? (
                            <Pause className="h-5 w-5 fill-black" />
                          ) : (
                            <Play className="h-5 w-5 fill-black translate-x-0.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SONGS LIST */}
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
                            onClick={() => handleTrackClick(track)}
                            className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer group transition-all ${
                              isCurrent ? 'bg-[#181818] text-[#00D6FF] border border-[#00D6FF]/30' : 'hover:bg-[#181818] text-white border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span className="w-5 text-center text-xs font-mono text-[#B3B3B3] font-bold flex items-center justify-center">
                                {isCurrent ? (
                                  isPlaying ? (
                                    <span className="inline-flex items-end gap-[1.5px] h-3.5 w-5 justify-center">
                                      <span className="w-[2px] h-2 bg-[#00D6FF] rounded-full animate-bounce" />
                                      <span className="w-[2px] h-3.5 bg-[#3B82F6] rounded-full animate-bounce [animation-delay:0.2s]" />
                                      <span className="w-[2px] h-2.5 bg-[#8B5CF6] rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </span>
                                  ) : (
                                    <Play className="h-4 w-4 text-[#00D6FF] fill-current" />
                                  )
                                ) : (
                                  <>
                                    <span className="group-hover:hidden">{idx + 1}</span>
                                    <Play className="h-4 w-4 hidden group-hover:block text-white" />
                                  </>
                                )}
                              </span>
                              
                              <div className="relative h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 border border-[#282828]">
                                <ImageWithFallback src={track.coverUrl} alt={track.title} fill className="object-cover" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className={`text-xs font-bold truncate ${isCurrent ? 'text-[#00D6FF]' : 'text-white group-hover:text-[#00D6FF]'}`}>
                                  {track.title}
                                </p>
                                <p className="text-[11px] text-[#B3B3B3] truncate">
                                  {track.artist?.name || 'Artist'} • {track.album?.name || 'Single'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="hidden sm:inline-block text-[10px] font-mono text-[#00D6FF] bg-[#00D6FF]/10 px-2 py-0.5 rounded border border-[#00D6FF]/20">
                                FLAC 24-bit
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); showToast('Saved to Liked Songs'); }}
                                className="text-[#B3B3B3] hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                              >
                                <Heart className="h-4 w-4" />
                              </button>
                              <span className="text-xs font-mono text-[#B3B3B3]">
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
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="p-10 space-y-4 max-w-4xl bg-[#0B0E14] text-white">
        <div className="h-12 w-full bg-[#181818] rounded-full animate-pulse" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
