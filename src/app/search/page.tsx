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
  Radio,
  User,
  Disc3,
  Layers,
  ChevronRight,
  Brain,
  Volume2,
} from 'lucide-react';

interface UnifiedSearchTrack {
  id: string;
  title: string;
  artist: { id?: string; name: string; avatarUrl?: string };
  album?: { id?: string; name: string; coverUrl?: string; releaseDate?: string };
  durationMs: number;
  popularity?: number;
  coverUrl: string;
  sourceType: 'youtube' | 'cloud';
  sourceId?: string;
  explicit?: boolean;
  score?: number;
  isHQ?: boolean;
  views?: string;
  matchDetails?: {
    reason?: string;
    matchedGenre?: string;
    matchedLanguage?: string;
    matchedLyrics?: string;
  };
}

interface TopArtist {
  id: string;
  name: string;
  coverUrl: string;
  followers: number;
  popularity: number;
  genres: string[];
  verified: boolean;
}

interface GroupedSearchResults {
  topArtist: TopArtist | null;
  artists: TopArtist[];
  songs: UnifiedSearchTrack[];
  albums: any[];
  playlists: any[];
  videos: UnifiedSearchTrack[];
  podcasts: UnifiedSearchTrack[];
  covers: UnifiedSearchTrack[];
  live: UnifiedSearchTrack[];
  didYouMean: boolean;
  correctedQuery: string;
  suggestedArtists?: TopArtist[];
  suggestedSongs?: UnifiedSearchTrack[];
}

type FilterCategory = 'All' | 'Songs' | 'Artists' | 'Albums' | 'Playlists' | 'Videos' | 'Podcasts' | 'Radio';
type SortOption = 'relevance' | 'popularity' | 'newest' | 'alphabetical' | 'duration';

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

// Framer Motion Staggered Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, damping: 25, stiffness: 350 },
  },
};

function SearchContent() {
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

  const { currentTrack, isPlaying, isLoadingStream, playTrack, setPlaying, prefetchStream } = usePlaybackStore();

  // Debounce search input (150ms)
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
        showToast('Listening... Speak now!');
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
    } catch {
      setIsListening(false);
      showToast('Voice Search error');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Grouped AI Search Engine Query
  const { data: searchResults, isLoading } = useQuery<GroupedSearchResults>({
    queryKey: ['grouped-ai-search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) {
        return {
          topArtist: null,
          artists: [],
          songs: [],
          albums: [],
          playlists: [],
          videos: [],
          podcasts: [],
          covers: [],
          live: [],
          didYouMean: false,
          correctedQuery: '',
        };
      }
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    },
    enabled: !!debouncedQuery.trim(),
    staleTime: 1000 * 60 * 5,
  });

  const songsList: UnifiedSearchTrack[] = [
    ...(searchResults?.songs || []),
    ...(searchResults?.videos || []),
    ...(searchResults?.covers || []),
    ...(searchResults?.live || []),
  ];

  // Sort Songs
  const sortedSongs = [...songsList].sort((a, b) => {
    if (sortBy === 'duration') return b.durationMs - a.durationMs;
    if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
    if (sortBy === 'popularity') return (b.popularity || 0) - (a.popularity || 0);
    return (b.score || 0) - (a.score || 0);
  });

  const topResult = sortedSongs.length > 0 ? sortedSongs[0] : null;
  const topArtist = searchResults?.topArtist || (searchResults?.artists?.length ? searchResults.artists[0] : null);

  // Background stream prefetch for top 3 visible items
  useEffect(() => {
    if (sortedSongs.length > 0) {
      sortedSongs.slice(0, 3).forEach((track) => {
        prefetchStream(track);
      });
    }
  }, [sortedSongs, prefetchStream]);

  const cleanTitle = (title: string) => {
    if (!title) return 'NeoTunes Track';
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
    playTrack(track, sortedSongs);
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-6 md:space-y-8 bg-[#0B0E14] min-h-screen text-white font-sans select-none pb-40">
      
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] rounded-full bg-[#161B26]/95 border border-[#00D6FF]/40 px-6 py-2.5 text-xs font-bold text-white shadow-[0_10px_30px_rgba(0,214,255,0.2)] flex items-center gap-2 backdrop-blur-xl"
          >
            <Sparkles className="h-4 w-4 text-[#00D6FF] animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. UNIVERSAL LIVE SEARCH BAR WITH REAL VOICE SEARCH */}
      <div className="space-y-4 max-w-4xl mx-auto">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-4 h-5 w-5 text-[#B3B3B3]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, artists, lyrics, mood, or speak..."
            className={`w-full bg-[#141822]/90 border rounded-full pl-12 pr-24 py-4 text-sm font-semibold text-white placeholder-[#B3B3B3] outline-none transition-all shadow-[0_4px_20px_rgba(0,0,0,0.4)] ${
              isListening ? 'border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'border-white/10 focus:border-[#00D6FF] focus:shadow-[0_0_25px_rgba(0,214,255,0.2)]'
            }`}
            autoFocus
          />

          {/* Voice Search & Clear Action */}
          <div className="absolute right-4 flex items-center gap-2">
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-[#B3B3B3] hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                title="Clear input"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={startVoiceSearch}
              className={`p-2 rounded-full transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-lg'
                  : 'bg-white/10 text-[#00D6FF] hover:bg-[#00D6FF] hover:text-black'
              }`}
              title="Voice Search"
            >
              <Mic className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Listening Active Banner */}
        {isListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono animate-pulse"
          >
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span>Listening to your voice... Speak now!</span>
          </motion.div>
        )}

        {/* AI Thinking Status Bar */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#00D6FF]/10 border border-[#00D6FF]/30 text-[#00D6FF] text-xs font-mono font-bold w-max shadow-sm"
          >
            <Brain className="h-4 w-4 animate-spin text-[#00D6FF]" />
            <span>NeoTunes AI Synthesizing 450+ Connected Music Sources...</span>
          </motion.div>
        )}

        {/* Sticky Category Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            {(['All', 'Songs', 'Artists', 'Albums', 'Playlists', 'Videos', 'Podcasts', 'Radio'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all flex-shrink-0 ${
                  activeFilter === cat
                    ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-105'
                    : 'bg-[#141822] hover:bg-[#1E2433] text-[#B3B3B3] hover:text-white border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs text-[#B3B3B3]">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#00D6FF]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-[#141822] border border-white/10 text-white text-xs font-semibold rounded-full px-3 py-1.5 outline-none cursor-pointer hover:border-[#00D6FF]/50 transition-colors"
            >
              <option value="relevance">AI Match Rank</option>
              <option value="popularity">Popularity</option>
              <option value="duration">Duration</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. INITIAL / EMPTY QUERY DISCOVERY STATE */}
      {!query.trim() ? (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-10 max-w-6xl mx-auto">
          
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <motion.div variants={itemVariants} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-[#B3B3B3] uppercase tracking-wider flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#00D6FF]" /> Recent Searches
                </h3>
                <button onClick={() => setRecentSearches([])} className="text-xs text-[#B3B3B3] hover:text-white transition-colors">
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {recentSearches.map((qStr, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSearch(qStr)}
                    className="px-4 py-2 rounded-full bg-[#141822] hover:bg-[#1E2433] border border-white/10 text-xs font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-2"
                  >
                    <span>{qStr}</span>
                    <ChevronRight className="h-3 w-3 text-[#B3B3B3]" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Trending Searches */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-[#B3B3B3] uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#00D6FF]" /> Trending Searches
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {INITIAL_TRENDING.map((qStr, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSearch(qStr)}
                  className="px-4 py-2 rounded-full bg-[#141822] hover:bg-[#1E2433] border border-white/10 text-xs font-semibold text-[#B3B3B3] hover:text-white transition-all hover:scale-105 active:scale-95"
                >
                  🔥 {qStr}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Browse Categories Grid */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#00D6FF]" /> Browse Categories
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {CATEGORIES.map((cat) => (
                <motion.div
                  key={cat.id}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectSearch(cat.title)}
                  className="relative h-36 rounded-2xl overflow-hidden cursor-pointer group shadow-xl border border-white/10 text-left"
                >
                  <ImageWithFallback src={cat.cover} alt={cat.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/40 to-transparent p-4 flex items-end">
                    <h3 className="text-base font-extrabold text-white group-hover:text-[#00D6FF] transition-colors">{cat.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : (

        /* 3. ACTIVE SEARCH RESULTS STATE WITH STAGGERED ANIMATIONS */
        <div className="max-w-6xl mx-auto space-y-10">
          {isLoading ? (
            /* Skeleton Loading State */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-[#141822]/60 border border-white/10 animate-pulse">
                    <div className="h-12 w-12 rounded-xl bg-white/10 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-3/4 bg-white/10 rounded" />
                      <div className="h-2.5 w-1/2 bg-white/5 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : sortedSongs.length === 0 && !topArtist ? (
            
            /* Smart Fallback State */
            <div className="text-center py-16 space-y-6">
              <div className="space-y-2">
                <Music className="h-12 w-12 mx-auto text-[#B3B3B3]" />
                <p className="text-lg font-bold text-white">No exact match found for &quot;{query}&quot;</p>
                <p className="text-xs text-[#B3B3B3]">Explore suggested playlists and trending music categories:</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
                {CATEGORIES.slice(0, 4).map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectSearch(cat.title)}
                    className="p-4 rounded-2xl bg-[#141822] hover:bg-[#1E2433] border border-white/10 cursor-pointer group transition-all"
                  >
                    <div className="relative h-28 w-full rounded-xl overflow-hidden mb-3">
                      <ImageWithFallback src={cat.cover} alt={cat.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#00D6FF]">{cat.title}</h4>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-10">
              
              {/* TOP RESULT & SONGS SECTION */}
              {(activeFilter === 'All' || activeFilter === 'Songs') && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* TOP RESULT HERO CARD */}
                  {topResult && (
                    <motion.div variants={itemVariants} className="space-y-3">
                      <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                        ⭐ Top Match
                      </h2>
                      <div
                        onClick={() => handleTrackClick(topResult)}
                        className={`p-6 rounded-3xl cursor-pointer transition-all border group space-y-5 relative overflow-hidden backdrop-blur-xl ${
                          currentTrack?.id === topResult.id
                            ? 'bg-[#161C2B] border-[#00D6FF]/60 shadow-[0_0_30px_rgba(0,214,255,0.25)]'
                            : 'bg-[#141822]/90 hover:bg-[#1B2232] border-white/10 hover:border-[#00D6FF]/40'
                        }`}
                      >
                        <div className="relative h-36 w-36 rounded-2xl overflow-hidden shadow-2xl border border-white/15">
                          <ImageWithFallback src={topResult.coverUrl} alt={topResult.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-[#00D6FF] bg-[#00D6FF]/10 px-2.5 py-0.5 rounded-full border border-[#00D6FF]/20 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" /> {topResult.score ? `${topResult.score}% AI Match` : 'Top Match'}
                            </span>
                            <span className="text-[10px] font-mono text-[#B3B3B3] uppercase bg-white/5 px-2 py-0.5 rounded">
                              {topResult.sourceType}
                            </span>
                          </div>

                          <h3 className="text-2xl font-black text-white group-hover:text-[#00D6FF] transition-colors truncate leading-tight">
                            {cleanTitle(topResult.title)}
                          </h3>
                          <p className="text-sm font-semibold text-[#B3B3B3]">{topResult.artist?.name || 'Artist'}</p>

                          {topResult.matchDetails?.reason && (
                            <p className="text-xs text-[#00D6FF]/80 italic pt-1 truncate">
                              &quot;{topResult.matchDetails.reason}&quot;
                            </p>
                          )}
                        </div>

                        {/* Floating Play Action Button */}
                        <button className="absolute bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-[#00D6FF] to-[#3B82F6] text-black flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95">
                          {currentTrack?.id === topResult.id && isLoadingStream ? (
                            <Loader2 className="h-6 w-6 animate-spin text-black" />
                          ) : currentTrack?.id === topResult.id && isPlaying ? (
                            <Pause className="h-6 w-6 fill-black" />
                          ) : (
                            <Play className="h-6 w-6 fill-black translate-x-0.5" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* SONGS LIST */}
                  <motion.div variants={itemVariants} className="lg:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                        🎵 Songs ({sortedSongs.length})
                      </h2>
                    </div>

                    <div className="space-y-1.5">
                      {sortedSongs.map((track, idx) => {
                        const isCurrent = currentTrack?.id === track.id;
                        return (
                          <motion.div
                            key={track.id + idx}
                            whileHover={{ x: 4 }}
                            onClick={() => handleTrackClick(track)}
                            className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer group transition-all border ${
                              isCurrent
                                ? 'bg-[#161C2B] text-[#00D6FF] border-[#00D6FF]/40 shadow-[0_0_15px_rgba(0,214,255,0.15)]'
                                : 'bg-[#141822]/60 hover:bg-[#19202E] text-white border-transparent hover:border-white/10'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {/* Index / Playing Equalizer / Loading Spinner */}
                              <span className="w-6 text-center text-xs font-mono text-[#B3B3B3] font-bold flex items-center justify-center">
                                {isCurrent ? (
                                  isLoadingStream ? (
                                    <Loader2 className="h-4 w-4 text-[#00D6FF] animate-spin" />
                                  ) : isPlaying ? (
                                    <span className="inline-flex items-end gap-[1.5px] h-3.5 w-5 justify-center">
                                      <span className="w-[2px] h-2 bg-[#00D6FF] rounded-full animate-bounce" />
                                      <span className="w-[2px] h-3.5 bg-[#3B82F6] rounded-full animate-bounce [animation-delay:0.15s]" />
                                      <span className="w-[2px] h-2.5 bg-[#8B5CF6] rounded-full animate-bounce [animation-delay:0.3s]" />
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
                              
                              <div className="relative h-11 w-11 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 shadow-md">
                                <ImageWithFallback src={track.coverUrl} alt={track.title} fill className="object-cover" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className={`text-xs md:text-sm font-bold truncate ${isCurrent ? 'text-[#00D6FF]' : 'text-white group-hover:text-[#00D6FF]'}`}>
                                  {track.title}
                                </p>
                                <p className="text-[11px] text-[#B3B3B3] truncate">
                                  {track.artist?.name || 'Artist'} {track.album?.name ? `• ${track.album.name}` : ''}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="hidden sm:inline-flex text-[10px] font-mono text-[#00D6FF] bg-[#00D6FF]/10 px-2.5 py-0.5 rounded-full border border-[#00D6FF]/20">
                                FLAC 24-bit
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); showToast('Saved to Liked Songs'); }}
                                className="text-[#B3B3B3] hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1.5"
                                title="Like Song"
                              >
                                <Heart className="h-4 w-4" />
                              </button>
                              <span className="text-xs font-mono text-[#B3B3B3]">
                                {formatTime(track.durationMs)}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                </div>
              )}

              {/* ARTISTS SECTION */}
              {topArtist && (activeFilter === 'All' || activeFilter === 'Artists') && (
                <motion.div variants={itemVariants} className="space-y-4">
                  <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                    🎤 Verified Artist
                  </h2>
                  <div 
                    onClick={() => handleSelectSearch(topArtist.name)}
                    className="p-5 rounded-3xl bg-[#141822]/80 border border-white/10 hover:border-[#00D6FF]/40 cursor-pointer flex items-center gap-5 group transition-all"
                  >
                    <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-[#00D6FF]/40 flex-shrink-0 shadow-xl">
                      <ImageWithFallback src={topArtist.coverUrl} alt={topArtist.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xl font-extrabold text-white group-hover:text-[#00D6FF] transition-colors">{topArtist.name}</h3>
                        <CheckCircle2 className="h-4 w-4 text-[#00D6FF] fill-[#00D6FF]/20" />
                      </div>
                      <p className="text-xs font-semibold text-[#B3B3B3]">
                        {topArtist.followers?.toLocaleString() || '1.4M'} Followers • Verified Artist
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="p-10 space-y-4 max-w-4xl mx-auto bg-[#0B0E14] text-white">
        <div className="h-14 w-full bg-[#141822] rounded-full animate-pulse" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
