'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { Artwork } from '@/components/ui/Artwork';
import { GlassCard } from '@/components/ui/GlassCard';
import { 
  Play, 
  Search, 
  Sparkles, 
  Flame, 
  Zap, 
  Moon, 
  Dumbbell, 
  Heart, 
  Brain, 
  Disc, 
  ChevronRight, 
  Plus, 
  Globe, 
  Radio, 
  TrendingUp, 
  Music 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { MusicSearchService } from '@/services/MusicSearchService';
import { Track, getArtistName } from '@/types';
import { resolveArtwork } from '@/utils/artwork';

const QUICK_CHIPS = [
  'Trending', 'New Releases', 'Charts', 'Bollywood', 'Punjabi',
  'Bengali', 'English', 'Lo-Fi', 'Workout', 'Romantic'
];

const MOODS_2COL = [
  { id: 'focus', title: 'Deep Focus', desc: 'Flow state ambient & lofi', icon: Brain, color: '#DFFF00', query: 'Ambient Focus Concentration' },
  { id: 'chill', title: 'Late Night', desc: 'Warm acoustic & smooth lofi', icon: Moon, color: '#00D9FF', query: 'Lo-Fi Chill Beats' },
  { id: 'workout', title: 'Workout', desc: 'High energy EDM trap & hype', icon: Dumbbell, color: '#DFFF00', query: 'Gym Trap Workout' },
  { id: 'romance', title: 'Romantic', desc: 'Intimate vocal ballads', icon: Heart, color: '#00D9FF', query: 'Romantic Acoustic Songs' },
];

const GENRES_GRID = [
  { id: 'pop', title: 'Bollywood & Pop', query: 'Bollywood Pop Hits', color: '#DFFF00' },
  { id: 'punjabi', title: 'Punjabi Hype', query: 'Punjabi Hype Hits', color: '#00D9FF' },
  { id: 'bengali', title: 'Bengali Folk & Rock', query: 'Bengali Rock Melodies', color: '#DFFF00' },
  { id: 'global', title: 'Global Chart Toppers', query: 'Global Pop Top Hits', color: '#00D9FF' },
  { id: 'lofi', title: 'Lo-Fi Beats', query: 'Lo-Fi Chill Beats', color: '#DFFF00' },
  { id: 'hiphop', title: 'Hip-Hop & Trap', query: 'Hip-Hop Trap Hits', color: '#00D9FF' },
];

const REGIONAL_SOUNDS = [
  { id: 'bengali', title: 'Bengali', desc: 'Modern & Classic Rabindra Sangeet', query: 'Bengali Top Hits' },
  { id: 'punjabi', title: 'Punjabi', desc: 'Bhangra, Urban & Pop', query: 'Punjabi Top Hits' },
  { id: 'hindi', title: 'Hindi', desc: 'Bollywood & Indie Melodies', query: 'Hindi Top Hits' },
  { id: 'tamil', title: 'Tamil', desc: 'Kollywood Beats', query: 'Tamil Top Hits' },
  { id: 'telugu', title: 'Telugu', desc: 'Tollywood Soundtracks', query: 'Telugu Top Hits' },
];

export default function BrowsePage() {
  const router = useRouter();
  const { playTrack, addToQueue, history, currentTrack } = usePlaybackStore();

  const [activeChip, setActiveChip] = useState('Trending');
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [newReleases, setNewReleases] = useState<Track[]>([]);
  const [chartTracks, setChartTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadBrowseData() {
      setIsLoading(true);
      try {
        const [trendingRes, releaseRes, chartRes] = await Promise.allSettled([
          MusicSearchService.searchAll('Trending Hits 2026', { limit: 6 }),
          MusicSearchService.searchAll('New Releases Albums 2026', { limit: 5 }),
          MusicSearchService.searchAll('Top Charts India Global', { limit: 4 })
        ]);

        if (isMounted) {
          if (trendingRes.status === 'fulfilled' && trendingRes.value.songs) {
            setTrendingTracks(trendingRes.value.songs);
          }
          if (releaseRes.status === 'fulfilled' && releaseRes.value.songs) {
            setNewReleases(releaseRes.value.songs);
          }
          if (chartRes.status === 'fulfilled' && chartRes.value.songs) {
            setChartTracks(chartRes.value.songs);
          }
        }
      } catch (err) {
        console.warn('Browse page data load error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadBrowseData();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatTime = (seconds?: number) => {
    if (!seconds || isNaN(seconds)) return '3:15';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <FeatureErrorBoundary featureName="Browse">
      <div className="p-4 sm:p-6 md:p-10 space-y-8 bg-transparent text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 relative min-h-screen max-w-[1550px] mx-auto">
        
        {/* ── 1. COMPACT HEADER ── */}
        <div className="border-b border-white/10 pb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Browse
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1A6] mt-0.5">
            Discover music for every mood, genre and frequency.
          </p>
        </div>

        {/* ── 2. SEARCH BAR (Reroutes to /search) ── */}
        <div className="max-w-xl">
          <div
            onClick={() => router.push('/search')}
            className="relative flex items-center bg-white/[0.055] border border-white/10 hover:border-[#DFFF00]/50 rounded-2xl px-4 py-3 cursor-pointer transition-all duration-300 backdrop-blur-md group"
          >
            <Search className="h-4 w-4 text-[#A1A1A6] group-hover:text-[#DFFF00] mr-3 shrink-0 transition-colors" />
            <span className="text-xs sm:text-sm text-[#A1A1A6] font-medium">
              Search music, artists, albums, moods...
            </span>
          </div>
        </div>

        {/* ── 3. QUICK DISCOVERY CHIPS ── */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {QUICK_CHIPS.map((chip) => {
            const isSelected = activeChip === chip;
            return (
              <button
                key={chip}
                onClick={() => {
                  setActiveChip(chip);
                  router.push(`/search?q=${encodeURIComponent(chip)}`);
                }}
                className={`px-4 py-2 rounded-full text-xs font-mono font-bold shrink-0 transition-all cursor-pointer h-[38px] flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#DFFF00] text-black font-extrabold shadow-sm'
                    : 'bg-white/[0.045] text-[#A1A1A6] hover:text-white border border-white/10 hover:border-white/20'
                }`}
              >
                <span>{chip}</span>
              </button>
            );
          })}
        </div>

        {/* ── 4. TRENDING NOW (Horizontal Cards) ── */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#DFFF00] uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-[#DFFF00]" /> TRENDING NOW
            </span>
            <button
              onClick={() => router.push('/search?q=Trending')}
              className="text-xs font-mono font-bold text-[#A1A1A6] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              See all <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto scrollbar-none py-1">
            {isLoading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="w-44 h-56 rounded-2xl bg-white/[0.045] border border-white/10 animate-pulse shrink-0" />
              ))
            ) : (
              trendingTracks.map((trk) => (
                <GlassCard
                  key={trk.id}
                  onClick={() => playTrack(trk)}
                  className="w-44 p-3 shrink-0 cursor-pointer group hover:border-[#DFFF00]/40 transition-all space-y-3"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white/5 border border-white/10">
                    <Artwork
                      source={resolveArtwork(trk)}
                      size="medium"
                      canonicalId={trk.id}
                      type="track"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 right-2 p-2.5 rounded-full bg-[#DFFF00] text-black shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white truncate group-hover:text-[#DFFF00] transition-colors">
                      {trk.title}
                    </h4>
                    <p className="text-[11px] text-[#A1A1A6] truncate mt-0.5">
                      {getArtistName(trk.artists || trk.artist)}
                    </p>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </div>

        {/* ── 5. NEW RELEASES (Horizontal 1:1 Albums) ── */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#00D9FF] uppercase tracking-wider flex items-center gap-1.5">
              <Disc className="h-3.5 w-3.5 text-[#00D9FF]" /> NEW RELEASES
            </span>
            <button
              onClick={() => router.push('/search?q=New+Releases')}
              className="text-xs font-mono font-bold text-[#A1A1A6] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              See all <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto scrollbar-none py-1">
            {newReleases.map((nr) => (
              <GlassCard
                key={nr.id}
                onClick={() => playTrack(nr)}
                className="w-40 p-3 shrink-0 cursor-pointer group hover:border-[#00D9FF]/40 transition-all space-y-2.5"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white/5 border border-white/10">
                  <Artwork
                    source={resolveArtwork(nr)}
                    size="medium"
                    canonicalId={nr.id}
                    type="track"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white truncate group-hover:text-[#00D9FF] transition-colors">
                    {nr.title}
                  </h4>
                  <p className="text-[11px] text-[#A1A1A6] truncate mt-0.5">
                    {getArtistName(nr.artists || nr.artist)}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* ── 6. RANKED CHARTS (#1, #2, #3, #4) ── */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Music className="h-3.5 w-3.5 text-[#DFFF00]" /> TOP CHARTS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {chartTracks.map((ct, idx) => (
              <GlassCard
                key={ct.id}
                onClick={() => playTrack(ct)}
                className="p-3 flex items-center justify-between cursor-pointer group hover:border-[#DFFF00]/40 transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <span className="text-sm font-mono font-extrabold text-[#DFFF00] w-6 text-center shrink-0">
                    0{idx + 1}
                  </span>
                  <Artwork
                    source={resolveArtwork(ct)}
                    size="small"
                    canonicalId={ct.id}
                    type="track"
                    className="h-12 w-12 rounded-xl object-cover border border-white/10 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-[#F5F5F7] group-hover:text-[#DFFF00] truncate transition-colors">
                      {ct.title}
                    </div>
                    <div className="text-[11px] text-[#A1A1A6] truncate mt-0.5">
                      {getArtistName(ct.artists || ct.artist)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-[#A1A1A6]">
                    {formatTime(ct.duration)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToQueue(ct);
                    }}
                    className="p-2 rounded-full bg-white/5 hover:bg-[#DFFF00] hover:text-black text-[#A1A1A6] transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                    title="Add to queue"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* ── 7. MOODS (Compact 2-Column Grid ~130px Height) ── */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-mono font-bold text-[#A1A1A6] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#DFFF00]" /> MOODS &amp; ACTIVITIES
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {MOODS_2COL.map((m) => {
              const Icon = m.icon;
              return (
                <GlassCard
                  key={m.id}
                  onClick={() => router.push(`/search?q=${encodeURIComponent(m.query)}`)}
                  className="p-4 cursor-pointer group space-y-2 hover:border-[#DFFF00]/40 transition-all min-h-[130px] flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-white/10 text-[#DFFF00] group-hover:bg-[#DFFF00] group-hover:text-black transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white group-hover:text-[#DFFF00] transition-colors">
                      {m.title}
                    </h4>
                    <p className="text-[10px] text-[#A1A1A6] truncate mt-0.5">{m.desc}</p>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* ── 8. EXPLORE GENRES ── */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-mono font-bold text-[#A1A1A6] uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-[#00D9FF]" /> EXPLORE GENRES
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {GENRES_GRID.map((g) => (
              <GlassCard
                key={g.id}
                onClick={() => router.push(`/search?q=${encodeURIComponent(g.query)}`)}
                className="p-3.5 cursor-pointer group hover:border-[#00D9FF]/40 transition-all"
              >
                <div className="text-xs font-bold text-white group-hover:text-[#00D9FF] truncate transition-colors">
                  {g.title}
                </div>
                <p className="text-[10px] text-[#A1A1A6] truncate mt-0.5 font-mono">Explore →</p>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* ── 9. REGIONAL SOUNDS ── */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-mono font-bold text-[#A1A1A6] uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-[#DFFF00]" /> REGIONAL SOUNDS
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {REGIONAL_SOUNDS.map((r) => (
              <GlassCard
                key={r.id}
                onClick={() => router.push(`/search?q=${encodeURIComponent(r.query)}`)}
                className="p-3.5 cursor-pointer group hover:border-[#DFFF00]/40 transition-all space-y-1"
              >
                <div className="text-xs font-bold text-white group-hover:text-[#DFFF00] truncate transition-colors">
                  {r.title}
                </div>
                <p className="text-[10px] text-[#A1A1A6] truncate leading-snug">{r.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>

      </div>
    </FeatureErrorBoundary>
  );
}
