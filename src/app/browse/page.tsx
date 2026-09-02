'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { Artwork } from '@/components/ui/Artwork';
import { NeoCard } from '@/components/ui/NeoCard';
import { NeoTrackRow } from '@/components/ui/NeoTrackRow';
import { NeoSkeleton } from '@/components/ui/NeoSkeleton';
import { NeoChip } from '@/components/ui/NeoChip';
import { NeoSection } from '@/components/ui/NeoSection';
import { 
  Play, 
  Sparkles, 
  Moon, 
  Dumbbell, 
  Heart, 
  Brain, 
  Disc3, 
  Globe, 
  TrendingUp, 
  Music, 
  Flame, 
  Zap, 
  Coffee, 
  Bed, 
  Compass, 
  Radio
} from 'lucide-react';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { MusicSearchService } from '@/services/MusicSearchService';
import { Track } from '@/types';
import { resolveArtwork } from '@/utils/artwork';

const QUICK_CHIPS = [
  'All', 'Trending', 'Bollywood', 'Punjabi', 'Bengali', 'Global Pop', 'Lo-Fi', 'Workout', 'Late Night', 'Focus'
];

const MOODS = [
  { id: 'focus', title: 'Deep Focus', desc: 'Flow state ambient & lofi beats', icon: Brain, color: '#DFFF00', query: 'Ambient Focus Concentration' },
  { id: 'chill', title: 'Late Night', desc: 'Warm acoustic & smooth beats', icon: Moon, color: '#00E5FF', query: 'Lo-Fi Chill Beats' },
  { id: 'workout', title: 'Workout & Gym', desc: 'High energy EDM & trap', icon: Dumbbell, color: '#DFFF00', query: 'Gym Trap Workout' },
  { id: 'romance', title: 'Romantic Melodies', desc: 'Intimate acoustics & love ballads', icon: Heart, color: '#00E5FF', query: 'Romantic Acoustic Songs' },
  { id: 'energy', title: 'Morning Energy', desc: 'Uplifting tracks to start the day', icon: Zap, color: '#DFFF00', query: 'Morning Energy Upbeat' },
  { id: 'sleep', title: 'Sleep & Ambient', desc: 'Calming sounds for deep rest', icon: Bed, color: '#00E5FF', query: 'Deep Sleep Ambient Sounds' },
];

const GENRES = [
  { id: 'bollywood', title: 'Bollywood & Hindi', desc: 'Top Cinema & Indie Melodies', query: 'Bollywood Top Hits', icon: Flame },
  { id: 'punjabi', title: 'Punjabi Pop', desc: 'Bhangra, Urban & Trap', query: 'Punjabi Top Hits', icon: Zap },
  { id: 'bengali', title: 'Bengali Hits', desc: 'Modern & Classic Melodies', query: 'Bengali Top Hits', icon: Music },
  { id: 'global', title: 'Global Pop', desc: 'Chart-topping Pop & R&B', query: 'Global Pop Top Hits', icon: Globe },
  { id: 'lofi', title: 'Lo-Fi Beats', desc: 'Chillhop & Instrumental Study', query: 'Lo-Fi Chill Beats', icon: Coffee },
  { id: 'hiphop', title: 'Hip-Hop & Rap', desc: 'Bars, Beats & 808s', query: 'Hip-Hop Hits 2026', icon: Disc3 },
];

const DECADES = [
  { title: '2020s Hits', query: '2020s Top Hits' },
  { title: '2010s Nostalgia', query: '2010s Greatest Pop Hits' },
  { title: '2000s Throwback', query: '2000s Pop and R&B' },
  { title: '90s Classics', query: '90s Classic Songs' },
  { title: '80s Retro', query: '80s Synth Pop Classics' },
];

export default function BrowsePage() {
  const router = useRouter();
  const { playTrack } = usePlaybackStore();

  const [activeChip, setActiveChip] = useState('All');
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [newReleases, setNewReleases] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadBrowseData() {
      setIsLoading(true);
      try {
        const [trendingRes, releaseRes] = await Promise.allSettled([
          MusicSearchService.searchAll('Trending Hits 2026', { limit: 6 }),
          MusicSearchService.searchAll('New Releases Albums 2026', { limit: 6 }),
        ]);

        if (isMounted) {
          if (trendingRes.status === 'fulfilled' && trendingRes.value.songs) {
            setTrendingTracks(trendingRes.value.songs);
          }
          if (releaseRes.status === 'fulfilled' && releaseRes.value.songs) {
            setNewReleases(releaseRes.value.songs);
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

  return (
    <FeatureErrorBoundary featureName="Browse">
      <div className="p-4 sm:p-6 md:p-8 space-y-8 text-[#F5F7FA] font-sans select-none max-w-7xl mx-auto min-h-screen pb-44 md:pb-28">
        
        {/* Header */}
        <div className="border-b border-white/[0.06] pb-4 space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Compass className="h-6 w-6 text-[#DFFF00]" /> Discover &amp; Browse
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA1AD] font-medium">
            Explore genres, moods, decades, and algorithmic sound selections.
          </p>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
          {QUICK_CHIPS.map((chip) => (
            <NeoChip
              key={chip}
              selected={activeChip === chip}
              onClick={() => {
                setActiveChip(chip);
                if (chip !== 'All') {
                  router.push(`/search?q=${encodeURIComponent(chip)}`);
                }
              }}
            >
              {chip}
            </NeoChip>
          ))}
        </div>

        {/* ── 1. TRENDING CHARTS ── */}
        <NeoSection
          title="Trending Hits"
          subtitle="Top streamed tracks this week"
          icon={<TrendingUp className="h-4 w-4 text-[#DFFF00]" />}
          actionText="View all"
          onAction={() => router.push('/search?q=Trending')}
        >
          {isLoading ? (
            <NeoSkeleton variant="track" count={4} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {trendingTracks.map((trk, idx) => (
                <NeoTrackRow
                  key={`${trk.id}_${idx}`}
                  track={trk}
                  index={idx}
                  showIndex={true}
                  playlistContext={trendingTracks}
                />
              ))}
            </div>
          )}
        </NeoSection>

        {/* ── 2. MOODS & ENVIRONMENTS ── */}
        <NeoSection
          title="Moods &amp; Vibes"
          subtitle="Choose the perfect sonic frequency for your current vibe"
          icon={<Sparkles className="h-4 w-4 text-[#00E5FF]" />}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {MOODS.map((m) => {
              const Icon = m.icon;
              return (
                <NeoCard
                  key={m.id}
                  interactive
                  onClick={() => router.push(`/search?q=${encodeURIComponent(m.query)}`)}
                  className="p-4 cursor-pointer group flex flex-col justify-between min-h-[130px] hover:border-[#00E5FF]/40 transition-all"
                >
                  <div className="p-2.5 rounded-xl bg-white/5 text-[#00E5FF] group-hover:bg-[#00E5FF] group-hover:text-black transition-colors w-fit shadow-sm">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#00E5FF] transition-colors">
                      {m.title}
                    </h4>
                    <p className="text-[11px] text-[#9AA1AD] truncate mt-0.5">{m.desc}</p>
                  </div>
                </NeoCard>
              );
            })}
          </div>
        </NeoSection>

        {/* ── 3. FEATURED GENRES ── */}
        <NeoSection
          title="Explore Genres"
          subtitle="From regional roots to international soundscapes"
          icon={<Disc3 className="h-4 w-4 text-[#DFFF00]" />}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {GENRES.map((g) => {
              const Icon = g.icon;
              return (
                <NeoCard
                  key={g.id}
                  interactive
                  onClick={() => router.push(`/search?q=${encodeURIComponent(g.query)}`)}
                  className="p-4 cursor-pointer group flex flex-col justify-between min-h-[130px] hover:border-[#DFFF00]/40 transition-all"
                >
                  <div className="p-2.5 rounded-xl bg-white/5 text-[#DFFF00] group-hover:bg-[#DFFF00] group-hover:text-black transition-colors w-fit shadow-sm">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#DFFF00] transition-colors">
                      {g.title}
                    </h4>
                    <p className="text-[11px] text-[#9AA1AD] truncate mt-0.5">{g.desc}</p>
                  </div>
                </NeoCard>
              );
            })}
          </div>
        </NeoSection>

        {/* ── 4. DECADES TIME MACHINE ── */}
        <NeoSection
          title="Decades Time Machine"
          subtitle="Travel through iconic eras of music history"
          icon={<Globe className="h-4 w-4 text-[#FF2D95]" />}
        >
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            {DECADES.map((d) => (
              <NeoCard
                key={d.title}
                interactive
                onClick={() => router.push(`/search?q=${encodeURIComponent(d.query)}`)}
                className="p-4 cursor-pointer group hover:border-[#FF2D95]/40 transition-all flex items-center justify-between"
              >
                <span className="text-xs sm:text-sm font-extrabold text-white group-hover:text-[#FF2D95] transition-colors">
                  {d.title}
                </span>
                <Play className="h-3.5 w-3.5 text-[#9AA1AD] group-hover:text-[#FF2D95] transition-colors" />
              </NeoCard>
            ))}
          </div>
        </NeoSection>

      </div>
    </FeatureErrorBoundary>
  );
}
