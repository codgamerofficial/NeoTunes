'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePlaybackStore } from '@/store/playback-store';
import { Play, Compass, Flame, Radio, Sparkles, Music, Disc, TrendingUp, Headphones, ChevronRight, ListPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const GENRES = [
  { id: 'pop', title: 'Pop & Chart', icon: '🎵', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80' },
  { id: 'hiphop', title: 'Hip-Hop & Rap', icon: '🎤', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80' },
  { id: 'lofi', title: 'Lo-Fi Coding Beats', icon: '☕', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80' },
  { id: 'classical', title: 'Classical & Ambient', icon: '🎻', cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80' },
  { id: 'rock', title: 'Rock & Alternative', icon: '🎸', cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80' },
  { id: 'electronic', title: 'EDM & Synthwave', icon: '⚡', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80' },
  { id: 'jazz', title: 'Smooth Jazz', icon: '🎷', cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80' },
  { id: 'rb', title: 'R&B & Soul', icon: '💜', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80' },
];

const MOODS = [
  { id: 'focus', title: 'Deep Focus Coding', desc: 'Instrumental ambient soundscapes for flow state', icon: Sparkles },
  { id: 'chill', title: 'Late Night Chill', desc: 'Smooth beats and acoustic rhythms', icon: Compass },
  { id: 'workout', title: 'High Energy Workout', desc: 'Driving beats to push your physical limits', icon: Flame },
  { id: 'rain', title: 'Rainy Day Acoustics', desc: 'Warm piano and intimate vocal tones', icon: Radio },
];

const NEW_RELEASES = [
  { id: 'nr-1', title: 'Midnight Hour', artist: 'The Weeknd', date: '2026', cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80' },
  { id: 'nr-2', title: 'Aura', artist: 'Dua Lipa', date: '2026', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80' },
  { id: 'nr-3', title: 'Sunset Drive', artist: 'AP Dhillon', date: '2026', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80' },
  { id: 'nr-4', title: 'Ocean Eyes Remix', artist: 'Billie Eilish', date: '2026', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80' },
  { id: 'nr-5', title: 'Tum Se Hi', artist: 'Arijit Singh', date: '2026', cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80' },
];

const CHARTS = [
  { rank: '01', title: 'Kesariya', artist: 'Arijit Singh', album: 'Brahmāstra' },
  { rank: '02', title: 'Chaleya', artist: 'Anirudh Ravichander', album: 'Jawan' },
  { rank: '03', title: 'Patar Bashori', artist: 'Sunidhi Chauhan', album: 'Single' },
  { rank: '04', title: 'Starboy', artist: 'The Weeknd', album: 'Starboy' },
];

export default function BrowsePage() {
  const router = useRouter();
  const { playTrack, addToQueue } = usePlaybackStore();

  return (
    <div className="p-6 md:p-10 space-y-10 bg-[#000000] text-[#F4F1F7] font-sans select-none pb-36 min-h-screen">
      
      {/* ── HEADER ── */}
      <div className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
          <Compass className="h-8 w-8 text-[#AFC7FF]" /> Browse
        </h1>
        <p className="text-sm text-[#A8A7AF]">Find something worth listening to.</p>
      </div>

      {/* ── SECTION 1: MOOD & ACTIVITY ── */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#AFC7FF] flex items-center gap-2">
          <Headphones className="h-4 w-4" /> Mood &amp; Activity
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOODS.map((mood) => {
            const Icon = mood.icon;
            return (
              <motion.div
                key={mood.id}
                whileHover={{ y: -3 }}
                onClick={() => router.push(`/search?q=${encodeURIComponent(mood.title)}`)}
                className="p-5 rounded-3xl bg-[#121318] border border-white/10 hover:border-[#AFC7FF]/40 cursor-pointer transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-2xl bg-white/5 text-[#AFC7FF]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <button className="h-9 w-9 rounded-full bg-[#AFC7FF] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-md transition-all">
                    <Play className="h-4 w-4 fill-black ml-0.5" />
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#AFC7FF] transition-colors">{mood.title}</h3>
                  <p className="text-xs text-[#A8A7AF] mt-1 line-clamp-2">{mood.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 2: NEW RELEASES ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#AFC7FF] flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> New Releases
          </h2>
          <button onClick={() => router.push('/search?q=new+releases')} className="text-xs font-bold text-[#A8A7AF] hover:text-[#AFC7FF] flex items-center gap-1 transition-colors">
            See All <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {NEW_RELEASES.map((nr) => (
            <motion.div
              key={nr.id}
              whileHover={{ y: -4 }}
              onClick={() => playTrack({
                id: nr.id,
                title: nr.title,
                artist: { id: 'a', name: nr.artist },
                coverUrl: nr.cover,
                durationMs: 210000,
                sourceType: 'youtube',
              })}
              className="p-3.5 rounded-3xl bg-[#121318] border border-white/10 hover:border-[#AFC7FF]/40 cursor-pointer transition-all space-y-3 group"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <img src={nr.cover} alt={nr.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="p-3 rounded-full bg-[#AFC7FF] text-black shadow-lg">
                    <Play className="h-4 w-4 fill-black ml-0.5" />
                  </div>
                </div>
              </div>
              <div>
                <div className="font-bold text-xs text-white group-hover:text-[#AFC7FF] truncate transition-colors">{nr.title}</div>
                <div className="text-[11px] text-[#A8A7AF] truncate mt-0.5">{nr.artist} · {nr.date}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── SECTION 3: TOP CHARTS ── */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#AFC7FF] flex items-center gap-2">
          <Music className="h-4 w-4" /> Top Charts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CHARTS.map((c, idx) => (
            <div
              key={c.rank}
              onClick={() => playTrack({
                id: `chart-${idx}`,
                title: c.title,
                artist: { id: 'a', name: c.artist },
                coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80',
                durationMs: 200000,
                sourceType: 'youtube',
              })}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#121318] border border-white/10 hover:border-[#AFC7FF]/40 cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span className="text-sm font-mono font-black text-[#AFC7FF] w-6">{c.rank}</span>
                <div className="min-w-0">
                  <div className="font-bold text-xs text-white group-hover:text-[#AFC7FF] truncate transition-colors">{c.title}</div>
                  <div className="text-[11px] text-[#A8A7AF] truncate">{c.artist} · {c.album}</div>
                </div>
              </div>
              <button className="h-8 w-8 rounded-full bg-[#AFC7FF] text-black flex items-center justify-center shrink-0 ml-2 shadow-md">
                <Play className="h-4 w-4 fill-black ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 4: GENRES ── */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#AFC7FF] flex items-center gap-2">
          <Disc className="h-4 w-4" /> Genres &amp; Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {GENRES.map((g) => (
            <div
              key={g.id}
              onClick={() => router.push(`/search?q=${encodeURIComponent(g.title)}`)}
              className="relative h-32 rounded-3xl overflow-hidden cursor-pointer group shadow-lg border border-white/10 bg-[#121318]"
            >
              <img src={g.cover} alt={g.title} className="absolute inset-0 h-full w-full object-cover opacity-25 group-hover:scale-105 transition-transform duration-500" />
              <div className="relative z-10 p-5 flex flex-col justify-between h-full">
                <span className="text-2xl">{g.icon}</span>
                <h3 className="text-sm font-bold text-white group-hover:text-[#AFC7FF] transition-colors">{g.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
