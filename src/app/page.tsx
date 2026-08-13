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

export default function HomePage() {
  const router = useRouter();
  const { playTrack, addToQueue, currentTrack } = usePlaybackStore();

  const [greeting, setGreeting] = useState('Good Evening');
  const [userName, setUserName] = useState('Saswata');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [newReleaseTab, setNewReleaseTab] = useState<'For You' | 'Following' | 'India' | 'Global'>('For You');
  const [surpriseTrack, setSurpriseTrack] = useState<any | null>(null);
  const [savedDiscover, setSavedDiscover] = useState(false);

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

  // Category Chips (Spec 6)
  const categoryChips = ['All', 'Hindi', 'Bengali', 'English', 'Punjabi', 'Tamil', 'Telugu', 'Lo-fi', 'Workout'];

  // Continue Listening Data (Spec 7)
  const continueListeningItems = [
    { id: 'cl1', title: 'Kesariya', artist: 'Arijit Singh, Pritam', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80', progress: 68, durationMs: 268000 },
    { id: 'cl2', title: 'Late Night Drive', artist: '24 songs', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80', progress: 42, durationMs: 240000 },
    { id: 'cl3', title: 'Bengali Romance', artist: 'Playlist', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80', progress: 76, durationMs: 220000 },
    { id: 'cl4', title: 'Patar Bashori', artist: 'Ishaan, Sunidhi Chauhan', cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80', progress: 30, durationMs: 210000 },
  ];

  // Made For You Data (Spec 8)
  const madeForYou = [
    { id: 'mfy1', title: 'Discover Weekly', desc: 'Your custom Monday mix of fresh music.', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80' },
    { id: 'mfy2', title: 'Neo Mix', desc: 'AI-curated blend based on your late-night listening.', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80' },
    { id: 'mfy3', title: 'Bengali Romantic Radio', desc: 'Arijit Singh, Anupam Roy, Shreya Ghoshal', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80' },
    { id: 'mfy4', title: 'New Music Radar', desc: 'Catch every brand new release from artists you follow.', cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80' },
  ];

  // Because You Listen To Arijit Singh Data (Spec 11)
  const becauseYouListenTo = [
    { id: 'byl1', title: 'Shayad', artist: 'Arijit Singh, Pritam', cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80', durationMs: 247000 },
    { id: 'byl2', title: 'Chaleya', artist: 'Arijit Singh, Shilpa Rao', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80', durationMs: 200000 },
    { id: 'byl3', title: 'Heeriye', artist: 'Jasleen Royal, Arijit Singh', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80', durationMs: 195000 },
    { id: 'byl4', title: 'Tujhe Kitna Chahne Lage', artist: 'Arijit Singh, Mithoon', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80', durationMs: 284000 },
  ];

  // Mood Grid Data (Spec 14)
  const moods = [
    { label: 'Late Night', icon: Moon, desc: 'Mellow acoustic & lo-fi' },
    { label: 'Energy', icon: Zap, desc: 'High BPM hype tracks' },
    { label: 'Romance', icon: Heart, desc: 'Soulful vocal ballads' },
    { label: 'Focus', icon: Brain, desc: 'Instrumental concentration' },
    { label: 'Rainy', icon: CloudRain, desc: 'Warm acoustic acoustic' },
    { label: 'Drive', icon: Car, desc: 'Synthwave & road trips' },
    { label: 'Workout', icon: Dumbbell, desc: 'Heavy bass gym hits' },
    { label: 'Morning', icon: Sun, desc: 'Upbeat acoustic sunrise' },
  ];

  // New Releases (Spec 15)
  const newReleases = [
    { id: 'nr1', title: 'Patar Bashori', artist: 'Ishaan, Sunidhi Chauhan', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80', tag: 'Single' },
    { id: 'nr2', title: 'Softly', artist: 'Karan Aujla, Ikky', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80', tag: 'Album' },
    { id: 'nr3', title: 'One Love', artist: 'Shubh', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80', tag: 'Single' },
    { id: 'nr4', title: 'Starboy 2026', artist: 'The Weeknd', cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80', tag: 'Album' },
  ];

  // Trending Ranked List (Spec 16)
  const trendingList = [
    { rank: '01', id: 'tr1', title: 'Kesariya', artist: 'Arijit Singh, Pritam', duration: '4:28', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80' },
    { rank: '02', id: 'tr2', title: 'Chaleya', artist: 'Arijit Singh, Shilpa Rao', duration: '3:20', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80' },
    { rank: '03', id: 'tr3', title: 'Pasoori', artist: 'Ali Sethi, Shae Gill', duration: '3:44', cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=200&q=80' },
    { rank: '04', id: 'tr4', title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80' },
    { rank: '05', id: 'tr5', title: 'Heeriye', artist: 'Jasleen Royal, Arijit Singh', duration: '3:15', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&q=80' },
  ];

  // Followed Artists (Spec 17)
  const userArtists = [
    { name: 'Arijit Singh', avatar: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=200&q=80' },
    { name: 'The Weeknd', avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80' },
    { name: 'Shreya Ghoshal', avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&q=80' },
    { name: 'Diljit Dosanjh', avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80' },
  ];

  const handleSurpriseMe = () => {
    const surprises = [
      { id: 'sur1', title: 'Bojhena Shey Bojhena', artist: 'Arijit Singh', coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80', reason: 'You usually listen to Hindi pop. Try this Bengali indie acoustic hit!' },
      { id: 'sur2', title: 'Midnight City', artist: 'M83', coverUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80', reason: 'Stepping outside your rotation into French electronic synthpop.' },
      { id: 'sur3', title: 'Mayabono Biharini', artist: 'Somlata Acharyya', coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80', reason: 'Rabindra Sangeet fusion for your evening vibe.' }
    ];
    const picked = surprises[Math.floor(Math.random() * surprises.length)];
    setSurpriseTrack(picked);
  };

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
              onClick={() => playTrack({
                id: item.id,
                title: item.title,
                artist: item.artist,
                coverUrl: item.cover,
                durationMs: item.durationMs,
                sourceType: 'youtube',
              })}
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
              onClick={() => playTrack({
                id: mix.id,
                title: mix.title,
                artist: mix.desc,
                coverUrl: mix.cover,
                durationMs: 240000,
                sourceType: 'youtube',
              })}
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
              onClick={() => playTrack({
                id: 'fresh-discoveries-hero',
                title: 'Fresh Discoveries',
                artist: 'Various Artists',
                coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
                durationMs: 5500000,
                sourceType: 'youtube',
              })}
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
          {becauseYouListenTo.map((tr) => (
            <div
              key={tr.id}
              onClick={() => playTrack({
                id: tr.id,
                title: tr.title,
                artist: tr.artist,
                coverUrl: tr.cover,
                durationMs: tr.durationMs,
                sourceType: 'youtube',
              })}
              className="p-3 rounded-2xl bg-[#121318] hover:bg-[#17181D] border border-white/10 flex items-center gap-3.5 cursor-pointer transition-all group"
            >
              <img src={tr.cover} alt={tr.title} className="h-12 w-12 rounded-xl object-cover flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate group-hover:text-[#AFC7FF] transition-colors">{tr.title}</div>
                <div className="text-[11px] text-[#A8A7AF] truncate">{tr.artist}</div>
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
          <p className="text-xs text-[#A8A7AF]">20 songs · 1h 18m</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => playTrack({
              id: 'neo-discover-signature',
              title: 'Neo Discover',
              artist: 'NeoTunes AI Curator',
              coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80',
              durationMs: 4680000,
              sourceType: 'youtube',
            })}
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
                onClick={() => router.push(`/search?q=${encodeURIComponent(m.label)}`)}
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
              key={rel.id}
              onClick={() => playTrack({
                id: rel.id,
                title: rel.title,
                artist: rel.artist,
                coverUrl: rel.cover,
                durationMs: 210000,
                sourceType: 'youtube',
              })}
              className="p-4 rounded-2xl bg-[#121318] hover:bg-[#17181D] border border-white/10 space-y-3 cursor-pointer group transition-all"
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-lg border border-white/10">
                <img src={rel.cover} alt={rel.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/60 text-white border border-white/20">
                  {rel.tag}
                </span>
                <button className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-[#AFC7FF] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <Play className="h-4 w-4 fill-black ml-0.5" />
                </button>
              </div>

              <div className="space-y-1">
                <h3 className="text-xs font-bold text-white truncate group-hover:text-[#AFC7FF] transition-colors">{rel.title}</h3>
                <p className="text-[11px] text-[#A8A7AF] truncate">{rel.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 9. TRENDING NOW (COMPACT RANKED LIST) ── */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-white tracking-tight">Trending now</h2>

        <div className="p-4 rounded-3xl bg-[#121318] border border-white/10 divide-y divide-white/5">
          {trendingList.map((tr) => (
            <div
              key={tr.id}
              onClick={() => playTrack({
                id: tr.id,
                title: tr.title,
                artist: tr.artist,
                coverUrl: tr.cover,
                durationMs: 220000,
                sourceType: 'youtube',
              })}
              className="flex items-center justify-between py-3 px-2 hover:bg-white/5 rounded-xl transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-sm font-mono font-black text-[#AFC7FF] w-6 text-center">{tr.rank}</span>
                <img src={tr.cover} alt={tr.title} className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white group-hover:text-[#AFC7FF] transition-colors truncate">{tr.title}</div>
                  <div className="text-[11px] text-[#A8A7AF] truncate">{tr.artist}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="text-xs font-mono text-[#A8A7AF] font-bold hidden sm:inline">{tr.duration}</span>
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
          {userArtists.map((art) => (
            <div
              key={art.name}
              onClick={() => router.push(`/search?q=${encodeURIComponent(art.name)}`)}
              className="p-4 rounded-2xl bg-[#121318] hover:bg-[#17181D] border border-white/10 flex items-center gap-3 cursor-pointer transition-all group"
            >
              <img src={art.avatar} alt={art.name} className="h-12 w-12 rounded-full object-cover flex-shrink-0 border border-white/15" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white group-hover:text-[#AFC7FF] transition-colors truncate">{art.name}</div>
                <div className="text-[10px] text-[#AFC7FF] font-bold">Following</div>
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
              onClick={() => playTrack({
                id: surpriseTrack.id,
                title: surpriseTrack.title,
                artist: surpriseTrack.artist,
                coverUrl: surpriseTrack.coverUrl,
                durationMs: 210000,
                sourceType: 'youtube',
              })}
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
