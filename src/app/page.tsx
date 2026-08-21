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
  Headphones,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { createClientBrowser } from '@/lib/supabase-browser';
import { Artwork } from '@/components/ui/Artwork';
import { GlassCard } from '@/components/ui/GlassCard';
import { WaveformVisualizer } from '@/components/ui/WaveformVisualizer';
import { Track, getArtistName } from '@/types';
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
  {
    id: 'rec_belly',
    canonicalId: 'rec_belly',
    source: 'spotify',
    sourceId: 'rec_belly',
    title: 'Belly Dancer',
    artists: ['Imanbek', 'BYOR'],
    artist: 'Imanbek & BYOR',
    album: 'Belly Dancer Single',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
    duration: 152,
    durationMs: 152000,
    playable: true,
  },
];

const NEW_RELEASES: Track[] = [
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
  {
    id: 'col_softly',
    canonicalId: 'col_softly',
    source: 'spotify',
    sourceId: 'col_softly',
    title: 'Softly',
    artists: ['Karan Aujla', 'Ikky'],
    artist: 'Karan Aujla & Ikky',
    album: 'Making Memories',
    artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
    duration: 155,
    durationMs: 155000,
    playable: true,
  },
  {
    id: 'col_gallan',
    canonicalId: 'col_gallan',
    source: 'spotify',
    sourceId: 'col_gallan',
    title: 'Gallan Roz Diyaan',
    artists: ['Saswata Dey'],
    artist: 'Saswata Dey',
    album: 'Urban Vibe Edition',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
    duration: 164,
    durationMs: 164000,
    playable: true,
  },
  {
    id: 'col_fama',
    canonicalId: 'col_fama',
    source: 'spotify',
    sourceId: 'col_fama',
    title: 'FAMA',
    artists: ['HMWME'],
    artist: 'HMWME',
    album: 'FAMA Single',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
    duration: 152,
    durationMs: 152000,
    playable: true,
  },
];

export default function HomePage() {
  const router = useRouter();
  const { history, playTrack, currentTrack, isPlaying, setPlaying, addToQueue } = usePlaybackStore();

  const [greeting, setGreeting] = useState('GOOD EVENING');
  const [userName, setUserName] = useState('Saswata');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isSavedFeatured, setIsSavedFeatured] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('GOOD MORNING');
    else if (hour >= 12 && hour < 17) setGreeting('GOOD AFTERNOON');
    else if (hour >= 17 && hour < 22) setGreeting('GOOD EVENING');
    else setGreeting('GOOD NIGHT');

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
    <div className="p-4 sm:p-6 md:p-10 space-y-8 text-[#F5F5F5] font-sans select-none pb-36 max-w-[1450px] mx-auto min-h-screen">
      
      {/* ── HEADER: REFINED GREETING & RESUME LISTENING ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#292929] pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.045] border border-white/10 text-[10px] font-mono font-bold text-[#DFFF00] uppercase tracking-[0.2em]">
            <span className="w-2 h-2 rounded-full bg-[#DFFF00] animate-pulse" /> NEOTUNES N/OS AUDIO OS
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-mono">
            {greeting}, <span className="text-[#F5F5F5]">{userName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1A1]">
            Spatial sound, curated for you.
          </p>
        </div>

        {currentTrack && (
          <button
            onClick={() => router.push('/player')}
            className="px-4 py-2 rounded-full bg-white/[0.08] border border-white/15 text-[#F5F5F5] hover:border-[#DFFF00] hover:text-[#DFFF00] text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-sm shrink-0"
          >
            <RotateCcw className="h-4 w-4" /> Resume Listening
          </button>
        )}
      </div>

      {/* ── COMPACT CATEGORY FILTER PILLS (36-40px height) ── */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 min-h-[40px]">
        {CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-mono font-bold shrink-0 transition-all cursor-pointer h-[38px] flex items-center gap-2 ${
                isSelected
                  ? 'bg-white/[0.09] text-white border border-[#DFFF00] shadow-sm font-extrabold'
                  : 'bg-white/[0.045] text-[#A1A1A1] hover:text-white border border-white/10 hover:border-white/20'
              }`}
            >
              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#DFFF00]" />}
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* ── HERO FEATURED SECTION (DARK GLASS CARD WITH NO HEAVY YELLOW BLOCK) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT FEATURED CARD */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-white/[0.045] border border-white/10 flex flex-col justify-between relative overflow-hidden group shadow-xl">
          {/* Subtle low-opacity background glow */}
          <div 
            className="absolute inset-0 bg-cover bg-center filter blur-[80px] opacity-10 pointer-events-none transition-all duration-700"
            style={{ backgroundImage: `url(${resolveArtwork(DEFAULT_FEATURED_TRACK)})` }}
          />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#DFFF00] bg-black/40 px-3 py-1 rounded-full border border-white/10">
              FEATURED PLAYLIST
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative aspect-square w-36 sm:w-44 rounded-xl overflow-hidden border border-white/15 shrink-0 bg-black/40 shadow-2xl">
                <Artwork
                  source={resolveArtwork(DEFAULT_FEATURED_TRACK)}
                  size="large"
                  alt={DEFAULT_FEATURED_TRACK.title}
                  canonicalId={DEFAULT_FEATURED_TRACK.id}
                  type="track"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight line-clamp-2">
                  {DEFAULT_FEATURED_TRACK.title}
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-[#A1A1A1]">
                  {getArtistName(DEFAULT_FEATURED_TRACK.artists || DEFAULT_FEATURED_TRACK.artist)}
                </p>
                <p className="text-xs text-[#686868] line-clamp-2 pt-1 font-mono">
                  Album: {DEFAULT_FEATURED_TRACK.album} • 2018
                </p>

                <div className="pt-3 flex items-center justify-center sm:justify-start gap-3">
                  <button
                    onClick={() => playTrack(DEFAULT_FEATURED_TRACK)}
                    className="px-5 py-2.5 rounded-full bg-[#DFFF00] text-black text-xs font-mono font-extrabold uppercase tracking-wider hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 shadow-lg"
                  >
                    <Play className="w-4 h-4 fill-black text-black" /> Play
                  </button>

                  <button
                    onClick={() => setIsSavedFeatured(!isSavedFeatured)}
                    className={`px-4 py-2.5 rounded-full border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSavedFeatured 
                        ? 'bg-[#DFFF00]/15 border-[#DFFF00] text-[#DFFF00]' 
                        : 'bg-white/[0.045] border-white/10 text-[#A1A1A1] hover:text-white'
                    }`}
                  >
                    {isSavedFeatured ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{isSavedFeatured ? 'Saved ✓' : 'Save'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT LIVE WAVEFORM VISUALIZER WIDGET */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <WaveformVisualizer track={activeTrack} />
        </div>
      </div>

      {/* ── RECOMMENDED FOR YOU (3-5 COMPACT CARDS) ── */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-mono flex items-center gap-2">
            RECOMMENDED FOR YOU
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEFAULT_RECOMMENDED.map((track) => {
            const isCurrent = currentTrack?.id === track.id;
            return (
              <GlassCard
                key={track.id}
                onClick={() => playTrack(track)}
                className="p-3 flex items-center justify-between cursor-pointer group hover:border-[#DFFF00]/40 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <Artwork
                      source={resolveArtwork(track)}
                      size="small"
                      canonicalId={track.id}
                      type="track"
                      className="h-14 w-14 rounded-xl object-cover border border-white/10"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                      <Play className="w-5 h-5 fill-white text-white" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs font-bold truncate group-hover:text-[#DFFF00] transition-colors ${
                      isCurrent ? 'text-[#DFFF00]' : 'text-[#F5F5F5]'
                    }`}>
                      {track.title}
                    </div>
                    <div className="text-[11px] text-[#A1A1A1] truncate mt-0.5 font-medium">
                      {getArtistName(track.artists || track.artist)}
                    </div>
                  </div>
                </div>

                <div className="text-xs font-mono text-[#686868] shrink-0 px-2">
                  3:12
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* ── NEW RELEASES 5-COLUMN RESPONSIVE GRID ── */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-mono">
            NEW RELEASES
          </h2>
          <button
            onClick={() => router.push('/browse')}
            className="text-xs font-mono font-bold text-[#DFFF00] hover:underline cursor-pointer flex items-center gap-1"
          >
            See all <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {NEW_RELEASES.map((item) => (
            <GlassCard
              key={item.id}
              onClick={() => playTrack(item)}
              className="p-3 cursor-pointer group space-y-3 hover:border-white/30"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/10">
                <Artwork
                  source={resolveArtwork(item)}
                  size="medium"
                  canonicalId={item.id}
                  type="track"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-10 w-10 rounded-full bg-[#DFFF00] text-black flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 fill-black text-black ml-0.5" />
                  </div>
                </div>
              </div>
              <div>
                <div className="font-bold text-xs sm:text-sm text-white group-hover:text-[#DFFF00] truncate transition-colors">
                  {item.title}
                </div>
                <div className="text-[11px] text-[#A1A1A1] truncate mt-0.5 font-medium">
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
