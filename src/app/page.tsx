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
  Plus, 
  RotateCcw,
  Headphones,
  Check,
  Globe,
  Clock,
  TrendingUp,
  Brain,
  Moon,
  Dumbbell
} from 'lucide-react';
import { motion } from 'framer-motion';
import { createClientBrowser } from '@/lib/supabase-browser';
import { Artwork } from '@/components/ui/Artwork';
import { GlassCard } from '@/components/ui/GlassCard';
import { Track, getArtistName } from '@/types';
import { resolveArtwork } from '@/utils/artwork';
import { MusicSearchService } from '@/services/MusicSearchService';

const QUICK_FILTERS = ['For You', 'Recently Played', 'Made For You', 'Trending', 'New Releases'];

const MOODS_2COL = [
  { id: 'focus', title: 'Deep Focus', desc: 'Flow state ambient & lofi', icon: Brain, color: '#DFFF00', query: 'Ambient Focus Concentration' },
  { id: 'chill', title: 'Late Night', desc: 'Warm acoustic & smooth lofi', icon: Moon, color: '#00D9FF', query: 'Lo-Fi Chill Beats' },
  { id: 'workout', title: 'Workout', desc: 'High energy EDM trap & hype', icon: Dumbbell, color: '#DFFF00', query: 'Gym Trap Workout' },
  { id: 'romance', title: 'Romantic', desc: 'Intimate vocal ballads', icon: Heart, color: '#00D9FF', query: 'Romantic Acoustic Songs' },
];

const REGIONAL_SOUNDS = [
  { id: 'bengali', title: 'Bengali Hits', desc: 'Rabindra Sangeet & Bengali Rock', query: 'Bengali Top Hits' },
  { id: 'punjabi', title: 'Punjabi Hype', desc: 'Bhangra, Urban & Pop', query: 'Punjabi Top Hits' },
  { id: 'hindi', title: 'Bollywood Top 50', desc: 'Hindi Cinema & Indie Melodies', query: 'Hindi Top Hits' },
  { id: 'english', title: 'Global Pop', desc: 'International Pop & R&B Hits', query: 'Global Pop Top Hits' },
];

// Single normalized metadata layer helper
export function normalizeTrack(raw: any): Track {
  const id = raw?.id || raw?.canonicalId || `track_${Date.now()}`;
  const title = raw?.title || raw?.name || 'Untitled Track';
  const artistStr = getArtistName(raw?.artists || raw?.artist || 'NeoTunes Artist');
  const albumStr = typeof raw?.album === 'object' && raw?.album ? (raw.album.name || raw.album.title) : (raw?.album || 'Single');
  const artworkUrl = resolveArtwork(raw);
  const duration = typeof raw?.duration === 'number' && raw.duration > 0 ? raw.duration : (raw?.durationMs ? Math.floor(raw.durationMs / 1000) : 184);

  return {
    id,
    canonicalId: id,
    title,
    artist: artistStr,
    artists: Array.isArray(raw?.artists) ? raw.artists : [artistStr],
    album: albumStr,
    artworkUrl,
    coverUrl: artworkUrl,
    duration,
    durationMs: duration * 1000,
    source: raw?.source || 'spotify',
    sourceId: raw?.sourceId || id,
    playable: true,
  };
}

export default function HomePage() {
  const router = useRouter();
  const { history, playTrack, currentTrack, isPlaying, setPlaying, addToQueue } = usePlaybackStore();

  const [greeting, setGreeting] = useState('Good evening');
  const [userName, setUserName] = useState('Saswata');
  const [activeFilter, setActiveFilter] = useState('For You');
  const [isSavedFeatured, setIsSavedFeatured] = useState(false);

  const [featuredTrack, setFeaturedTrack] = useState<Track | null>(null);
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [newReleases, setNewReleases] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Good morning');
    else if (hour >= 12 && hour < 17) setGreeting('Good afternoon');
    else if (hour >= 17 && hour < 22) setGreeting('Good evening');
    else setGreeting('Good night');

    const supabase = createClientBrowser();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        const name = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Saswata';
        setUserName(name.split(' ')[0]);
      }
    });

    let isMounted = true;
    async function loadHomeData() {
      setIsLoading(true);
      try {
        const [featRes, trendRes, releaseRes] = await Promise.allSettled([
          MusicSearchService.searchAll('Where This Flower Blooms Tyler The Creator', { limit: 1 }),
          MusicSearchService.searchAll('Trending Hits 2026', { limit: 4 }),
          MusicSearchService.searchAll('New Music Releases 2026', { limit: 4 })
        ]);

        if (isMounted) {
          if (featRes.status === 'fulfilled' && featRes.value.songs && featRes.value.songs.length > 0) {
            setFeaturedTrack(normalizeTrack(featRes.value.songs[0]));
          } else {
            setFeaturedTrack(normalizeTrack({
              id: 'feat_1',
              title: 'Where This Flower Blooms',
              artists: ['Tyler, The Creator', 'Frank Ocean'],
              album: 'Flower Boy',
              duration: 196
            }));
          }

          if (trendRes.status === 'fulfilled' && trendRes.value.songs) {
            setTrendingTracks(trendRes.value.songs.map(normalizeTrack));
          }

          if (releaseRes.status === 'fulfilled' && releaseRes.value.songs) {
            setNewReleases(releaseRes.value.songs.map(normalizeTrack));
          }
        }
      } catch (err) {
        console.warn('Home page data load error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeFeatured = featuredTrack || normalizeTrack({
    id: 'feat_1',
    title: 'Where This Flower Blooms',
    artists: ['Tyler, The Creator', 'Frank Ocean'],
    album: 'Flower Boy',
    duration: 196
  });

  const formatTime = (seconds?: number) => {
    if (!seconds || isNaN(seconds)) return '3:15';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-8 text-[#F5F5F7] font-sans select-none pb-44 md:pb-28 max-w-[1550px] mx-auto min-h-screen">
      
      {/* ── 1. COMPACT GREETING HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {greeting}, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1A6] mt-0.5">
            Your music, your mood, your sound.
          </p>
        </div>

        {currentTrack && (
          <button
            onClick={() => router.push('/player')}
            className="px-4 py-2 rounded-full bg-white/[0.08] border border-white/15 text-[#F5F5F7] hover:border-[#DFFF00] hover:text-[#DFFF00] text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-sm shrink-0"
          >
            <RotateCcw className="h-4 w-4" /> Resume Listening
          </button>
        )}
      </div>

      {/* ── 2. QUICK FILTER PILLS ── */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 min-h-[40px]">
        {QUICK_FILTERS.map((cat) => {
          const isSelected = activeFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-2 rounded-full text-xs font-mono font-bold shrink-0 transition-all cursor-pointer h-[38px] flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#DFFF00] text-black font-extrabold shadow-sm'
                  : 'bg-white/[0.045] text-[#A1A1A6] hover:text-white border border-white/10 hover:border-white/20'
              }`}
            >
              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* ── 3. HORIZONTAL FEATURED MUSIC CARD ── */}
      <GlassCard className="p-5 sm:p-7 relative overflow-hidden group border-white/10 hover:border-[#DFFF00]/40 transition-all">
        <div className="relative z-10 space-y-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#DFFF00] px-2.5 py-1 rounded-full bg-white/10 border border-white/10 inline-block">
            FEATURED FOR YOU
          </span>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Artwork
              source={resolveArtwork(activeFeatured)}
              size="large"
              canonicalId={activeFeatured.id}
              type="track"
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl object-cover border border-white/10 shrink-0 shadow-2xl group-hover:scale-105 transition-transform duration-300"
            />

            <div className="space-y-2 text-center sm:text-left min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight line-clamp-1">
                {activeFeatured.title}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-[#A1A1A6]">
                {getArtistName(activeFeatured.artists || activeFeatured.artist)}
              </p>
              <p className="text-xs text-[#A1A1A6] line-clamp-1 font-mono pt-1">
                Album: {typeof activeFeatured.album === 'string' ? activeFeatured.album : 'Single'}
              </p>

              <div className="pt-3 flex items-center justify-center sm:justify-start gap-3">
                <button
                  onClick={() => playTrack(activeFeatured)}
                  className="px-5 py-2.5 rounded-full bg-[#DFFF00] text-black text-xs font-mono font-bold uppercase tracking-wider hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 shadow-md"
                >
                  <Play className="w-4 h-4 fill-black text-black" /> Play
                </button>

                <button
                  onClick={() => setIsSavedFeatured(!isSavedFeatured)}
                  className={`px-4 py-2.5 rounded-full border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSavedFeatured 
                      ? 'bg-[#DFFF00]/15 border-[#DFFF00] text-[#DFFF00]' 
                      : 'bg-white/[0.045] border-white/10 text-[#A1A1A6] hover:text-white'
                  }`}
                >
                  {isSavedFeatured ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{isSavedFeatured ? 'Saved ✓' : 'Save'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ── 4. RECENTLY PLAYED (User History Integration) ── */}
      {history.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#DFFF00]" /> RECENTLY PLAYED
            </span>
            <button
              onClick={() => router.push('/history')}
              className="text-xs font-mono font-bold text-[#A1A1A6] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              See all <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto scrollbar-none py-1">
            {history.slice(0, 6).map((rawTrk) => {
              const trk = normalizeTrack(rawTrk);
              return (
                <GlassCard
                  key={trk.id}
                  onClick={() => playTrack(trk)}
                  className="w-40 p-3 shrink-0 cursor-pointer group hover:border-[#DFFF00]/40 transition-all space-y-2.5"
                >
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white/5 border border-white/10">
                    <Artwork
                      source={resolveArtwork(trk)}
                      size="medium"
                      canonicalId={trk.id}
                      type="track"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
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
              );
            })}
          </div>
        </div>
      )}

      {/* ── 5. TRENDING NOW ── */}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {isLoading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-white/[0.045] border border-white/10 animate-pulse" />
            ))
          ) : (
            trendingTracks.map((trk) => {
              const isCurrent = currentTrack?.id === trk.id;
              return (
                <GlassCard
                  key={trk.id}
                  onClick={() => playTrack(trk)}
                  className="p-3 flex items-center justify-between cursor-pointer group hover:border-[#DFFF00]/40 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Artwork
                      source={resolveArtwork(trk)}
                      size="small"
                      canonicalId={trk.id}
                      type="track"
                      className="h-12 w-12 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs font-bold truncate group-hover:text-[#DFFF00] transition-colors ${
                        isCurrent ? 'text-[#DFFF00]' : 'text-[#F5F5F7]'
                      }`}>
                        {trk.title}
                      </div>
                      <div className="text-[11px] text-[#A1A1A6] truncate mt-0.5">
                        {getArtistName(trk.artists || trk.artist)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono text-[#A1A1A6]">
                      {formatTime(trk.duration)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToQueue(trk);
                      }}
                      className="p-2 rounded-full bg-white/5 hover:bg-[#DFFF00] hover:text-black text-[#A1A1A6] transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                      title="Add to queue"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>
      </div>

      {/* ── 6. MOOD & ACTIVITY (Compact 2-Column Grid ~130px Height) ── */}
      <div className="space-y-3 pt-2">
        <span className="text-xs font-mono font-bold text-[#A1A1A6] uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#DFFF00]" /> MOOD &amp; ACTIVITY
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

      {/* ── 7. REGIONAL SOUNDS ── */}
      <div className="space-y-3 pt-2">
        <span className="text-xs font-mono font-bold text-[#A1A1A6] uppercase tracking-wider flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-[#00D9FF]" /> REGIONAL MUSIC
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {REGIONAL_SOUNDS.map((r) => (
            <GlassCard
              key={r.id}
              onClick={() => router.push(`/search?q=${encodeURIComponent(r.query)}`)}
              className="p-3.5 cursor-pointer group hover:border-[#00D9FF]/40 transition-all space-y-1"
            >
              <div className="text-xs font-bold text-white group-hover:text-[#00D9FF] truncate transition-colors">
                {r.title}
              </div>
              <p className="text-[10px] text-[#A1A1A6] truncate leading-snug">{r.desc}</p>
            </GlassCard>
          ))}
        </div>
      </div>

    </div>
  );
}
