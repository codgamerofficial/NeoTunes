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
  Plus, 
  RotateCcw,
  Globe, 
  Disc3, 
  Moon, 
  Brain, 
  Dumbbell,
  Flame,
  Radio
} from 'lucide-react';
import { createClientBrowser } from '@/lib/supabase-browser';
import { Artwork } from '@/components/ui/Artwork';
import { NeoCard } from '@/components/ui/NeoCard';
import { NeoButton } from '@/components/ui/NeoButton';
import { NeoTrackRow } from '@/components/ui/NeoTrackRow';
import { NeoSkeleton } from '@/components/ui/NeoSkeleton';
import { NeoChip } from '@/components/ui/NeoChip';
import { NeoSection } from '@/components/ui/NeoSection';
import { useToast } from '@/components/ui/NeoToast';
import { Track, getArtistName } from '@/types';
import { resolveArtwork } from '@/utils/artwork';
import { MusicSearchService } from '@/services/MusicSearchService';
import { normalizeTrack } from '@/services/normalizeTrack';

const QUICK_FILTERS = ['For You', 'Recently Played', 'Made For You', 'Trending', 'New Releases'];

const MOODS_LIST = [
  { id: 'focus', title: 'Deep Focus', desc: 'Flow state ambient & lofi', icon: Brain, color: '#DFFF00', query: 'Ambient Focus Concentration' },
  { id: 'chill', title: 'Late Night', desc: 'Warm acoustic & smooth lofi', icon: Moon, color: '#00E5FF', query: 'Lo-Fi Chill Beats' },
  { id: 'workout', title: 'Workout Hype', desc: 'High energy EDM & trap', icon: Dumbbell, color: '#DFFF00', query: 'Gym Trap Workout' },
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

  const isHeroPlaying = (currentTrack?.id === activeHero.id || currentTrack?.canonicalId === activeHero.canonicalId) && isPlaying;
  const heroArtwork = resolveArtwork(activeHero);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 text-[#F5F7FA] font-sans select-none max-w-7xl mx-auto min-h-screen">
      
      {/* ── 1. TOP GREETING & RESUME BAR ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {greeting}, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA1AD] mt-1 font-medium">
            Explore personalized soundtracks and intelligent audio streams.
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

      {/* ── 2. QUICK FILTER NAVIGATION CHIPS ── */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 min-h-[44px]">
        {QUICK_FILTERS.map((cat) => (
          <NeoChip
            key={cat}
            selected={activeFilter === cat}
            onClick={() => setActiveFilter(cat)}
          >
            {cat}
          </NeoChip>
        ))}
      </div>

      {/* ── 3. SIGNATURE DYNAMIC HERO MODULE ── */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#11141A] via-[#171A21] to-[#0B0D12] border border-white/[0.1] p-5 sm:p-8 overflow-hidden shadow-2xl group">
        {/* Ambient Artwork Light Glow */}
        {heroArtwork && (
          <div
            className="absolute right-0 top-0 bottom-0 w-1/2 bg-cover bg-center filter blur-[60px] opacity-20 pointer-events-none transition-all duration-700 group-hover:opacity-30"
            style={{ backgroundImage: `url(${heroArtwork})` }}
          />
        )}

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Artwork
            source={heroArtwork}
            size="large"
            canonicalId={activeHero.id}
            type="track"
            className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl object-cover border border-white/10 shrink-0 shadow-2xl group-hover:scale-105 transition-transform duration-300"
          />

          <div className="space-y-3 text-center sm:text-left min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#DFFF00] px-3 py-1 rounded-full bg-[#DFFF00]/10 border border-[#DFFF00]/25">
              <Sparkles className="h-3 w-3 text-[#DFFF00]" /> FEATURED FOR YOU
            </span>

            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight line-clamp-1">
                {activeHero.title}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-[#9AA1AD] mt-1">
                {getArtistName(activeHero.artists || activeHero.artist)}
              </p>
              <p className="text-xs text-[#9AA1AD]/70 line-clamp-1 mt-0.5">
                Album: {typeof activeHero.album === 'string' ? activeHero.album : 'Single'}
              </p>
            </div>

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
                    <Pause className="w-4 h-4 fill-black text-black" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-black text-black ml-0.5" /> Play Now
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
                {isSavedHero ? (
                  <Heart className="w-4 h-4 fill-[#DFFF00] text-[#DFFF00]" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>{isSavedHero ? 'Saved' : 'Save'}</span>
              </NeoButton>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. MADE FOR YOU SHELF ── */}
      <NeoSection
        title="Made For You"
        subtitle="Handpicked algorithmic mixes and trending discoveries"
        icon={<Sparkles className="h-4 w-4 text-[#DFFF00]" />}
        actionText="See all"
        onAction={() => router.push('/browse')}
      >
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
                  <div className="absolute right-2 bottom-2 h-9 w-9 rounded-full bg-[#DFFF00] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg active:scale-95">
                    <Play className="h-4 w-4 fill-black ml-0.5" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white truncate group-hover:text-[#DFFF00] transition-colors">
                    {trk.title}
                  </h4>
                  <p className="text-[11px] text-[#9AA1AD] truncate mt-0.5 font-medium">
                    {getArtistName(trk.artists || trk.artist)}
                  </p>
                </div>
              </NeoCard>
            ))}
          </div>
        )}
      </NeoSection>

      {/* ── 5. RECENTLY PLAYED / CONTINUE LISTENING ── */}
      {history.length > 0 && (
        <NeoSection
          title="Recently Played"
          subtitle="Continue where you left off"
          icon={<Clock className="h-4 w-4 text-[#DFFF00]" />}
          actionText="See all"
          onAction={() => router.push('/history')}
        >
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
        </NeoSection>
      )}

      {/* ── 6. TRENDING NOW ── */}
      <NeoSection
        title="Trending Now"
        subtitle="Chart-toppers and viral streaming hits"
        icon={<TrendingUp className="h-4 w-4 text-[#DFFF00]" />}
        actionText="Explore Charts"
        onAction={() => router.push('/search?q=Trending')}
      >
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
      </NeoSection>

      {/* ── 7. MOODS & ACTIVITY (Selective Neubrutalism) ── */}
      <NeoSection
        title="Mood & Activity"
        subtitle="Curated sonic environments tailored to your mindset"
        icon={<Disc3 className="h-4 w-4 text-[#DFFF00]" />}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {MOODS_LIST.map((m) => {
            const Icon = m.icon;
            return (
              <NeoCard
                key={m.id}
                interactive
                onClick={() => router.push(`/search?q=${encodeURIComponent(m.query)}`)}
                className="p-4 cursor-pointer group space-y-3 hover:border-[#DFFF00]/40 transition-all min-h-[130px] flex flex-col justify-between"
              >
                <div className="p-2.5 rounded-xl bg-white/5 text-[#DFFF00] group-hover:bg-[#DFFF00] group-hover:text-black transition-colors w-fit shadow-sm">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-white group-hover:text-[#DFFF00] transition-colors">
                    {m.title}
                  </h4>
                  <p className="text-[11px] text-[#9AA1AD] truncate mt-0.5 font-medium">{m.desc}</p>
                </div>
              </NeoCard>
            );
          })}
        </div>
      </NeoSection>

      {/* ── 8. REGIONAL SOUNDS ── */}
      <NeoSection
        title="Regional Music"
        subtitle="Discover rich cultural and linguistic soundscapes"
        icon={<Globe className="h-4 w-4 text-[#00E5FF]" />}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {REGIONAL_SOUNDS.map((r) => (
            <NeoCard
              key={r.id}
              interactive
              onClick={() => router.push(`/search?q=${encodeURIComponent(r.query)}`)}
              className="p-4 cursor-pointer group hover:border-[#00E5FF]/40 transition-all space-y-1.5"
            >
              <div className="text-xs sm:text-sm font-extrabold text-white group-hover:text-[#00E5FF] truncate transition-colors">
                {r.title}
              </div>
              <p className="text-[11px] text-[#9AA1AD] truncate leading-snug font-medium">{r.desc}</p>
            </NeoCard>
          ))}
        </div>
      </NeoSection>

    </div>
  );
}
