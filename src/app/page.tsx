'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { 
  Play, 
  Pause, 
  Search, 
  Sparkles, 
  Flame, 
  Heart, 
  Music, 
  Radio, 
  Disc, 
  MoreHorizontal, 
  ChevronRight, 
  Compass, 
  Plus, 
  RotateCcw,
  Headphones
} from 'lucide-react';
import { motion } from 'framer-motion';
import { createClientBrowser } from '@/lib/supabase-browser';
import { MusicSearchService } from '@/services/MusicSearchService';
import { Artwork } from '@/components/ui/Artwork';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassPill } from '@/components/ui/GlassPill';
import { WaveformVisualizer } from '@/components/ui/WaveformVisualizer';
import { Track, toCanonicalTrack, getArtistName } from '@/types';
import { resolveArtwork } from '@/utils/artwork';

const CATEGORIES = ['All', 'Familiar', 'Popular', 'Discover', 'Deep cuts'];

const DEFAULT_FEATURED_TRACK: Track = {
  id: 'featured_1',
  canonicalId: 'featured_1',
  source: 'spotify',
  sourceId: 'featured_1',
  title: 'Where This Flower Blooms',
  artists: ['Tyler, The Creator', 'Frank Ocean'],
  artist: 'Flower Boy',
  album: 'Flower Boy',
  artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
  coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
  duration: 196,
  durationMs: 196000,
  playable: true,
};

const DEFAULT_RECOMMENDED: Track[] = [
  {
    id: 'rec_britney',
    canonicalId: 'rec_britney',
    source: 'spotify',
    sourceId: 'rec_britney',
    title: 'Britney',
    artists: ['OBLADAET'],
    artist: 'OBLADAET',
    album: 'Britney Single',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
    duration: 192,
    durationMs: 192000,
    playable: true,
  },
  {
    id: 'rec_smack',
    canonicalId: 'rec_smack',
    source: 'spotify',
    sourceId: 'rec_smack',
    title: 'Smack That',
    artists: ['Bacon Bros'],
    artist: 'Bacon Bros',
    album: 'Smack That Single',
    artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
    duration: 154,
    durationMs: 154000,
    playable: true,
  },
  {
    id: 'rec_heart',
    canonicalId: 'rec_heart',
    source: 'spotify',
    sourceId: 'rec_heart',
    title: 'Heart',
    artists: ['Drake'],
    artist: 'Drake',
    album: 'Heart Single',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
    duration: 188,
    durationMs: 188000,
    playable: true,
  },
];

const NEW_COLLECTION: Track[] = [
  {
    id: 'col_mr_right',
    canonicalId: 'col_mr_right',
    source: 'spotify',
    sourceId: 'col_mr_right',
    title: 'Mr. Right Now',
    artists: ['21 Savage'],
    artist: '21 Savage',
    album: 'Savage Mode II',
    artworkUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=600&q=80',
    duration: 193,
    durationMs: 193000,
    playable: true,
  },
  {
    id: 'col_many_men',
    canonicalId: 'col_many_men',
    source: 'spotify',
    sourceId: 'col_many_men',
    title: 'Many Men',
    artists: ['Metro Boomin'],
    artist: 'Metro Boomin',
    album: 'Savage Mode II',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
    duration: 195,
    durationMs: 195000,
    playable: true,
  },
];

export default function HomePage() {
  const router = useRouter();
  const { history, playTrack, currentTrack, isPlaying, setPlaying } = usePlaybackStore();

  const [greeting, setGreeting] = useState('Good Evening');
  const [userName, setUserName] = useState('Saswata');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchInput, setSearchInput] = useState('');
  const [trendingTracks, setTrendingTracks] = useState<Track[]>(DEFAULT_RECOMMENDED);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Good Morning');
    else if (hour >= 12 && hour < 17) setGreeting('Good Afternoon');
    else if (hour >= 17 && hour < 22) setGreeting('Good Evening');
    else setGreeting('Good Night');

    const supabase = createClientBrowser();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        const name = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Saswata';
        setUserName(name.split(' ')[0]);
      }
    });
  }, []);

  const activeTrack = currentTrack || DEFAULT_FEATURED_TRACK;

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-8 text-[#F5F5F7] font-sans select-none pb-36 max-w-[1600px] mx-auto min-h-screen">
      
      {/* ── HEADER: GREETING & RESUME LISTENING ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.055] border border-white/10 text-[10px] font-mono font-bold text-[#DFFF00] uppercase tracking-[0.2em]">
            <Headphones className="h-3.5 w-3.5 text-[#DFFF00]" /> NEOTUNES N/OS AUDIO OS
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-mono">
            {greeting}, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1A6]">
            Spatial sound, curated recommendations, and personalized audio streams.
          </p>
        </div>

        {currentTrack && (
          <button
            onClick={() => router.push('/player')}
            className="px-5 py-2.5 rounded-full bg-[#DFFF00] text-black text-xs font-mono font-extrabold uppercase tracking-wider hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 shadow-[0_0_20px_rgba(223,255,0,0.3)] shrink-0"
          >
            <RotateCcw className="h-4 w-4" /> Resume Listening
          </button>
        )}
      </div>

      {/* ── CATEGORY FILTER CHIPS ── */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 min-h-[44px]">
        {CATEGORIES.map((cat) => (
          <GlassPill
            key={cat}
            active={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </GlassPill>
        ))}
      </div>

      {/* ── MAIN HERO STAGE & AUDIO WAVEFORM (REFERENCE SCREENSHOT MATCH) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT / HERO DISCOVER STAGE (Yellow Accent #DFFF00 Card) */}
        <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-[#DFFF00] text-black shadow-2xl relative overflow-hidden group min-h-[360px]">
          {/* Top Bar */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-xs font-mono font-black uppercase tracking-widest bg-black/10 px-3 py-1 rounded-full border border-black/10">
              <span>Discover</span>
            </div>
            <button className="p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors cursor-pointer">
              <MoreHorizontal className="w-5 h-5 text-black" />
            </button>
          </div>

          {/* Center Stage Artwork & Play Overlay */}
          <div className="relative my-6 max-w-sm mx-auto w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-black/20 group-hover:scale-102 transition-transform duration-500">
            <Artwork
              source={resolveArtwork(activeTrack)}
              size="large"
              alt={activeTrack.title}
              canonicalId={activeTrack.id}
              type="track"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => playTrack(activeTrack)}
                className="h-16 w-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl active:scale-95 transition-transform cursor-pointer"
                aria-label="Play Discover Track"
              >
                <Play className="w-7 h-7 fill-black text-black ml-1" />
              </button>
            </div>
            <div className="absolute bottom-3 left-3 bg-black/80 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md">
              Trap
            </div>
          </div>

          {/* Subtitle Label */}
          <div className="flex items-center justify-between z-10 font-mono text-xs font-bold uppercase tracking-wider text-black/80">
            <span>Your playlist</span>
            <span className="flex items-center gap-1">Swipe <ChevronRight className="w-4 h-4" /></span>
          </div>
        </div>

        {/* RIGHT / LIVE WAVEFORM VISUALIZER WIDGET */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <WaveformVisualizer track={activeTrack} />
        </div>
      </div>

      {/* ── RECOMMENDED FOR YOU TODAY (WITH SEARCH INPUT) ── */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-mono flex items-center gap-2">
            Recommended For You Today
          </h2>
        </div>

        {/* Integrated Search Input */}
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1A6]" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchInput.trim()) {
                router.push(`/search?q=${encodeURIComponent(searchInput)}`);
              }
            }}
            placeholder="Search tracks, artists, albums..."
            className="w-full bg-white/[0.055] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs font-mono text-white placeholder:text-[#A1A1A6] outline-none focus:border-white/30 transition-all shadow-inner"
          />
        </div>

        {/* Track Rows Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DEFAULT_RECOMMENDED.map((track) => {
            const isCurrent = currentTrack?.id === track.id;
            return (
              <GlassCard
                key={track.id}
                onClick={() => playTrack(track)}
                className="p-3 flex items-center justify-between cursor-pointer group hover:border-[#DFFF00]/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Artwork
                    source={resolveArtwork(track)}
                    size="small"
                    canonicalId={track.id}
                    type="track"
                    className="h-12 w-12 rounded-xl object-cover border border-white/10 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className={`text-xs font-bold truncate group-hover:text-[#DFFF00] transition-colors ${
                      isCurrent ? 'text-[#DFFF00]' : 'text-[#F5F5F7]'
                    }`}>
                      {track.title}
                    </div>
                    <div className="text-[11px] text-[#A1A1A6] truncate">
                      {getArtistName(track.artists || track.artist)}
                    </div>
                  </div>
                </div>

                <div className="text-xs font-mono text-[#A1A1A6] shrink-0 px-2">
                  3:12
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* ── NEW COLLECTION CAROUSEL ── */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-mono">
            New Collection
          </h2>
          <button
            onClick={() => router.push('/browse')}
            className="text-xs font-mono font-bold text-[#DFFF00] hover:underline cursor-pointer flex items-center gap-1"
          >
            See all <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {NEW_COLLECTION.map((item) => (
            <GlassCard
              key={item.id}
              onClick={() => playTrack(item)}
              className="p-3 cursor-pointer group space-y-3"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/10">
                <Artwork
                  source={resolveArtwork(item)}
                  size="medium"
                  canonicalId={item.id}
                  type="track"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono text-white/80 border border-white/10">
                  12 942
                </div>
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-white group-hover:text-[#DFFF00] truncate transition-colors">
                  {item.title}
                </div>
                <div className="text-[11px] text-[#A1A1A6] truncate mt-0.5 font-medium">
                  {getArtistName(item.artists || item.artist)}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

    </div>
  );
}
