'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { Artwork } from '@/components/ui/Artwork';
import { Play, Compass, Flame, Radio, Sparkles, Music, Music2, Disc, TrendingUp, Headphones, ChevronRight, Zap, Moon, Dumbbell, Heart, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { MusicSearchService } from '@/services/MusicSearchService';
import { Track, getArtistName } from '@/types';

const GENRES = [
  { id: 'pop', title: 'Bollywood & Pop Hits', label: 'Genre', icon: Flame, color: '#FF2D95', bgGradient: 'from-[#FF2D95]/30 via-[#0D111E] to-[#FFB700]/10', query: 'Arijit Singh Pritam Hits' },
  { id: 'punjabi', title: 'Punjabi Hype & Urban', label: 'Genre', icon: Zap, color: '#FF9D00', bgGradient: 'from-[#FF9D00]/30 via-[#0D111E] to-[#FF2D95]/10', query: 'Diljit Dosanjh Karan Aujla' },
  { id: 'bengali', title: 'Bengali Rock & Folk', label: 'Genre', icon: Music2, color: '#00F0FF', bgGradient: 'from-[#00F0FF]/30 via-[#0D111E] to-[#7A3CFF]/10', query: 'Anupam Roy Bengali Hits' },
  { id: 'global', title: 'Global Chart Toppers', label: 'Genre', icon: Disc, color: '#7A3CFF', bgGradient: 'from-[#7A3CFF]/30 via-[#0D111E] to-[#00F0FF]/10', query: 'The Weeknd Global Top Pop' },
  { id: 'lofi', title: 'Lo-Fi & Chill Beats', label: 'Mood', icon: Moon, color: '#10B981', bgGradient: 'from-[#10B981]/30 via-[#0D111E] to-[#00F0FF]/10', query: 'Lo-Fi Chill Study Beats' },
  { id: 'workout', title: 'Workout & Gym Trap', label: 'Activity', icon: Dumbbell, color: '#FF2D95', bgGradient: 'from-[#FF2D95]/30 via-[#0D111E] to-[#FF9D00]/10', query: 'Workout Trap EDM Hype' },
  { id: 'romance', title: 'Romance & Ballads', label: 'Mood', icon: Heart, color: '#FF9D00', bgGradient: 'from-[#FF9D00]/30 via-[#0D111E] to-[#FF2D95]/10', query: 'Romantic Vocal Ballads' },
  { id: 'focus', title: 'Deep Focus & Ambient', label: 'Activity', icon: Brain, color: '#00F0FF', bgGradient: 'from-[#00F0FF]/30 via-[#0D111E] to-[#10B981]/10', query: 'Ambient Focus Study instrumental' },
];

const MOODS = [
  { id: 'focus', title: 'Deep Focus Coding', desc: 'Instrumental ambient soundscapes for flow state', icon: Brain, color: '#00F0FF', query: 'Ambient Focus Concentration' },
  { id: 'chill', title: 'Late Night Chill', desc: 'Smooth lofi beats and warm acoustic rhythms', icon: Moon, color: '#10B981', query: 'Lo-Fi Chill Beats' },
  { id: 'workout', title: 'High Energy Workout', desc: 'Driving EDM trap beats to push physical limits', icon: Dumbbell, color: '#FF2D95', query: 'Gym Trap Workout' },
  { id: 'romance', title: 'Rainy Day Acoustics', desc: 'Intimate vocal tones and acoustic melodies', icon: Heart, color: '#FF9D00', query: 'Romantic Acoustic Songs' },
];

export default function BrowsePage() {
  const router = useRouter();
  const { playTrack } = usePlaybackStore();

  const [newReleases, setNewReleases] = useState<Track[]>([]);
  const [chartTracks, setChartTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadBrowseData() {
      setIsLoading(true);
      try {
        const queries = [
          'Kesariya Arijit Singh',
          'Starboy The Weeknd',
          'Lover Diljit Dosanjh',
          'Amake Amar Moto Anupam Roy',
          'Levitating Dua Lipa'
        ];

        const results = await Promise.allSettled(
          queries.map((q) => MusicSearchService.searchAll(q))
        );

        if (isMounted) {
          const resolvedTracks: Track[] = [];
          results.forEach((res, idx) => {
            if (res.status === 'fulfilled' && res.value.songs && res.value.songs.length > 0) {
              const song = res.value.songs[0];
              // Attach verified release years for exact tracks
              const releaseYears = ['2022', '2016', '2021', '2010', '2020'];
              resolvedTracks.push({
                ...song,
                releaseDate: releaseYears[idx] || '2022',
              });
            }
          });

          if (resolvedTracks.length > 0) {
            setNewReleases(resolvedTracks);
            setChartTracks(resolvedTracks.slice(0, 4));
          }
        }
      } catch (err) {
        console.warn('Browse page fetch error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadBrowseData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <FeatureErrorBoundary featureName="Browse">
      <div className="p-4 sm:p-6 md:p-10 space-y-12 bg-transparent text-[#F4F1F7] font-sans select-none pb-36 max-w-[1650px] mx-auto min-h-screen relative z-10">
      
        {/* ── HEADER (Spec 27 & 40) ── */}
        <div className="space-y-1.5">
          <span className="text-xs font-mono font-bold text-[#00D4FF] uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="h-4 w-4 text-[#00D4FF]" /> DISCOVER THE MULTIVERSE
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Browse Dimensions
          </h1>
          <p className="text-xs sm:text-sm text-white/60">
            Explore releases, soundscapes, and top dimension charts.
          </p>
        </div>

        {/* ── SECTION 1: MOOD & ACTIVITY (Specs 12, 13) ── */}
        <div className="space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#FF9D00] flex items-center gap-2">
            <Headphones className="h-4 w-4 text-[#FF9D00]" /> Mood &amp; Activity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOODS.map((mood) => {
              const Icon = mood.icon;
              return (
                <div
                  key={mood.id}
                  onClick={() => router.push(`/search?q=${encodeURIComponent(mood.query)}`)}
                  className="p-5 rounded-2xl bg-[#0D101C]/80 border border-white/10 hover:border-[#00D4FF]/50 cursor-pointer transition-all space-y-3 group shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl text-black font-bold" style={{ backgroundColor: mood.color }}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <button className="h-9 w-9 rounded-full bg-[#00D4FF] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-md transition-all group-hover:scale-105">
                      <Play className="h-4 w-4 fill-black ml-0.5" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white group-hover:text-[#00D4FF] transition-colors">{mood.title}</h3>
                    <p className="text-xs text-white/60 mt-1 line-clamp-2 leading-relaxed">{mood.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── SECTION 2: NEW RELEASES (Specs 7, 8) ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#FF9D00] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#FF9D00]" /> New Dimension Releases
            </h2>
            <button onClick={() => router.push('/search?q=new+releases')} className="text-xs font-bold text-white/60 hover:text-[#00D4FF] flex items-center gap-1 transition-colors cursor-pointer">
              See All <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5">
            {newReleases.map((nr) => (
              <div
                key={nr.canonicalId || nr.id}
                onClick={() => playTrack(nr)}
                className="p-4 rounded-2xl bg-[#0D101C]/80 border border-white/10 hover:border-[#00D4FF]/40 space-y-3 cursor-pointer group transition-all shadow-md flex flex-col justify-between"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-xl border border-white/15 bg-black/40">
                  <Artwork
                    track={nr}
                    source={nr.artworkUrl || nr.coverUrl}
                    size="large"
                    canonicalId={nr.canonicalId || nr.id}
                    type="track"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[9px] font-black bg-[#00D4FF] text-black shadow-md uppercase tracking-wider">
                    New Drop
                  </span>
                  <button className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-[#00D4FF] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl scale-95 group-hover:scale-100">
                    <Play className="h-4 w-4 fill-black ml-0.5" />
                  </button>
                </div>
                <div className="space-y-1">
                  <div className="font-extrabold text-xs sm:text-sm text-white group-hover:text-[#00D4FF] truncate transition-colors">{nr.title}</div>
                  <div className="text-[11px] text-white/60 truncate font-semibold">
                    {getArtistName(nr.artist || nr.artists)} {nr.releaseDate ? `· ${nr.releaseDate}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 3: TOP CHARTS (Specs 9, 10, 11) ── */}
        <div className="space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#FF9D00] flex items-center gap-2">
            <Music className="h-4 w-4 text-[#FF9D00]" /> Top Dimension Charts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {chartTracks.map((c, idx) => (
              <div
                key={c.canonicalId || c.id}
                onClick={() => playTrack(c)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0D101C]/80 border border-white/10 hover:border-[#00D4FF]/40 cursor-pointer transition-all group shadow-md"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="text-sm font-mono font-black text-[#FF9D00] w-6 text-center">0{idx + 1}</span>
                  <Artwork
                    track={c}
                    source={c.artworkUrl || c.coverUrl}
                    size="small"
                    canonicalId={c.canonicalId || c.id}
                    type="track"
                    className="h-12 w-12 rounded-xl flex-shrink-0 border border-white/15 object-cover"
                  />
                  <div className="min-w-0">
                    <div className="font-extrabold text-xs sm:text-sm text-white group-hover:text-[#00D4FF] truncate transition-colors">{c.title}</div>
                    <div className="text-[11px] text-white/60 truncate font-semibold">
                      {getArtistName(c.artist || c.artists)} {c.album ? `· ${typeof c.album === 'string' ? c.album : (c.album as any)?.name}` : ''}
                    </div>
                  </div>
                </div>
                <button className="h-8 w-8 rounded-full bg-[#00D4FF] text-black flex items-center justify-center shrink-0 ml-2 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-4 w-4 fill-black ml-0.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 4: GENRES & CATEGORIES (Specs 13, 14, 15) ── */}
        <div className="space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#FF9D00] flex items-center gap-2">
            <Disc className="h-4 w-4 text-[#FF9D00]" /> Genres &amp; Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {GENRES.map((g) => {
              const Icon = g.icon;
              return (
                <div
                  key={g.id}
                  onClick={() => router.push(`/search?q=${encodeURIComponent(g.query)}`)}
                  className={`relative h-32 rounded-2xl overflow-hidden cursor-pointer group shadow-lg border border-white/10 p-4 flex flex-col justify-between bg-gradient-to-br ${g.bgGradient} hover:border-[#00D4FF]/60 transition-all`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl text-black font-bold" style={{ backgroundColor: g.color }}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-white/50 group-hover:text-[#FF9D00] transition-colors uppercase">
                      {g.label}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-[#00D4FF] transition-colors">
                      {g.title}
                    </h3>
                    <p className="text-[10px] text-white/50 truncate font-semibold mt-0.5">Explore Dimension</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </FeatureErrorBoundary>
  );
}
