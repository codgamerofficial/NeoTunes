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
  Compass,
  Radio,
  Compass as Globe,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { createClientBrowser } from '@/lib/supabase-browser';
import { MusicSearchService } from '@/services/MusicSearchService';
import { Artwork } from '@/components/ui/Artwork';
import { toCanonicalTrack, getArtistName } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const { history, playTrack, currentTrack } = usePlaybackStore();

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

  const categoryChips = ['All', 'Hindi', 'Bengali', 'English', 'Punjabi', 'Tamil', 'Telugu', 'Lo-fi', 'Workout'];
  const continueListeningItems = history.length > 0 ? history.slice(0, 4) : trendingTracks.slice(0, 4);

  const handleSurpriseMe = () => {
    if (trendingTracks.length > 0) {
      const picked = trendingTracks[Math.floor(Math.random() * trendingTracks.length)];
      setSurpriseTrack({
        ...picked,
        reason: `Handpicked track: ${picked.title} by ${getArtistName(picked.artist || picked.artists)}`,
      });
    }
  };

  const madeForYou = [
    {
      id: 'mix-1',
      title: 'Daily Mix 1',
      desc: 'Arijit Singh, Pritam, Shreya Ghoshal and more',
      cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/10/8d/62/108d62ce-38b4-09ec-a9b0-994c502b4d99/8902894354222.jpg/600x600bb.jpg',
    },
    {
      id: 'mix-2',
      title: 'Bengali Hits Mix',
      desc: 'Anupam Roy, Fossils, Cactus, Rupam Islam',
      cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b8/b6/a2/b8b6a22c-7a91-4475-bf59-4d69188a38a7/886444828734.jpg/600x600bb.jpg',
    },
    {
      id: 'mix-3',
      title: 'Chill & Relax',
      desc: 'Ambient, acoustic, and soft melodies for your mood',
      cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
    },
    {
      id: 'mix-4',
      title: 'Pop & EDM Beats',
      desc: 'The Weeknd, Dua Lipa, Calvin Harris, Martin Garrix',
      cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
    },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 space-y-12 bg-transparent text-[#F4F1F7] font-sans select-none pb-36 max-w-[1650px] mx-auto relative z-10">
      
      {/* ── 1. HERO GREETING & CATEGORY CHIPS ── */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] text-[10px] font-mono font-black uppercase tracking-[0.2em] mb-2">
              <Sparkles className="h-3 w-3 text-[#00F0FF]" /> NOTHING AUDIO ENGINE • (01)
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight flex items-center gap-3 font-mono">
              {greeting}, <span className="text-[#00F0FF] font-sans">{userName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-white/60 font-medium pt-1">
              High-contrast, minimal music streaming powered by canonical audio providers.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => router.push('/jam')}
              className="nothing-btn-primary px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Zap className="h-4 w-4" /> Sound Rift Jam
            </button>
          </div>
        </div>

        {/* Scrollable Category Chips */}
        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none pt-1">
          {categoryChips.map((chip) => {
            const isSelected = selectedCategory === chip;
            return (
              <button
                key={chip}
                onClick={() => setSelectedCategory(chip)}
                className={`px-5 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#00F0FF] text-black font-extrabold shadow-md border border-[#00F0FF]'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 hover:border-[#00F0FF]/40'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. CONTINUE LISTENING ── */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <span className="text-[#00D4FF] font-mono font-bold">🕸️</span> Continue Listening
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {continueListeningItems.map((item) => (
            <div
              key={item.id}
              onClick={() => playTrack(toCanonicalTrack({
                id: item.id,
                title: item.title,
                artist: item.artist,
                coverUrl: item.cover || item.artworkUrl,
                durationMs: item.durationMs,
                sourceType: 'youtube',
              }))}
              className="p-3.5 rounded-2xl bg-[#0D101C]/80 border border-white/10 hover:border-[#00D4FF]/50 hover:bg-white/5 flex items-center gap-3.5 cursor-pointer transition-all group shadow-md"
            >
              <Artwork 
                source={item.cover || item.artworkUrl || item.coverUrl} 
                size="medium" 
                alt={item.title} 
                canonicalId={item.id} 
                className="h-14 w-14 rounded-xl flex-shrink-0 border border-white/15 group-hover:scale-105 transition-transform object-cover" 
              />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="text-xs font-black text-white truncate group-hover:text-[#00D4FF] transition-colors">{item.title}</div>
                <div className="text-[11px] text-white/60 truncate font-semibold">{getArtistName(item.artist)}</div>
                
                {/* Progress Bar */}
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#00D4FF] to-[#6D3BFF] rounded-full" style={{ width: `${item.progress || 45}%` }} />
                </div>
              </div>

              <button className="h-9 w-9 rounded-full bg-[#00D4FF] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 shadow-lg group-hover:scale-105">
                <Play className="h-4 w-4 fill-black ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. CRAFTED FOR YOUR SUIT (RECOMMENDED MIXES) ── */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <span className="text-[#FF9D00] font-mono font-bold">✨</span> Crafted for Your Suit
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {madeForYou.map((mix) => (
            <motion.div
              key={mix.id}
              whileHover={{ y: -5 }}
              onClick={() => playTrack(toCanonicalTrack({
                id: mix.id,
                title: mix.title,
                artist: mix.desc,
                coverUrl: mix.cover,
                durationMs: 240000,
                sourceType: 'youtube',
              }))}
              className="p-4 rounded-2xl bg-[#0D101C]/80 border border-white/10 hover:border-[#00D4FF]/40 space-y-3 cursor-pointer group transition-all shadow-md"
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-2xl border border-white/15 bg-black/40">
                <Artwork 
                  source={mix.cover} 
                  size="large" 
                  alt={mix.title} 
                  canonicalId={mix.id} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <button className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-[#00D4FF] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-2xl scale-95 group-hover:scale-100">
                  <Play className="h-5 w-5 fill-black ml-0.5" />
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-black text-white truncate group-hover:text-[#00D4FF] transition-colors">{mix.title}</h3>
                <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">{mix.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── 4. DIMENSIONAL SOUND RIFTS HERO BANNER ── */}
      <div className="relative p-6 sm:p-10 rounded-[32px] bg-gradient-to-br from-[#0D101C] via-[#121624] to-[#0A0D18] border border-white/15 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl overflow-hidden">
        <div className="space-y-3.5 text-center md:text-left max-w-xl relative z-10">
          <span className="text-xs font-mono font-black text-[#FF9D00] uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="h-4 w-4 text-[#FF9D00]" /> SANCTUM SANCTORUM SELECTION
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Dimensional Sound Rifts
          </h2>
          <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
            Harmonics pulled straight from Peter Parker's multiverse timeline · 24 dimension-defying tracks · 1h 45m
          </p>

          <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
            <button
              onClick={() => playTrack(toCanonicalTrack({
                id: 'fresh-discoveries-hero',
                title: 'Dimensional Sound Rifts',
                artist: 'Multiverse Collective',
                coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
                durationMs: 5500000,
                sourceType: 'youtube',
              }))}
              className="px-7 py-3 rounded-full bg-[#00D4FF] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,214,255,0.4)] hover:scale-105 transition-all"
            >
              <Play className="h-4 w-4 fill-black" /> Enter Dimension Mix
            </button>
          </div>
        </div>

        <div className="relative shrink-0">
          <div className="absolute -inset-2 bg-gradient-to-r from-[#00D4FF] via-[#6D3BFF] to-[#FF2D9A] rounded-3xl blur-xl opacity-40 animate-pulse" />
          <Artwork
            source="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80"
            size="large"
            alt="Multiverse Portal"
            className="h-48 w-48 md:h-56 md:w-56 rounded-2xl object-cover shadow-2xl border-2 border-white/20 relative z-10"
          />
        </div>
      </div>

      {/* ── 5. BECAUSE YOU LISTEN TO ARIJIT SINGH ── */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span className="text-[#00D4FF] font-mono font-bold">⚡</span> Because You Listen to Arijit Singh
          </h2>
          <p className="text-xs text-white/60">More emotional vocals and modern high-fidelity production.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {popularIndianTracks.slice(0, 4).map((tr) => (
            <div
              key={tr.canonicalId || tr.id}
              onClick={() => playTrack(tr)}
              className="p-3.5 rounded-2xl bg-[#0D101C]/80 border border-white/10 hover:border-[#00D4FF]/40 hover:bg-white/5 flex items-center gap-3.5 cursor-pointer transition-all group shadow-md"
            >
              <Artwork
                source={tr.artworkUrl || tr.coverUrl}
                size="small"
                canonicalId={tr.canonicalId || tr.id}
                type="track"
                className="h-12 w-12 rounded-xl flex-shrink-0 border border-white/15 object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-white truncate group-hover:text-[#00D4FF] transition-colors">{tr.title}</div>
                <div className="text-[11px] text-white/60 truncate font-semibold">{getArtistName(tr.artists || tr.artist)}</div>
              </div>
              <button className="h-8 w-8 rounded-full bg-[#00D4FF] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <Play className="h-4 w-4 fill-black ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. SOUND DIMENSIONS ── */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-mono font-bold text-[#FF9D00] uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="h-4 w-4 text-[#FF9D00]" /> NEO DIMENSION NETWORK
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Explore Sound Dimensions</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {[
            { code: 'DIMENSION 01', name: 'Bollywood Hits', genre: 'Hindi Cinema', color: '#FF2D95', icon: Flame, query: 'Arijit Singh Pritam Hits' },
            { code: 'DIMENSION 02', name: 'Punjabi Hype', genre: 'Punjabi Pop', color: '#FF9D00', icon: Zap, query: 'Diljit Dosanjh Karan Aujla' },
            { code: 'DIMENSION 03', name: 'Bengali Melodies', genre: 'Bengali Rock & Folk', color: '#00F0FF', icon: Music2, query: 'Anupam Roy Bengali Hits' },
            { code: 'DIMENSION 04', name: 'Global Pop', genre: 'International', color: '#7A3CFF', icon: Disc, query: 'Global Pop Top Hits' },
            { code: 'DIMENSION 05', name: 'Lo-Fi Chill', genre: 'Ambient & Lofi', color: '#10B981', icon: Moon, query: 'Lo-Fi Chill Beats' },
            { code: 'DIMENSION 06', name: 'Workout Energy', genre: 'Hype Trap & EDM', color: '#FF2D95', icon: Dumbbell, query: 'Gym Trap Workout' },
            { code: 'DIMENSION 07', name: 'Romance & Ballads', genre: 'Acoustic Love', color: '#FF9D00', icon: Heart, query: 'Romantic Acoustic Songs' },
            { code: 'DIMENSION 08', name: 'Deep Focus', genre: 'Brainwave Audio', color: '#00F0FF', icon: Brain, query: 'Ambient Focus Concentration' },
            { code: 'DIMENSION 09', name: 'Electronic Rave', genre: 'Synthwave & EDM', color: '#7A3CFF', icon: Radio, query: 'Synthwave Cyberpunk' },
            { code: 'DIMENSION 10', name: 'Fresh Discovery', genre: 'AI Curated', color: '#FFB700', icon: Sparkles, query: 'Fresh Discoveries Live Radio' },
          ].map((dim) => {
            const Icon = dim.icon;
            return (
              <div
                key={dim.code}
                onClick={() => router.push(`/search?q=${encodeURIComponent(dim.query)}`)}
                className="p-3.5 rounded-2xl bg-[#0D101C]/80 border border-white/10 hover:border-[#00D4FF]/40 cursor-pointer group transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-black text-white/50 group-hover:text-[#FF9D00] transition-colors">
                    {dim.code}
                  </span>
                  <div
                    className="p-1.5 rounded-lg text-black font-bold"
                    style={{ backgroundColor: dim.color }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black text-white truncate group-hover:text-[#00D4FF] transition-colors">
                    {dim.name}
                  </h3>
                  <p className="text-[10px] text-white/50 truncate font-semibold">{dim.genre}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 7. NEW RELEASES ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">New Dimension Releases</h2>

          <div className="flex items-center gap-1 bg-[#111524]/90 p-1 rounded-full border border-white/10 text-xs">
            {(['For You', 'Following', 'India', 'Global'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setNewReleaseTab(tab)}
                className={`px-3.5 py-1 rounded-full font-extrabold transition-all cursor-pointer ${
                  newReleaseTab === tab ? 'bg-[#00D4FF] text-black shadow-md' : 'text-white/60 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {newReleases.map((rel) => (
            <div
              key={rel.canonicalId || rel.id}
              onClick={() => playTrack(rel)}
              className="p-4 rounded-2xl bg-[#0D101C]/80 border border-white/10 hover:border-[#00D4FF]/40 space-y-3 cursor-pointer group transition-all shadow-md flex flex-col justify-between"
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-xl border border-white/15 bg-black/40">
                <Artwork
                  source={rel.artworkUrl || rel.coverUrl}
                  size="large"
                  canonicalId={rel.canonicalId || rel.id}
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
                <h3 className="text-xs sm:text-sm font-black text-white truncate group-hover:text-[#00D4FF] transition-colors">{rel.title}</h3>
                <p className="text-[11px] text-white/60 truncate font-semibold">{getArtistName(rel.artists || rel.artist)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 8. TRENDING HITS ── */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Spider-Sense Trending Hits</h2>

        <div className="p-4 rounded-3xl bg-[#0D101C]/80 border border-white/10 divide-y divide-white/5 shadow-xl">
          {trendingTracks.map((tr, idx) => (
            <div
              key={tr.canonicalId || tr.id}
              onClick={() => playTrack(tr)}
              className="flex items-center justify-between py-3 px-3 hover:bg-white/5 rounded-xl transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-sm font-mono font-black text-[#FF9D00] w-6 text-center">0{idx + 1}</span>
                <Artwork
                  source={tr.artworkUrl || tr.coverUrl}
                  size="small"
                  canonicalId={tr.canonicalId || tr.id}
                  type="track"
                  className="h-11 w-11 rounded-xl flex-shrink-0 border border-white/15 object-cover"
                />
                <div className="min-w-0">
                  <div className="text-xs font-black text-white group-hover:text-[#00D4FF] transition-colors truncate">{tr.title}</div>
                  <div className="text-[11px] text-white/60 truncate font-semibold">{getArtistName(tr.artists || tr.artist)}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                {tr.duration > 0 && (
                  <span className="text-xs font-mono text-white/60 font-bold hidden sm:inline">
                    {Math.floor(tr.duration / 60)}:{String(tr.duration % 60).padStart(2, '0')}
                  </span>
                )}
                <button className="h-8 w-8 rounded-full bg-[#00D4FF] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-4 w-4 fill-black ml-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 9. ARTISTS SECTION ── */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Popular Dimension Artists</h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: 'Arijit Singh', avatar: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/10/8d/62/108d62ce-38b4-09ec-a9b0-994c502b4d99/8902894354222.jpg/600x600bb.jpg' },
            { name: 'The Weeknd', avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80' },
            { name: 'Shreya Ghoshal', avatar: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b8/b6/a2/b8b6a22c-7a91-4475-bf59-4d69188a38a7/886444828734.jpg/600x600bb.jpg' },
            { name: 'Diljit Dosanjh', avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80' },
          ].map((art) => (
            <div
              key={art.name}
              onClick={() => router.push(`/artists/${encodeURIComponent(art.name.toLowerCase().replace(/\s+/g, '-'))}`)}
              className="p-4 rounded-2xl bg-[#0D101C]/80 border border-white/10 hover:border-[#00D4FF]/40 flex items-center gap-3.5 cursor-pointer transition-all group shadow-md"
            >
              <Artwork 
                source={art.avatar} 
                size="small" 
                aspectRatio="circle" 
                alt={art.name} 
                type="artist" 
                className="h-12 w-12 rounded-full flex-shrink-0 border-2 border-[#00D4FF]/60 object-cover" 
              />
              <div className="min-w-0">
                <div className="text-xs font-black text-white group-hover:text-[#00D4FF] transition-colors truncate">{art.name}</div>
                <div className="text-[10px] text-[#FF9D00] font-extrabold uppercase">Artist</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 10. SPIDER-SENSE SURPRISE TRACK ── */}
      <div className="p-6 rounded-[28px] bg-[#0D101C]/90 border border-[#FF9D00]/40 space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-[#FF9D00] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#FF9D00]" /> SPIDER-SENSE RANDOMIZER
            </span>
            <h3 className="text-xl font-black text-white">✨ Spider-Sense Surprise Track</h3>
            <p className="text-xs text-white/60">Detect hidden audio anomalies across the multiverse.</p>
          </div>

          <button
            onClick={handleSurpriseMe}
            className="px-6 py-2.5 rounded-full bg-[#00D4FF] text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shrink-0 shadow-[0_0_18px_rgba(0,214,255,0.4)] hover:scale-105 transition-all"
          >
            <Sparkles className="h-4 w-4" /> Trigger Spider-Sense
          </button>
        </div>

        {surpriseTrack && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-[#111524] border border-[#00D4FF]/40 flex items-center justify-between gap-4 shadow-xl"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Artwork source={surpriseTrack.coverUrl || surpriseTrack.artworkUrl} size="small" alt={surpriseTrack.title} canonicalId={surpriseTrack.id} className="h-12 w-12 rounded-xl flex-shrink-0 border border-white/20 object-cover" />
              <div className="min-w-0">
                <div className="text-xs font-black text-white truncate">{surpriseTrack.title}</div>
                <div className="text-[11px] text-[#00D4FF] font-bold truncate">{getArtistName(surpriseTrack.artist || surpriseTrack.artists)}</div>
                <div className="text-[10px] text-white/60 pt-0.5 truncate">{surpriseTrack.reason}</div>
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
              className="h-10 w-10 rounded-full bg-[#00D4FF] text-black flex items-center justify-center flex-shrink-0 shadow-lg cursor-pointer hover:scale-105"
            >
              <Play className="h-5 w-5 fill-black ml-0.5" />
            </button>
          </motion.div>
        )}
      </div>

      {/* ── 11. FOOTER ── */}
      <footer className="pt-10 border-t border-white/10 text-white/50 text-xs font-medium space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm text-white tracking-widest uppercase">NEOTUNES</span>
            <span className="text-[10px] font-mono text-[#00D4FF] border border-[#00D4FF]/40 px-2 py-0.5 rounded-full">v2.5</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-white/60 text-xs font-semibold">
            <button onClick={() => router.push('/about')} className="hover:text-white transition-colors cursor-pointer">About</button>
            <button onClick={() => router.push('/terms')} className="hover:text-white transition-colors cursor-pointer">Terms</button>
            <button onClick={() => router.push('/privacy')} className="hover:text-white transition-colors cursor-pointer">Privacy</button>
            <button onClick={() => router.push('/help')} className="hover:text-white transition-colors cursor-pointer">Support</button>
          </div>
        </div>

        <div className="text-center sm:text-left text-[11px] text-white/40 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© 2026 NeoTunes Music System. High-fidelity audio powered by canonical metadata resolution.</p>
          <div className="flex items-center gap-1 text-[10px] font-mono text-white/50">
            <ShieldCheck className="h-3.5 w-3.5 text-[#00D4FF]" /> <span>Verified Sound Engine</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
