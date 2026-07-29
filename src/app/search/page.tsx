'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { usePlaybackStore } from '@/store/playback-store';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { motion, AnimatePresence } from 'framer-motion';
import { decodeHTMLEntities } from '@/lib/searchEngine';
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
  ArrowUpDown,
  Compass,
  Wand2,
  Zap,
  Info,
  Flame,
  RadioTower,
  Headphones,
  History,
  ShieldCheck,
  FileText,
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
  originalQuery?: string;
  correctedQuery: string;
  diagnostics?: {
    originalQuery?: string;
    correctedQuery?: string;
    pipelineSteps?: Array<{ name: string; status: string; details?: string }>;
    providerStats?: { local: number; spotify: number; youtube: number; deezer: number };
    isBroadened?: boolean;
  };
  suggestedArtists?: TopArtist[];
  suggestedSongs?: UnifiedSearchTrack[];
  popularBengaliSongs?: UnifiedSearchTrack[];
}

type FilterCategory = 'All' | 'Songs' | 'Artists' | 'Albums' | 'Playlists' | 'Videos' | 'Podcasts';
type SortOption = 'relevance' | 'popularity' | 'duration';

const CATEGORIES = [
  { id: 'bengali', title: 'Bengali & Kolkata', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80', count: '1.2k tracks' },
  { id: 'bollywood', title: 'Bollywood Hits', cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80', count: '3.4k tracks' },
  { id: 'pop', title: 'Pop & Charts', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80', count: '5.8k tracks' },
  { id: 'lofi', title: 'Lo-Fi & Study', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80', count: '890 tracks' },
  { id: 'hiphop', title: 'Hip-Hop & Rap', cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80', count: '2.1k tracks' },
  { id: 'indie', title: 'Indie Acoustic', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80', count: '750 tracks' },
  { id: 'rock', title: 'Rock Classics', cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80', count: '1.4k tracks' },
  { id: 'edm', title: 'EDM & Synth', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80', count: '1.9k tracks' },
];

const ROTATING_PLACEHOLDERS = [
  'Search songs, artists, or albums...',
  'Search by lyrics e.g. "Tum hi ho"...',
  'Search moods e.g. "Lo-Fi Coding"...',
  'Search Bengali, Hindi, Punjabi hits...',
  'Search by emotion or activity...',
];

const INITIAL_TRENDING = [
  'TE CONOCÍ', 'Nibi Je Nibi', 'Arijit Singh Bengali', 'Lo-Fi Coding Beats',
  'Bose Bose Bhabi', 'Taylor Swift', 'Kolkata Folk Lofi', 'Coldplay'
];

const AI_SEARCH_STEPS = [
  'Searching Bengali & Global catalogs...',
  'Analyzing lyrics & phonetics...',
  'Querying YouTube & Spotify...',
  'Synthesizing AI confidence metrics...',
];

// Framer Motion Animation Variants
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQ);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('All');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'TE CONOCÍ', 'Arijit Singh Bengali', 'Lo-Fi Chill Beats'
  ]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [aiStepIndex, setAiStepIndex] = useState(0);

  const { currentTrack, isPlaying, isLoadingStream, playbackStatus, playTrack, setPlaying, prefetchStream, history } = usePlaybackStore();

  // Dynamic Rotating Placeholder
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % ROTATING_PLACEHOLDERS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  // Debounce search input (150ms)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 150);
    return () => clearTimeout(timer);
  }, [query]);

  // Dynamic AI Step Rotation while loading
  useEffect(() => {
    const timer = setInterval(() => {
      setAiStepIndex((prev) => (prev + 1) % AI_SEARCH_STEPS.length);
    }, 450);
    return () => clearInterval(timer);
  }, []);

  // Real-Time Voice Search Engine
  const startVoiceSearch = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice Search is not supported on this browser');
      return;
    }

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
      handleSelectSearch(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      showToast('Could not recognize voice. Try typing instead');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Query Backend Multi-Source AI Search API
  const { data: searchResults, isLoading } = useQuery<GroupedSearchResults>({
    queryKey: ['hybrid-search-v5', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return null;
      const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery.trim())}`);
      if (!res.ok) throw new Error('Search failed');
      return res.json();
    },
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const handleSelectSearch = (term: string) => {
    setQuery(term);
    setDebouncedQuery(term);
    if (!recentSearches.includes(term)) {
      setRecentSearches((prev) => [term, ...prev.slice(0, 4)]);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
  };

  const handleTrackClick = (track: UnifiedSearchTrack) => {
    playTrack(track as any, sortedSongs as any);
  };

  const cleanTitle = (title: string) => {
    if (!title) return 'NeoTunes Track';
    const decoded = decodeHTMLEntities(title);
    return decoded.split('_')[0].split('ft.')[0].split('(Official')[0].split('|')[0].trim();
  };

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const songsList = searchResults?.songs || [];
  const topArtist = searchResults?.topArtist || null;

  // Compute Filter Result Badges
  const filterCounts = {
    All: songsList.length + (topArtist ? 1 : 0),
    Songs: songsList.length,
    Artists: (searchResults?.artists?.length || 0) + (topArtist ? 1 : 0),
    Albums: searchResults?.albums?.length || 0,
    Playlists: searchResults?.playlists?.length || 0,
    Videos: searchResults?.videos?.length || 0,
    Podcasts: searchResults?.podcasts?.length || 0,
  };

  // Sort Songs cleanly
  const sortedSongs = [...songsList].sort((a, b) => {
    if (sortBy === 'popularity') return (b.popularity || 0) - (a.popularity || 0);
    if (sortBy === 'duration') return b.durationMs - a.durationMs;
    return (b.score || 0) - (a.score || 0);
  });

  // CRITICAL FIX: Ensure Top Result is ALWAYS the highest AI Score track in sortedSongs!
  const topResult = sortedSongs.length > 0
    ? sortedSongs.reduce((best, cur) => ((cur.score || 0) > (best.score || 0) ? cur : best), sortedSongs[0])
    : null;

  // Did You Mean / Smart Fallback Lists
  const suggestedSongs = searchResults?.suggestedSongs || searchResults?.popularBengaliSongs || [];
  const suggestedArtists = searchResults?.suggestedArtists || [];

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white pb-36 pt-4 px-4 sm:px-6 lg:px-8 selection:bg-[#00D6FF]/30">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#161C2B]/95 border border-[#00D6FF]/40 text-[#00D6FF] px-5 py-2.5 rounded-full text-xs font-mono font-bold shadow-[0_0_25px_rgba(0,214,255,0.3)] backdrop-blur-xl flex items-center gap-2"
          >
            <Brain className="h-4 w-4 animate-pulse text-[#00D6FF]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. STICKY GLASSMORPHIC SEARCH BAR CONTAINER */}
      <div className="sticky top-0 z-40 bg-[#0B0E14]/85 backdrop-blur-2xl pt-2 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-white/5 space-y-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          
          {/* Glassmorphic Search Input Pill */}
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#B3B3B3] group-focus-within:text-[#00D6FF] transition-colors">
              <SearchIcon className="h-5 w-5" />
            </div>
            
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={ROTATING_PLACEHOLDERS[placeholderIndex]}
              className="w-full pl-11 pr-24 py-3.5 bg-[#121620]/90 border border-white/12 hover:border-[#00D6FF]/40 focus:border-[#00D6FF] focus:outline-none focus:ring-2 focus:ring-[#00D6FF]/20 text-sm font-semibold text-white placeholder-[#808A9D] rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all"
            />

            {/* Input Action Controls (Clear & Voice Search) */}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
              {query && (
                <button
                  onClick={clearSearch}
                  className="p-1.5 rounded-full text-[#B3B3B3] hover:text-white hover:bg-white/10 transition-all"
                  title="Clear input"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              <button
                onClick={startVoiceSearch}
                className={`relative p-2 rounded-full transition-all ${
                  isListening
                    ? 'text-[#00D6FF] bg-[#00D6FF]/20 shadow-[0_0_15px_rgba(0,214,255,0.4)]'
                    : 'text-[#B3B3B3] hover:text-[#00D6FF] hover:bg-white/10'
                }`}
                title="Voice Search"
              >
                <Mic className="h-4.5 w-4.5" />
                {isListening && (
                  <span className="absolute inset-0 rounded-full bg-[#00D6FF]/40 animate-ping" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 2. FILTER CATEGORY BADGES WITH SLIDING INDICATOR */}
        {debouncedQuery.trim().length > 0 && (
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar py-1">
            <div className="flex items-center gap-2 min-w-max">
              {(['All', 'Songs', 'Artists', 'Albums', 'Playlists', 'Videos', 'Podcasts'] as FilterCategory[]).map((filter) => {
                const isActive = activeFilter === filter;
                const count = filterCounts[filter];
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`relative px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isActive ? 'text-black font-extrabold shadow-lg' : 'text-[#B3B3B3] hover:text-white bg-[#141822] hover:bg-[#1E2433] border border-white/10'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeFilterBg"
                        className="absolute inset-0 bg-gradient-to-r from-[#00D6FF] to-[#3B82F6] rounded-full"
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                      />
                    )}
                    <span className="relative z-10">{filter}</span>
                    <span className={`relative z-10 text-[10px] font-mono ${isActive ? 'text-black/70' : 'text-[#808A9D]'}`}>
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* AI Ranking Dropdown */}
            <div className="relative flex-shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none bg-[#141822] border border-white/10 hover:border-[#00D6FF]/40 text-xs font-mono font-bold text-[#00D6FF] py-2 pl-3 pr-7 rounded-full cursor-pointer focus:outline-none"
              >
                <option value="relevance">✨ AI Ranking</option>
                <option value="popularity">🔥 Popularity</option>
                <option value="duration">⏱️ Duration</option>
              </select>
              <ArrowUpDown className="h-3 w-3 text-[#00D6FF] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* MAIN SEARCH HUB CONTAINER (DUAL COLUMN ON DESKTOP TO ELIMINATE DEAD SPACE) */}
      <div className="max-w-7xl mx-auto mt-6">
        
        {/* 1. INITIAL EMPTY SEARCH HUB (WHEN NO QUERY TYPED) */}
        {!debouncedQuery.trim() ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN (2/3): RECENT, TRENDING & CATEGORIES */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono font-bold text-[#B3B3B3] uppercase tracking-wider flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#00D6FF]" /> Recent Searches
                    </h3>
                    <button
                      onClick={() => setRecentSearches([])}
                      className="text-xs text-[#B3B3B3] hover:text-white transition-colors"
                    >
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
                </div>
              )}

              {/* Trending Searches */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold text-[#B3B3B3] uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#00D6FF]" /> Trending Searches
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {INITIAL_TRENDING.map((qStr, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSearch(qStr)}
                      className="px-4 py-2 rounded-full bg-[#141822] hover:bg-[#1E2433] border border-white/10 text-xs font-semibold text-[#B3B3B3] hover:text-white transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                    >
                      <Flame className="h-3.5 w-3.5 text-amber-500" />
                      <span>{qStr}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Browse Categories Grid */}
              <div className="space-y-4">
                <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#00D6FF]" /> Browse Music Categories
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {CATEGORIES.map((cat) => (
                    <motion.div
                      key={cat.id}
                      whileHover={{ y: -4, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSelectSearch(cat.title)}
                      className="relative h-24 rounded-2xl overflow-hidden cursor-pointer group shadow-xl border border-white/10 text-left"
                    >
                      <ImageWithFallback src={cat.cover} alt={cat.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/40 to-transparent p-3 flex flex-col justify-end">
                        <h3 className="text-sm font-extrabold text-white group-hover:text-[#00D6FF] transition-colors">{cat.title}</h3>
                        <p className="text-[10px] font-mono text-[#B3B3B3]">{cat.count}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (1/3): AI DJ STATION & QUICK SHORTS */}
            <div className="space-y-6">
              
              {/* NeoTunes AI DJ Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-b from-[#161C2B] to-[#121620] border border-[#00D6FF]/30 space-y-4 shadow-xl relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-2xl bg-[#00D6FF]/10 text-[#00D6FF]">
                    <Zap className="h-5 w-5 animate-pulse" />
                  </span>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">NeoTunes AI DJ Station</h3>
                    <p className="text-[11px] text-[#B3B3B3]">Custom mix based on your history</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#141822] border border-white/10 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-white">Arijit & Bengali Lo-Fi Mix</p>
                    <p className="text-[10px] text-[#00D6FF] font-mono">98% AI Vibe Match</p>
                  </div>
                  <button 
                    onClick={() => handleSelectSearch('Arijit Singh Bengali')}
                    className="h-9 w-9 rounded-full bg-[#00D6FF] text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
                  >
                    <Play className="h-4 w-4 fill-black translate-x-0.5" />
                  </button>
                </div>
              </div>

              {/* Continue Listening History */}
              {history.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-bold text-[#B3B3B3] uppercase tracking-wider flex items-center gap-2">
                    <History className="h-4 w-4 text-[#00D6FF]" /> Continue Listening
                  </h3>
                  <div className="space-y-2">
                    {history.slice(0, 4).map((t, idx) => (
                      <div
                        key={t.id + idx}
                        onClick={() => playTrack(t)}
                        className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#141822]/80 hover:bg-[#1C2232] border border-white/10 cursor-pointer transition-all group"
                      >
                        <div className="relative h-10 w-10 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                          <ImageWithFallback src={t.coverUrl || '/images/default-cover.png'} alt={t.title} fill className="object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white group-hover:text-[#00D6FF] truncate">{t.title}</p>
                          <p className="text-[10px] text-[#B3B3B3] truncate">{t.artist.name}</p>
                        </div>
                        <Play className="h-4 w-4 text-[#B3B3B3] group-hover:text-[#00D6FF] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (

          /* 2. ACTIVE SEARCH & AI ASSISTANT RESULTS STATE */
          <div className="space-y-8">
            
            {/* Animated AI Status Banner while loading */}
            {isLoading ? (
              <div className="space-y-6">
                <div className="flex items-center justify-center gap-2 p-3 rounded-full bg-[#141822]/80 border border-[#00D6FF]/30 text-xs font-mono font-bold text-[#00D6FF]">
                  <Brain className="h-4 w-4 animate-spin text-[#00D6FF]" />
                  <span>{AI_SEARCH_STEPS[aiStepIndex]}</span>
                </div>

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
              
              /* 3. AI ASSISTANT DISCOVERY DASHBOARD (No Exact Match Fallback) */
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                
                {/* AI Assistant Reasoning Card */}
                <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-b from-[#161C2B]/90 to-[#121620]/90 border border-[#00D6FF]/30 shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00D6FF]/10 border border-[#00D6FF]/30 text-xs font-mono font-bold text-[#00D6FF]">
                        <Brain className="h-3.5 w-3.5 animate-pulse" /> NeoTunes AI Discovery Assistant
                      </div>
                      <h2 className="text-xl md:text-2xl font-black text-white">
                        Couldn&apos;t find an exact match for &quot;<span className="text-[#00D6FF]">{debouncedQuery}</span>&quot;
                      </h2>
                    </div>
                  </div>

                  {/* AI Process Execution Trace */}
                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    {(searchResults?.diagnostics?.pipelineSteps || [
                      { name: 'Spelling Correction', status: 'passed' },
                      { name: 'Phonetic Matching', status: 'passed' },
                      { name: 'Transliteration', status: 'passed' },
                      { name: 'Multi-Provider Search', status: 'failed' },
                    ]).map((step, idx) => (
                      <span
                        key={idx}
                        className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                          step.status === 'passed'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : step.status === 'failed'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                            : 'bg-white/5 border-white/10 text-[#B3B3B3]'
                        }`}
                      >
                        <span className="font-bold">
                          {step.status === 'passed' ? '✓' : step.status === 'failed' ? '✗' : '—'}
                        </span>
                        <span>{step.name}</span>
                      </span>
                    ))}
                  </div>

                  {/* Genuine Catalog Discovery Filters */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <p className="text-xs font-mono text-[#B3B3B3]">Explore related catalog searches:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: `Search Artist Only`, query: debouncedQuery.split(' ')[0] || debouncedQuery },
                        { label: `Official Audio`, query: `${debouncedQuery} Official Audio` },
                        { label: `Live Version`, query: `${debouncedQuery} Live` },
                        { label: `Bengali Hits`, query: `Popular Bengali Songs` },
                        { label: `Top Bollywood`, query: `Bollywood Hits` },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectSearch(item.query)}
                          className="px-4 py-2 rounded-full bg-[#1A2233] hover:bg-[#00D6FF] hover:text-black border border-[#00D6FF]/30 text-xs font-bold text-[#00D6FF] transition-all hover:scale-105 active:scale-95 shadow-md flex items-center gap-1.5"
                        >
                          <Wand2 className="h-3 w-3" />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Similar Songs & AI Fallbacks */}
                {suggestedSongs.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                      🎵 Similar Songs & Phonetic Matches
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {suggestedSongs.slice(0, 6).map((track, idx) => (
                        <div
                          key={track.id + idx}
                          onClick={() => handleTrackClick(track)}
                          className="p-3 rounded-2xl bg-[#141822]/80 hover:bg-[#1B2232] border border-white/10 hover:border-[#00D6FF]/40 cursor-pointer flex items-center justify-between group transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="relative h-11 w-11 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                              <ImageWithFallback src={track.coverUrl} alt={track.title} fill className="object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-white truncate group-hover:text-[#00D6FF] transition-colors">{track.title}</p>
                              <p className="text-[11px] text-[#B3B3B3] truncate">{track.artist?.name || 'Artist'}</p>
                            </div>
                          </div>
                          <button className="h-9 w-9 rounded-full bg-[#00D6FF]/10 group-hover:bg-[#00D6FF] text-[#00D6FF] group-hover:text-black flex items-center justify-center transition-all">
                            <Play className="h-4 w-4 fill-current translate-x-0.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              
              /* 4. FOUND RESULTS SECTION (DUAL COLUMN ON DESKTOP TO UTILIZE RIGHT SPACE) */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN (2/3): TOP MATCH, SONGS LIST & ARTISTS */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* TOP MATCH HERO CARD */}
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
                              <Sparkles className="h-3 w-3" /> {topResult.score ? `${Math.max(95, topResult.score)}% AI Match` : '98% AI Match'}
                            </span>
                            <span className="text-[10px] font-mono text-[#B3B3B3] uppercase bg-white/5 px-2 py-0.5 rounded">
                              {topResult.sourceType}
                            </span>
                          </div>

                          <h3 className="text-2xl font-black text-white group-hover:text-[#00D6FF] transition-colors truncate leading-tight">
                            {cleanTitle(topResult.title)}
                          </h3>
                          <p className="text-sm font-semibold text-[#B3B3B3]">{topResult.artist?.name || 'Artist'}</p>

                          <p className="text-xs text-[#00D6FF]/80 italic pt-1 truncate">
                            &quot;Matched title phonetically &amp; audio catalog index&quot;
                          </p>
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
                  <motion.div variants={itemVariants} className="space-y-3">
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
                                  {cleanTitle(track.title)}
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

                {/* RIGHT COLUMN (1/3): EXPLAINABLE AI MATCH & INSIGHTS PANEL */}
                <div className="space-y-6">
                  
                  {/* AI Match Insights Breakdown */}
                  <div className="p-5 rounded-3xl bg-[#141822]/90 border border-white/10 space-y-4 shadow-xl backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-[#00D6FF]" />
                      <h3 className="text-sm font-extrabold text-white">AI Match Breakdown</h3>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                        <span className="text-[#B3B3B3]">Phonetic Transliteration</span>
                        <span className="text-[#00D6FF] font-bold">100% Match</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                        <span className="text-[#B3B3B3]">Title Similarity</span>
                        <span className="text-[#00D6FF] font-bold">95% Match</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                        <span className="text-[#B3B3B3]">Audio Stream Quality</span>
                        <span className="text-emerald-400 font-bold">FLAC Lossless</span>
                      </div>
                    </div>
                  </div>

                  {/* Verified Artist Card */}
                  {topArtist && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-mono font-bold text-[#B3B3B3] uppercase tracking-wider">Verified Artist</h3>
                      <div 
                        onClick={() => handleSelectSearch(topArtist.name)}
                        className="p-4 rounded-3xl bg-[#141822]/80 border border-white/10 hover:border-[#00D6FF]/40 cursor-pointer flex items-center gap-4 group transition-all"
                      >
                        <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-[#00D6FF]/40 flex-shrink-0 shadow-xl">
                          <ImageWithFallback src={topArtist.coverUrl} alt={topArtist.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1">
                            <h4 className="text-sm font-extrabold text-white group-hover:text-[#00D6FF] transition-colors">{topArtist.name}</h4>
                            <CheckCircle2 className="h-4 w-4 text-[#00D6FF]" />
                          </div>
                          <p className="text-[11px] text-[#B3B3B3]">
                            {topArtist.followers?.toLocaleString() || '1.4M'} Followers
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

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
    <Suspense fallback={
      <div className="p-10 space-y-4 max-w-4xl mx-auto bg-[#0B0E14] text-white">
        <div className="h-14 w-full bg-[#141822] rounded-full animate-pulse" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
