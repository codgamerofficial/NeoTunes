'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Play, Compass, Flame, Radio, Sparkles, Music, Disc, TrendingUp, Headphones, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const GENRES = [
  { id: 'pop', title: 'Pop & Chart', bg: 'from-pink-600 to-purple-800', count: '1,240 tracks', icon: '🎵', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80' },
  { id: 'hiphop', title: 'Hip-Hop & Rap', bg: 'from-[#00D4FF] to-blue-900', count: '980 tracks', icon: '🎤', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80' },
  { id: 'lofi', title: 'Lo-Fi Coding Beats', bg: 'from-emerald-600 to-teal-900', count: '850 tracks', icon: '☕', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80' },
  { id: 'classical', title: 'Classical & Ambient', bg: 'from-amber-600 to-orange-900', count: '620 tracks', icon: '🎻', cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80' },
  { id: 'rock', title: 'Rock & Alternative', bg: 'from-red-600 to-rose-900', count: '1,100 tracks', icon: '🎸', cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80' },
  { id: 'electronic', title: 'EDM & Synthwave', bg: 'from-purple-600 to-indigo-900', count: '1,450 tracks', icon: '⚡', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80' },
  { id: 'jazz', title: 'Smooth Jazz', bg: 'from-cyan-600 to-blue-800', count: '430 tracks', icon: '🎷', cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80' },
  { id: 'rb', title: 'R&B & Soul', bg: 'from-fuchsia-600 to-pink-900', count: '740 tracks', icon: '💜', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&q=80' },
];

const MOODS = [
  { id: 'focus', title: 'Deep Focus Coding', desc: 'Instrumental ambient soundscapes for flow state', icon: Sparkles, color: 'text-[#00D4FF]', bg: 'bg-[#00D4FF]' },
  { id: 'chill', title: 'Late Night Chill', desc: 'Smooth beats and acoustic rhythms', icon: Compass, color: 'text-[#7A3CFF]', bg: 'bg-[#7A3CFF]' },
  { id: 'workout', title: 'High Energy Workout', desc: '140+ BPM driving beats to push your limits', icon: Flame, color: 'text-[#FF2D95]', bg: 'bg-[#FF2D95]' },
  { id: 'rain', title: 'Rainy Day Acoustics', desc: 'Warm piano and intimate vocal tones', icon: Radio, color: 'text-[#10B981]', bg: 'bg-[#10B981]' },
];

const NEW_RELEASES = [
  { id: 'nr-1', title: 'Midnight Hour', artist: 'The Weeknd', cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80' },
  { id: 'nr-2', title: 'Aura', artist: 'Dua Lipa', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80' },
  { id: 'nr-3', title: 'Sunset Drive', artist: 'AP Dhillon', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80' },
  { id: 'nr-4', title: 'Ocean Eyes Remix', artist: 'Billie Eilish', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80' },
  { id: 'nr-5', title: 'Tum Se Hi', artist: 'Arijit Singh', cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80' },
];

export default function BrowsePage() {
  const router = useRouter();
  const { playTrack } = usePlayerStore();

  return (
    <div className="p-6 md:p-10 space-y-10 bg-[#050505] text-white font-sans select-none pb-36">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Compass className="h-8 w-8 text-[#00D4FF]" /> Browse
        </h1>
        <p className="text-sm text-white/50 mt-1">Explore curated categories, top charts, and specialized audio mixes.</p>
      </div>

      {/* Mood Mixes */}
      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/60 flex items-center gap-2">
          <Headphones className="h-4 w-4" /> Curated Mood Mixes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOODS.map((mood) => {
            const Icon = mood.icon;
            return (
              <motion.div
                key={mood.id}
                whileHover={{ y: -3 }}
                onClick={() => router.push(`/search?q=${encodeURIComponent(mood.title)}`)}
                className="p-5 rounded-[24px] bg-[#0E1117] border border-white/8 hover:border-[#00D4FF]/30 cursor-pointer transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl ${mood.bg}/15 ${mood.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <button className={`h-9 w-9 rounded-full ${mood.bg} text-black flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-lg transition-all`}>
                    <Play className="h-4 w-4 fill-black translate-x-0.5" />
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#00D4FF] transition-colors">{mood.title}</h3>
                  <p className="text-xs text-white/40 mt-1 line-clamp-2">{mood.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* New Releases */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/60 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> New Releases
          </h2>
          <button onClick={() => router.push('/search?q=new+releases')} className="text-xs font-bold text-white/30 hover:text-[#00D4FF] flex items-center gap-1 transition-colors">
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
              className="p-3.5 rounded-[24px] bg-[#0E1117] border border-white/8 hover:border-[#00D4FF]/30 cursor-pointer transition-all space-y-3 group"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <img src={nr.cover} alt={nr.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="p-3 rounded-full bg-[#00D4FF] text-black shadow-[0_0_15px_#00D4FF]">
                    <Play className="h-4 w-4 fill-black ml-0.5" />
                  </div>
                </div>
              </div>
              <div>
                <div className="font-bold text-xs text-white group-hover:text-[#00D4FF] truncate transition-colors">{nr.title}</div>
                <div className="text-[11px] text-white/40 truncate mt-0.5">{nr.artist}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Genres Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white/60 flex items-center gap-2">
          <Disc className="h-4 w-4" /> Genres & Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {GENRES.map((g) => (
            <div
              key={g.id}
              onClick={() => router.push(`/search?q=${encodeURIComponent(g.title)}`)}
              className={`relative h-40 rounded-[24px] overflow-hidden cursor-pointer group shadow-lg border border-white/8 bg-gradient-to-br ${g.bg}`}
            >
              <img src={g.cover} alt={g.title} className="absolute inset-0 h-full w-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10 p-5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{g.icon}</span>
                  <span className="text-[9px] font-mono font-bold text-white/70 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {g.count}
                  </span>
                </div>
                <h3 className="text-base font-black text-white tracking-tight leading-snug">{g.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
