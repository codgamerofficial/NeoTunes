'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlayerStore';
import { 
  Play, 
  Sparkles, 
  Flame, 
  Heart, 
  Compass, 
  ArrowRight, 
  ChevronRight, 
  Zap, 
  Dumbbell, 
  Moon, 
  Coffee, 
  PartyPopper, 
  Plane, 
  Smile,
  Radio,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

import Immersive3DCarousel from '@/components/home/Immersive3DCarousel';
import BottomFeaturesGrid from '@/components/home/BottomFeaturesGrid';
import PlatformFooterBar from '@/components/navigation/PlatformFooterBar';
import EqualizerModal from '@/components/player/EqualizerModal';
import AudioQualityModal from '@/components/player/AudioQualityModal';

export default function HomePage() {
  const router = useRouter();
  const { playTrack } = usePlayerStore();
  const [selectedMood, setSelectedMood] = useState('All');

  const moodChips = [
    { label: 'All', icon: null },
    { label: 'Music', icon: Zap },
    { label: 'Podcasts', icon: Radio },
    { label: 'Live', icon: Activity },
    { label: 'Mood', icon: Smile },
    { label: 'Workout', icon: Dumbbell },
    { label: 'Focus', icon: Moon },
  ];

  const madeForYou = [
    { id: '1', title: 'Daily Mix 1', desc: 'Arijit Singh, PRATEEK...', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80' },
    { id: '2', title: 'Daily Mix 2', desc: 'Karan Aujla, Shubh...', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80' },
    { id: '3', title: 'Daily Mix 3', desc: 'The Weeknd, Dua Lipa...', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80' },
    { id: '4', title: 'Daily Mix 4', desc: 'Imagine Dragons...', cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&q=80' },
    { id: '5', title: 'Daily Mix 5', desc: 'AP Dhillon, Gurinder...', cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&q=80' },
    { id: '6', title: 'Daily Mix 6', desc: 'Coldplay, Ed Sheeran...', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80' },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 space-y-10 bg-[#05030A] text-white font-sans select-none pb-40">
      
      {/* ── 1. GREETING & CATEGORY FILTER PILLS ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              Good Evening, Saswata 👋
            </h1>
            <p className="text-xs sm:text-sm text-white/50 font-medium pt-0.5">
              Let the music heal your soul.
            </p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1">
          {moodChips.map((chip) => {
            const isSelected = selectedMood === chip.label;
            const Icon = chip.icon;
            return (
              <button
                key={chip.label}
                onClick={() => setSelectedMood(chip.label)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#7A3CFF] to-[#00D4FF] text-black shadow-[0_0_15px_rgba(122,60,255,0.4)]'
                    : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. TOP 3D EXPLORE STAGE CAROUSEL ── */}
      <Immersive3DCarousel />

      {/* ── 3. MADE FOR YOU SECTION ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-white tracking-tight">
            Made For You
          </h2>
          <button className="text-xs font-bold text-[#00D4FF] hover:underline cursor-pointer">
            See All
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {madeForYou.map((mix) => (
            <motion.div
              key={mix.id}
              whileHover={{ y: -6 }}
              onClick={() => playTrack({
                id: mix.id,
                title: mix.title,
                artist: mix.desc,
                coverUrl: mix.cover,
                durationMs: 210000,
                sourceType: 'youtube',
              })}
              className="glass-card-v2 p-3 rounded-2xl border border-white/10 space-y-2.5 cursor-pointer group hover:border-[#00D4FF]/40 transition-all"
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-lg border border-white/10">
                <img src={mix.cover} alt={mix.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <button className="absolute bottom-2 right-2 h-9 w-9 rounded-full bg-[#00D4FF] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <Play className="h-4 w-4 fill-black ml-0.5" />
                </button>
              </div>

              <div className="space-y-0.5">
                <h3 className="text-xs font-black text-white truncate group-hover:text-[#00D4FF] transition-colors">{mix.title}</h3>
                <p className="text-[10px] text-white/50 truncate font-medium">{mix.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── 4. BOTTOM 4 INTERACTIVE FEATURES GRID ── */}
      <BottomFeaturesGrid />

      {/* ── 5. PLATFORM FOOTER BADGES BAR ── */}
      <PlatformFooterBar />

    </div>
  );
}
