'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { 
  Play, 
  Sparkles, 
  Flame, 
  Heart, 
  Zap, 
  Dumbbell, 
  Moon, 
  Coffee, 
  Music2, 
  TrendingUp, 
  Disc, 
  Plus, 
  Bookmark, 
  Check, 
  RefreshCw,
  Sun,
  CloudRain,
  Car,
  Brain,
  Compass
} from 'lucide-react';
import { motion } from 'framer-motion';
import { createClientBrowser } from '@/lib/supabase-browser';
import { MusicSearchService } from '@/services/MusicSearchService';
import { Artwork } from '@/components/ui/Artwork';
import { toCanonicalTrack } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const { history, playTrack, addToQueue, currentTrack } = usePlaybackStore();

  const [greeting, setGreeting] = useState('Good Evening');
  const [userName, setUserName] = useState('Saswata');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newReleaseTab, setNewReleaseTab] = useState<'For You' | 'Following' | 'India' | 'Global'>('For You');
  const [surpriseTrack, setSurpriseTrack] = useState<any | null>(null);
  const [savedDiscover, setSavedDiscover] = useState(false);

  const [trendingTracks, setTrendingTracks] = useState<any[]>([]);
  const [newReleases, setNewReleases] = useState<any[]>([]);
  const [popularIndianTracks, setPopularIndianTracks] = useState<any[]>([]);
  const [isLoadingHomeData, setIsLoadingHomeData] = useState(true);

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
      } else {
        const localUser = localStorage.getItem('neotunes_user');
        if (localUser) {
          try {
            const parsed = JSON.parse(localUser);
            if (parsed.name) setUserName(parsed.name.split(' ')[0]);
          } catch {}
        }
      }
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadHomeData() {
      setIsLoadingHomeData(true);
      try {
        const [trendingRes, newRes, indianRes] = await Promise.allSettled([
          MusicSearchService.searchAll('Trending Hits 2026'),
          MusicSearchService.searchAll('New Music Friday'),
          MusicSearchService.searchAll('Arijit Singh'),
        ]);

        if (isMounted) {
          if (trendingRes.status === 'fulfilled') setTrendingTracks(trendingRes.value.songs.slice(0, 6));
          if (newRes.status === 'fulfilled') setNewReleases(newRes.value.songs.slice(0, 6));
          if (indianRes.status === 'fulfilled') setPopularIndianTracks(indianRes.value.songs.slice(0, 6));
        }
      } catch (err) {
        console.warn('Home data load error:', err);
      } finally {
        if (isMounted) setIsLoadingHomeData(false);
      }
    }

    loadHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Category Chips (Spec 6)
  const categoryChips = ['All', 'Hindi', 'Bengali', 'English', 'Punjabi', 'Tamil', 'Telugu', 'Lo-fi', 'Workout'];

  // Continue Listening / Recently Played from User Store History
  const continueListeningItems = history.length > 0 ? history.slice(0, 4) : trendingTracks.slice(0, 4);

  // Mood Grid Data (Spec 14)
  const moods = [
    { label: 'Late Night', icon: Moon, desc: 'Mellow acoustic & lo-fi', query: 'Lo-Fi Chill' },
    { label: 'Energy', icon: Zap, desc: 'High BPM hype tracks', query: 'Workout Hype' },
    { label: 'Romance', icon: Heart, desc: 'Soulful vocal ballads', query: 'Romantic Hits' },
    { label: 'Focus', icon: Brain, desc: 'Instrumental concentration', query: 'Focus Ambient' },
    { label: 'Rainy', icon: CloudRain, desc: 'Warm acoustic vibes', query: 'Acoustic Rain' },
    { label: 'Drive', icon: Car, desc: 'Synthwave & road trips', query: 'Late Night Drive' },
    { label: 'Workout', icon: Dumbbell, desc: 'Heavy bass gym hits', query: 'Gym Trap' },
    { label: 'Morning', icon: Sun, desc: 'Upbeat acoustic sunrise', query: 'Morning Acoustic' },
  ];

  const handleSurpriseMe = () => {
    if (trendingTracks.length > 0) {
      const picked = trendingTracks[Math.floor(Math.random() * trendingTracks.length)];
      setSurpriseTrack({
        ...picked,
        reason: `Handpicked track: ${picked.title} by ${picked.artist || picked.artists?.join(', ')}`,
      });
    }
  };

  const madeForYou = [
    {
      id: 'mix-1',
      title: 'Daily Mix 1',
      desc: 'Arijit Singh, Pritam, Shreya Ghoshal and more',
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
    },
    {
      id: 'mix-2',
      title: 'Bengali Hits Mix',
      desc: 'Anupam Roy, Fossils, Cactus, Rupam Islam',
      cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80',
    },
    {
      id: 'mix-3',
      title: 'Chill & Relax',
      desc: 'Ambient, acoustic, and soft melodies for your mood',
      cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
    },
    {
      id: 'mix-4',
      title: 'Pop & EDM Beats',
      desc: 'The Weeknd, Dua Lipa, Calvin Harris, Martin Garrix',
      cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
    },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 space-y-10 bg-[#000000] text-[#F4F1F7] font-sans select-none pb-36 max-w-[1500px] mx-auto">
      
      {/* ── 1. GREETING & CATEGORY CHIPS ── */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {greeting}, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-[#A8A7AF] font-medium pt-0.5">
            Here's what sounds right for you.
          </p>
        </div>

        {/* Scrollable Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1">
          {categoryChips.map((chip) => {
            const isSelected = selectedCategory === chip;
            return (
              <button
                key={chip}
                onClick={() => setSelectedCategory(chip)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#AFC7FF] text-black shadow-[0_0_12px_rgba(175,199,255,0.4)]'
                    : 'bg-[#17181D] hover:bg-white/10 text-white/70 border border-white/5'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. CONTINUE LISTENING (PRIMARY SECTION) ── */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
          Continue listening
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {continueListeningItems.map((item) => (
            <div
              key={item.id}
              onClick={() => playTrack(toCanonicalTrack({
                id: item.id,
                title: item.title,
                artist: item.artist,
                coverUrl: item.cover,
                durationMs: item.durationMs,
                sourceType: 'youtube',
              }))}
              className="p-3 rounded-2xl bg-[#121318] hover:bg-[#17181D] border border-white/10 flex items-center gap-3.5 cursor-pointer transition-all group"
            >
              <img src={item.cover} alt={item.title} className="h-14 w-14 rounded-xl object-cover flex-shrink-0" />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="text-xs font-bold text-white truncate group-hover:text-[#AFC7FF] transition-colors">{item.title}</div>
                <div className="text-[11px] text-[#A8A7AF] truncate">{item.artist}</div>
                
                {/* Progress Bar */}
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#AFC7FF] rounded-full" style={{ width: `${item.progress}%` }} />
                </div>
              </div>

              <button className="h-8 w-8 rounded-full bg-[#AFC7FF] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <Play className="h-4 w-4 fill-black ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. MADE FOR YOU ── */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
          Made for you
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {madeForYou.map((mix) => (
            <motion.div
              key={mix.id}
              whileHover={{ y: -4 }}
              onClick={() => playTrack(toCanonicalTrack({
                id: mix.id,
                title: mix.title,
                artist: mix.desc,
                coverUrl: mix.cover,
                durationMs: 240000,
                sourceType: 'youtube',
              }))}
              className="p-4 rounded-2xl bg-[#121318] hover:bg-[#17181D] border border-white/10 space-y-3 cursor-pointer group transition-all"
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-lg border border-white/10">
                <img src={mix.cover} alt={mix.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <button className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-[#AFC7FF] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <Play className="h-5 w-5 fill-black ml-0.5" />
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-black text-white truncate group-hover:text-[#AFC7FF] transition-colors">{mix.title}</h3>
                <p className="text-xs text-[#A8A7AF] line-clamp-2">{mix.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── 4. ONE DISCOVERY HERO ── */}
      <div className="relative p-6 sm:p-8 rounded-[32px] bg-gradient-to-r from-[#121318] via-[#17181D] to-[#121318] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl overflow-hidden">
        <div className="space-y-3 text-center md:text-left max-w-xl">
          <span className="text-xs font-mono font-bold text-[#AFC7FF] uppercase tracking-wider flex items-center justify-center md:justify-start gap-1.5">
            <Sparkles className="h-4 w-4" /> Discover Something New
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Fresh Discoveries</h2>
          <p className="text-xs sm:text-sm text-[#A8A7AF]">Fresh sounds picked for your taste · 24 songs · 1h 32m</p>

          <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
            <button
              onClick={() => playTrack(toCanonicalTrack({
                id: 'fresh-discoveries-hero',
                title: 'Fresh Discoveries',
                artist: 'Various Artists',
                coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
                durationMs: 5500000,
                sourceType: 'youtube',
              }))}
              className="px-6 py-2.5 rounded-full bg-[#AFC7FF] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(175,199,255,0.4)] hover:scale-105 transition-transform cursor-pointer"
            >
              <Play className="h-4 w-4 fill-black" /> Play Hero Mix
            </button>
            <button className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer">
              + Save Playlist
            </button>
          </div>
        </div>

        <img
          src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80"
          alt="Fresh Discoveries"
          className="h-44 w-44 md:h-52 md:w-52 rounded-2xl object-cover shadow-2xl border border-white/15 flex-shrink-0"
        />
      </div>

      {/* ── 5. BECAUSE YOU LISTEN TO ARIJIT SINGH ── */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight">Because you listen to Arijit Singh</h2>
          <p className="text-xs text-[#A8A7AF]">More emotional vocals and modern Hindi production.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {popularIndianTracks.slice(0, 4).map((tr) => (
            <div
              key={tr.canonicalId || tr.id}
              onClick={() => playTrack(tr)}
              className="p-3 rounded-2xl bg-[#121318] hover:bg-[#17181D] border border-white/10 flex items-center gap-3.5 cursor-pointer transition-all group"
            >
              <Artwork
                source={tr.artworkUrl || tr.coverUrl}
                size="small"
                canonicalId={tr.canonicalId || tr.id}
                type="track"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate group-hover:text-[#AFC7FF] transition-colors">{tr.title}</div>
                <div className="text-[11px] text-[#A8A7AF] truncate">{Array.isArray(tr.artists) ? tr.artists.join(', ') : tr.artist || 'Arijit Singh'}</div>
              </div>
              <button className="h-8 w-8 rounded-full bg-[#AFC7FF] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <Play className="h-4 w-4 fill-black ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. NEO DISCOVER SIGNATURE PLAYLIST ── */}
      <div className="p-6 rounded-[28px] bg-[#121318] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-mono font-bold text-[#AFC7FF] uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
            <Sparkles className="h-4 w-4" /> Neo Discover
          </span>
          <h3 className="text-xl font-black text-white">Fresh Music Selected Around Your Taste</h3>
          <p className="text-xs text-[#A8A7AF]">Curated live radio mix</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (trendingTracks.length > 0) playTrack(trendingTracks[0], trendingTracks);
            }}
            className="px-5 py-2.5 rounded-full bg-[#AFC7FF] text-black text-xs font-black uppercase flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer"
          >
            <Play className="h-4 w-4 fill-black" /> Play
          </button>
          <button
            onClick={() => setSavedDiscover(!savedDiscover)}
            className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {savedDiscover ? <Check className="h-4 w-4 text-[#AFC7FF]" /> : <Bookmark className="h-4 w-4" />}
            <span>{savedDiscover ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* ── 7. WHAT'S YOUR VIBE? (MOOD GRID) ── */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-white tracking-tight">What's your vibe?</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {moods.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.label}
                onClick={() => router.push(`/search?q=${encodeURIComponent(m.query || m.label)}`)}
                className="p-4 rounded-2xl bg-[#121318] hover:bg-[#17181D] border border-white/10 flex items-center gap-3 cursor-pointer transition-all group"
              >
                <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-[#AFC7FF]/20 group-hover:text-[#AFC7FF] text-white/80 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-[#AFC7FF] transition-colors">{m.label}</div>
                  <div className="text-[10px] text-[#A8A7AF]">{m.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 8. NEW RELEASES ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white tracking-tight">New releases</h2>

          <div className="flex items-center gap-1 bg-[#121318] p-1 rounded-full border border-white/10 text-xs">
            {(['For You', 'Following', 'India', 'Global'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setNewReleaseTab(tab)}
                className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                  newReleaseTab === tab ? 'bg-[#AFC7FF] text-black' : 'text-[#A8A7AF] hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {newReleases.map((rel) => (
            <div
              key={rel.canonicalId || rel.id}
              onClick={() => playTrack(rel)}
              className="p-4 rounded-2xl bg-[#121318] hover:bg-[#17181D] border border-white/10 space-y-3 cursor-pointer group transition-all"
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-lg border border-white/10">
                <Artwork
                  source={rel.artworkUrl || rel.coverUrl}
                  size="large"
                  canonicalId={rel.canonicalId || rel.id}
                  type="track"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/60 text-white border border-white/20">
                  New
                </span>
                <button className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-[#AFC7FF] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <Play className="h-4 w-4 fill-black ml-0.5" />
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="text-xs font-bold text-white truncate group-hover:text-[#AFC7FF] transition-colors">{rel.title}</h3>
                <p className="text-[11px] text-[#A8A7AF] truncate">{Array.isArray(rel.artists) ? rel.artists.join(', ') : rel.artist || 'Artist'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 9. TRENDING NOW (COMPACT RANKED LIST) ── */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-white tracking-tight">Trending now</h2>

        <div className="p-4 rounded-3xl bg-[#121318] border border-white/10 divide-y divide-white/5">
          {trendingTracks.map((tr, idx) => (
            <div
              key={tr.canonicalId || tr.id}
              onClick={() => playTrack(tr)}
              className="flex items-center justify-between py-3 px-2 hover:bg-white/5 rounded-xl transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-sm font-mono font-black text-[#AFC7FF] w-6 text-center">0{idx + 1}</span>
                <Artwork
                  source={tr.artworkUrl || tr.coverUrl}
                  size="small"
                  canonicalId={tr.canonicalId || tr.id}
                  type="track"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white group-hover:text-[#AFC7FF] transition-colors truncate">{tr.title}</div>
                  <div className="text-[11px] text-[#A8A7AF] truncate">{Array.isArray(tr.artists) ? tr.artists.join(', ') : tr.artist || 'Artist'}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                {tr.duration > 0 && (
                  <span className="text-xs font-mono text-[#A8A7AF] font-bold hidden sm:inline">
                    {Math.floor(tr.duration / 60)}:{String(tr.duration % 60).padStart(2, '0')}
                  </span>
                )}
                <button className="h-8 w-8 rounded-full bg-[#AFC7FF] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-4 w-4 fill-black ml-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 10. YOUR ARTISTS ── */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-white tracking-tight">Your artists</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: 'Arijit Singh', avatar: 'https://i.scdn.co/image/ab676161000551ed0261696c9736696b2964f762' },
            { name: 'The Weeknd', avatar: 'https://i.scdn.co/image/ab6761610000e5eb214f3ed063077717d517414e' },
            { name: 'Shreya Ghoshal', avatar: 'https://i.scdn.co/image/ab676161000551ed3bb053531b816a3cb8510842' },
            { name: 'Diljit Dosanjh', avatar: 'https://i.scdn.co/image/ab676161000551ed81e3ec9c6f2e0a29487d6568' },
          ].map((art) => (
            <div
              key={art.name}
              onClick={() => router.push(`/artists/${encodeURIComponent(art.name.toLowerCase().replace(/\s+/g, '-'))}`)}
              className="p-4 rounded-2xl bg-[#121318] hover:bg-[#17181D] border border-white/10 flex items-center gap-3 cursor-pointer transition-all group"
            >
              <img src={art.avatar} alt={art.name} className="h-12 w-12 rounded-full object-cover flex-shrink-0 border border-white/15" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white group-hover:text-[#AFC7FF] transition-colors truncate">{art.name}</div>
                <div className="text-[10px] text-[#AFC7FF] font-bold">Verified Artist</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 11. SURPRISE ME (CONTROLLED NOVELTY) ── */}
      <div className="p-6 rounded-[28px] bg-gradient-to-r from-[#121318] via-[#17181D] to-[#121318] border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-[#AFC7FF] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> Controlled Novelty
            </span>
            <h3 className="text-xl font-black text-white">✨ Surprise Me</h3>
            <p className="text-xs text-[#A8A7AF]">Step outside your usual listening patterns into fresh territory.</p>
          </div>

          <button
            onClick={handleSurpriseMe}
            className="px-6 py-2.5 rounded-full bg-[#AFC7FF] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer shrink-0"
          >
            <Sparkles className="h-4 w-4" /> Surprise Me
          </button>
        </div>

        {surpriseTrack && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-[#17181D] border border-white/10 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img src={surpriseTrack.coverUrl} alt={surpriseTrack.title} className="h-12 w-12 rounded-xl object-cover flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{surpriseTrack.title}</div>
                <div className="text-[11px] text-[#AFC7FF] font-bold truncate">{surpriseTrack.artist}</div>
                <div className="text-[10px] text-[#A8A7AF] pt-0.5 truncate">{surpriseTrack.reason}</div>
              </div>
            </div>

            <button
              onClick={() => playTrack(toCanonicalTrack({
                id: surpriseTrack.id,
                title: surpriseTrack.title,
                artist: surpriseTrack.artist,
                coverUrl: surpriseTrack.coverUrl,
                durationMs: 210000,
                sourceType: 'youtube',
              }))}
              className="h-10 w-10 rounded-full bg-[#AFC7FF] text-black flex items-center justify-center flex-shrink-0 shadow-lg cursor-pointer"
            >
              <Play className="h-5 w-5 fill-black ml-0.5" />
            </button>
          </motion.div>
        )}
      </div>

    </div>
  );
}
