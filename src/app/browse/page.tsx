'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { Artwork } from '@/components/ui/Artwork';
import { NeoCard } from '@/components/ui/NeoCard';
import { NeoTrackRow } from '@/components/ui/NeoTrackRow';
import { NeoSkeleton } from '@/components/ui/NeoSkeleton';
import { 
  Play, 
  Search, 
  Sparkles, 
  Moon, 
  Dumbbell, 
  Heart, 
  Brain, 
  Disc3, 
  Globe, 
  TrendingUp, 
  Radio,
  Music,
  Flame,
  Zap,
  Coffee,
  Bed,
  Smile,
  Compass
} from 'lucide-react';
import { FeatureErrorBoundary } from '@/components/common/FeatureErrorBoundary';
import { MusicSearchService } from '@/services/MusicSearchService';
import { Track } from '@/types';

const QUICK_CHIPS = [
  'Trending', 'New Releases', 'Charts', 'Bollywood', 'Punjabi',
  'Bengali', 'Global Pop', 'Lo-Fi', 'Workout', 'Late Night', 'Focus', 'Sleep'
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
  { id: 'bengali', title: 'Bengali Hits', desc: 'Modern & Classic Rabindra Sangeet', query: 'Bengali Top Hits', icon: Music },
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
  const { playTrack, currentTrack } = usePlaybackStore();

  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [newReleases, setNewReleases] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadBrowseData() {
      setIsLoading(true);
      try {
        const [trendingRes, releaseRes] = await Promise.allSettled([
          MusicSearchService.searchAll('Trending Hits 2026', { limit: 5 }),
          MusicSearchService.searchAll('New Releases Albums 2026', { limit: 5 }),
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
      <div className="p-4 sm:p-6 md:p-10 space-y-8 text-[#F5F7FA] font-sans select-none max-w-6xl mx-auto min-h-screen pb-44 md:pb-28">
        
        {/* Header */}
        <div className="border-b border-white/[0.06] pb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Browse
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA1AD] mt-1">
            Discover music across genres, moods, regions, and decades.
          </p>
        </div>

        {/* Quick Search Bar Redirect */}
        <div className="max-w-xl">
          <div
            onClick={() => router.push('/search')}
            className="flex items-center bg-[#11141A] border border-white/10 hover:border-[#DFFF00]/40 rounded-2xl px-4 py-3 cursor-pointer transition-all duration-200 shadow-md group"
          >
            <Search className="h-4 w-4 text-[#9AA1AD] group-hover:text-[#DFFF00] mr-3 shrink-0 transition-colors" />
            <span className="text-xs sm:text-sm text-[#9AA1AD] font-medium">
              Search music, artists, albums, moods...
            </span>
          </div>
        </div>

        {/* Discovery Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 min-h-[40px]">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => router.push(`/search?q=${encodeURIComponent(chip)}`)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 bg-[#11141A] text-[#9AA1AD] hover:text-white hover:bg-[#171A21] border border-white/5 hover:border-white/15 transition-all cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* 1. Moods & Activities */}
        <div className="space-y-3.5 pt-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#DFFF00]" /> Mood &amp; Activity
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {MOODS.map((m) => {
              const Icon = m.icon;
              return (
                <NeoCard
                  key={m.id}
                  interactive
                  onClick={() => router.push(`/search?q=${encodeURIComponent(m.query)}`)}
                  className="p-4 cursor-pointer group space-y-2 hover:border-[#DFFF00]/40 transition-all min-h-[130px] flex flex-col justify-between"
                >
                  <div className="p-2.5 rounded-xl bg-white/5 text-[#DFFF00] group-hover:bg-[#DFFF00] group-hover:text-black transition-colors w-fit">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-white group-hover:text-[#DFFF00] transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-[10px] text-[#9AA1AD] line-clamp-2 mt-0.5">{m.desc}</p>
                  </div>
                </NeoCard>
              );
            })}
          </div>
        </div>

        {/* 2. Trending Now Section */}
        <div className="space-y-3.5 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#DFFF00]" /> Trending Now
            </h2>
            <button
              onClick={() => router.push('/search?q=Trending')}
              className="text-xs font-semibold text-[#9AA1AD] hover:text-white"
            >
              See all
            </button>
          </div>

          {isLoading ? (
            <NeoSkeleton variant="track" count={4} />
          ) : (
            <div className="space-y-1">
              {trendingTracks.map((trk, idx) => (
                <NeoTrackRow
                  key={trk.id}
                  track={trk}
                  index={idx}
                  showIndex={true}
                  playlistContext={trendingTracks}
                />
              ))}
            </div>
          )}
        </div>

        {/* 3. Genres & Soundscapes */}
        <div className="space-y-3.5 pt-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Compass className="h-4 w-4 text-[#00E5FF]" /> Genres &amp; Soundscapes
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {GENRES.map((g) => {
              const Icon = g.icon;
              return (
                <NeoCard
                  key={g.id}
                  interactive
                  onClick={() => router.push(`/search?q=${encodeURIComponent(g.query)}`)}
                  className="p-4 cursor-pointer group flex items-center gap-3.5 hover:border-[#00E5FF]/40 transition-all"
                >
                  <div className="p-3 rounded-xl bg-white/5 text-[#00E5FF] group-hover:bg-[#00E5FF] group-hover:text-black transition-colors shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#00E5FF] truncate transition-colors">
                      {g.title}
                    </h3>
                    <p className="text-[11px] text-[#9AA1AD] truncate mt-0.5">{g.desc}</p>
                  </div>
                </NeoCard>
              );
            })}
          </div>
        </div>

        {/* 4. Decades & Eras */}
        <div className="space-y-3.5 pt-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Disc3 className="h-4 w-4 text-[#DFFF00]" /> Decades &amp; Eras
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {DECADES.map((d) => (
              <NeoCard
                key={d.title}
                interactive
                onClick={() => router.push(`/search?q=${encodeURIComponent(d.query)}`)}
                className="p-3.5 text-center cursor-pointer group hover:border-[#DFFF00]/40 transition-all"
              >
                <div className="text-xs font-bold text-white group-hover:text-[#DFFF00] transition-colors">
                  {d.title}
                </div>
              </NeoCard>
            ))}
          </div>
        </div>

      </div>
    </FeatureErrorBoundary>
  );
}
