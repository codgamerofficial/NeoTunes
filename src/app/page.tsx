'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { 
  Play, 
  Pause, 
  Sparkles, 
  Clock, 
  TrendingUp, 
  Heart, 
  Compass, 
  ChevronRight, 
  Plus, 
  RotateCcw,
  Globe,
  Disc3,
  Flame,
  Moon,
  Brain,
  Dumbbell
} from 'lucide-react';
import { createClientBrowser } from '@/lib/supabase-browser';
import { Artwork } from '@/components/ui/Artwork';
import { NeoCard } from '@/components/ui/NeoCard';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoTrackRow } from '@/components/ui/NeoTrackRow';
import { NeoSkeleton } from '@/components/ui/NeoSkeleton';
import { useToast } from '@/components/ui/NeoToast';
import { Track, getArtistName } from '@/types';
import { resolveArtwork } from '@/utils/artwork';
import { MusicSearchService } from '@/services/MusicSearchService';

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

const QUICK_FILTERS = ['For You', 'Recently Played', 'Made For You', 'Trending', 'New Releases'];

const MOODS_LIST = [
  { id: 'focus', title: 'Deep Focus', desc: 'Flow state ambient & lofi', icon: Brain, color: '#DFFF00', query: 'Ambient Focus Concentration' },
  { id: 'chill', title: 'Late Night', desc: 'Warm acoustic & smooth lofi', icon: Moon, color: '#00E5FF', query: 'Lo-Fi Chill Beats' },
  { id: 'workout', title: 'Workout', desc: 'High energy EDM & hype', icon: Dumbbell, color: '#DFFF00', query: 'Gym Trap Workout' },
  { id: 'romance', title: 'Romantic', desc: 'Intimate vocal melodies', icon: Heart, color: '#00E5FF', query: 'Romantic Acoustic Songs' },
];

const REGIONAL_SOUNDS = [
  { id: 'bengali', title: 'Bengali Hits', desc: 'Modern & Classic Melodies', query: 'Bengali Top Hits' },
  { id: 'punjabi', title: 'Punjabi Hype', desc: 'Bhangra, Urban & Pop', query: 'Punjabi Top Hits' },
  { id: 'hindi', title: 'Bollywood Top 50', desc: 'Hindi Cinema & Indie', query: 'Hindi Top Hits' },
  { id: 'english', title: 'Global Pop', desc: 'International Pop & R&B', query: 'Global Pop Top Hits' },
];

export default function HomePage() {
  const router = useRouter();
  const { history, playTrack, currentTrack, isPlaying, setPlaying } = usePlaybackStore();
  const { showToast } = useToast();

  const [greeting, setGreeting] = useState('Good evening');
  const [userName, setUserName] = useState('Music Listener');
  const [activeFilter, setActiveFilter] = useState('For You');
  const [isSavedHero, setIsSavedHero] = useState(false);

  const [featuredTrack, setFeaturedTrack] = useState<Track | null>(null);
  const [madeForYouTracks, setMadeForYouTracks] = useState<Track[]>([]);
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
        const name = data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Music Listener';
        setUserName(name.split(' ')[0]);
      }
    });

    let isMounted = true;
    async function loadHomeData() {
      setIsLoading(true);
      try {
        const [featRes, madeForYouRes, trendRes, releaseRes] = await Promise.allSettled([
          MusicSearchService.searchAll('Where This Flower Blooms Tyler The Creator', { limit: 1 }),
          MusicSearchService.searchAll('Arijit Singh Pritam Hits', { limit: 6 }),
          MusicSearchService.searchAll('Trending Hits 2026', { limit: 5 }),
          MusicSearchService.searchAll('New Releases Albums 2026', { limit: 5 })
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

          if (madeForYouRes.status === 'fulfilled' && madeForYouRes.value?.songs) {
            const normalized = madeForYouRes.value.songs.map(normalizeTrack);
            const deduped = Array.from(new Map(normalized.map((t) => [t.id, t])).values());
            setMadeForYouTracks(deduped);
          }

          if (trendRes.status === 'fulfilled' && trendRes.value?.songs) {
            const normalized = trendRes.value.songs.map(normalizeTrack);
            const deduped = Array.from(new Map(normalized.map((t) => [t.id, t])).values());
            setTrendingTracks(deduped);
          }

          if (releaseRes.status === 'fulfilled' && releaseRes.value?.songs) {
            const normalized = releaseRes.value.songs.map(normalizeTrack);
            const deduped = Array.from(new Map(normalized.map((t) => [t.id, t])).values());
            setNewReleases(deduped);
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

  const activeHero = featuredTrack || normalizeTrack({
    id: 'feat_1',
    title: 'Where This Flower Blooms',
    artists: ['Tyler, The Creator', 'Frank Ocean'],
    album: 'Flower Boy',
    duration: 196
  });

  const isHeroPlaying = currentTrack?.id === activeHero.id && isPlaying;

  return (
    <div className="p-4 sm:p-6 md:p-10 space-y-8 text-[#F5F7FA] font-sans select-none max-w-7xl mx-auto min-h-screen">
      
      {/* Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {greeting}, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA1AD] mt-1">
            What's your sound today?
          </p>
        </div>

        {currentTrack && (
          <NeoButton
            variant="secondary"
            size="sm"
            onClick={() => router.push('/player')}
            className="self-start sm:self-auto"
          >
            <RotateCcw className="h-3.5 w-3.5 text-[#DFFF00]" /> Resume Listening
          </NeoButton>
        )}
      </div>

      {/* Quick Filter Navigation Chips */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 min-h-[40px]">
        {QUICK_FILTERS.map((cat) => {
          const isSelected = activeFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#DFFF00] text-black font-bold shadow-sm'
                  : 'bg-[#11141A] text-[#9AA1AD] hover:text-white border border-white/5 hover:border-white/15'
              }`}
            >
              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Primary Signature Hero Module */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#11141A] via-[#171A21] to-[#0B0D12] border border-white/[0.08] p-5 sm:p-8 overflow-hidden shadow-2xl group">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Artwork
            source={resolveArtwork(activeHero)}
            size="large"
            canonicalId={activeHero.id}
            type="track"
            className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl object-cover border border-white/10 shrink-0 shadow-2xl group-hover:scale-105 transition-transform duration-300"
          />

          <div className="space-y-2.5 text-center sm:text-left min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#DFFF00] px-3 py-1 rounded-full bg-[#DFFF00]/10 border border-[#DFFF00]/20">
              <Sparkles className="h-3 w-3 text-[#DFFF00]" /> FEATURED FOR YOU
            </span>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight line-clamp-1">
              {activeHero.title}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-[#9AA1AD]">
              {getArtistName(activeHero.artists || activeHero.artist)}
            </p>
            <p className="text-xs text-[#9AA1AD]/80 line-clamp-1">
              Album: {typeof activeHero.album === 'string' ? activeHero.album : 'Single'}
            </p>

            <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
              <NeoButton
                variant="primary"
                size="md"
                onClick={() => {
                  if (isHeroPlaying) {
                    setPlaying(false);
                  } else {
                    playTrack(activeHero);
                  }
                }}
              >
                {isHeroPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-black" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-black ml-0.5" /> Play
                  </>
                )}
              </NeoButton>

              <NeoButton
                variant="secondary"
                size="md"
                onClick={() => {
                  setIsSavedHero(!isSavedHero);
                  showToast(isSavedHero ? 'Removed from Library' : 'Saved to Library');
                }}
              >
                {isSavedHero ? <Heart className="w-4 h-4 fill-[#DFFF00] text-[#DFFF00]" /> : <Plus className="w-4 h-4" />}
                <span>{isSavedHero ? 'Saved' : 'Save'}</span>
              </NeoButton>
            </div>
          </div>
        </div>
      </div>

      {/* Made For You Carousel */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#DFFF00]" /> Made For You
          </h3>
          <button
            onClick={() => router.push('/browse')}
            className="text-xs font-semibold text-[#9AA1AD] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            See all <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {isLoading ? (
          <NeoSkeleton variant="card" count={5} />
        ) : (
          <div className="flex gap-4 overflow-x-auto scrollbar-none py-1">
            {madeForYouTracks.map((trk, idx) => (
              <NeoCard
                key={`${trk.id}_${idx}`}
                interactive
                onClick={() => playTrack(trk, madeForYouTracks)}
                className="w-36 sm:w-44 p-3 shrink-0 space-y-2.5 group"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white/5 border border-white/5">
                  <Artwork
                    source={resolveArtwork(trk)}
                    size="medium"
                    canonicalId={trk.id}
                    type="track"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute right-2 bottom-2 h-8 w-8 rounded-full bg-[#DFFF00] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <Play className="h-3.5 w-3.5 fill-black ml-0.5" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-xs text-white truncate group-hover:text-[#DFFF00] transition-colors">
                    {trk.title}
                  </h4>
                  <p className="text-[11px] text-[#9AA1AD] truncate mt-0.5">
                    {getArtistName(trk.artists || trk.artist)}
                  </p>
                </div>
              </NeoCard>
            ))}
          </div>
        )}
      </div>

      {/* Recently Played / Continue Listening */}
      {history.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#DFFF00]" /> Recently Played
            </h3>
            <button
              onClick={() => router.push('/history')}
              className="text-xs font-semibold text-[#9AA1AD] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              See all <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {history.slice(0, 6).map((rawTrk, idx) => {
              const trk = normalizeTrack(rawTrk);
              return (
                <NeoTrackRow
                  key={`${trk.id}_${idx}`}
                  track={trk}
                  showIndex={false}
                  showDuration={true}
                  playlistContext={history.map(normalizeTrack)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Trending Now */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#DFFF00]" /> Trending Now
          </h3>
          <button
            onClick={() => router.push('/search?q=Trending')}
            className="text-xs font-semibold text-[#9AA1AD] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            See all <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {isLoading ? (
          <NeoSkeleton variant="track" count={4} />
        ) : (
          <div className="space-y-1.5">
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
      </div>

      {/* Moods & Activities */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2">
          <Disc3 className="h-4 w-4 text-[#DFFF00]" /> Mood &amp; Activity
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MOODS_LIST.map((m) => {
            const Icon = m.icon;
            return (
              <NeoCard
                key={m.id}
                interactive
                onClick={() => router.push(`/search?q=${encodeURIComponent(m.query)}`)}
                className="p-4 cursor-pointer group space-y-2 hover:border-[#DFFF00]/40 transition-all min-h-[120px] flex flex-col justify-between"
              >
                <div className="p-2.5 rounded-xl bg-white/5 text-[#DFFF00] group-hover:bg-[#DFFF00] group-hover:text-black transition-colors w-fit">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white group-hover:text-[#DFFF00] transition-colors">
                    {m.title}
                  </h4>
                  <p className="text-[11px] text-[#9AA1AD] truncate mt-0.5">{m.desc}</p>
                </div>
              </NeoCard>
            );
          })}
        </div>
      </div>

      {/* Regional Sounds */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2">
          <Globe className="h-4 w-4 text-[#00E5FF]" /> Regional Music
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {REGIONAL_SOUNDS.map((r) => (
            <NeoCard
              key={r.id}
              interactive
              onClick={() => router.push(`/search?q=${encodeURIComponent(r.query)}`)}
              className="p-4 cursor-pointer group hover:border-[#00E5FF]/40 transition-all space-y-1"
            >
              <div className="text-xs font-bold text-white group-hover:text-[#00E5FF] truncate transition-colors">
                {r.title}
              </div>
              <p className="text-[11px] text-[#9AA1AD] truncate leading-snug">{r.desc}</p>
            </NeoCard>
          ))}
        </div>
      </div>

    </div>
  );
}
